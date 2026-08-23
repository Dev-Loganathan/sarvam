import dotenv from 'dotenv';
dotenv.config();

import https from 'node:https';
import { getPrismaClient } from '../lib/db';

interface RawCity {
  id: number;
  name: string;
  latitude?: string;
  longitude?: string;
}

interface RawState {
  id: number;
  name: string;
  state_code: string;
  cities: RawCity[];
}

interface RawCountry {
  id: number;
  name: string;
  iso2: string;
  states: RawState[];
}

function fetchJson<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchJson<T>(res.headers.location).then(resolve).catch(reject);
        }
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          try {
            const buffer = Buffer.concat(chunks);
            resolve(JSON.parse(buffer.toString('utf8')));
          } catch (e) {
            reject(new Error(`Failed to parse JSON: ${e}`));
          }
        });
      })
      .on('error', reject);
  });
}

async function fetchAndSeedOnlineDistricts() {
  console.log('🌐 Fetching official India location master dataset from online repository (dr5hn)...');
  const startTime = Date.now();

  try {
    const datasetUrl = 'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/countries%2Bstates%2Bcities.json';
    console.log('⏳ Downloading master dataset (countries + states + cities)...');
    
    const allCountries = await fetchJson<RawCountry[]>(datasetUrl);
    const india = allCountries.find((c) => c.iso2 === 'IN');

    if (!india) {
      throw new Error('India (IN) record not found in downloaded dataset.');
    }

    console.log(`✅ Successfully fetched India dataset with ${india.states.length} States & Union Territories.`);

    const db = await getPrismaClient();

    // 1. Ensure India CountryMaster exists
    const countryId = 'c0a80101-0000-0000-0000-000000000091';
    await db.$executeRawUnsafe(`
      INSERT INTO "CountryMaster" (id, code, name, "isActive", "createdAt")
      VALUES ('${countryId}', 'IN', 'India', true, NOW())
      ON CONFLICT (code) DO UPDATE SET name = 'India', "isActive" = true;
    `);

    const countryResult: any[] = await db.$queryRawUnsafe(`
      SELECT id FROM "CountryMaster" WHERE code = 'IN' LIMIT 1;
    `);
    const activeCountryId = countryResult[0]?.id || countryId;

    let totalStatesInserted = 0;
    let totalDistrictsInserted = 0;

    // 2. Loop through all states and UTs in India
    for (const stateData of india.states) {
      const cleanStateName = stateData.name.replace(/'/g, "''");
      const cleanStateCode = (stateData.state_code || stateData.name.substring(0, 3).toUpperCase()).replace(/'/g, "''");

      // Check existing state by name or code
      const existing: any[] = await db.$queryRawUnsafe(`
        SELECT id FROM "StateMaster"
        WHERE "countryId" = '${activeCountryId}'
        AND (LOWER(name) = LOWER('${cleanStateName}') OR LOWER(code) = LOWER('${cleanStateCode}'))
        LIMIT 1;
      `);

      let stateDbId = existing[0]?.id;

      if (!stateDbId) {
        const stateResult: any[] = await db.$queryRawUnsafe(`
          INSERT INTO "StateMaster" (id, code, name, "countryId", "createdAt")
          VALUES (gen_random_uuid()::text, '${cleanStateCode}', '${cleanStateName}', '${activeCountryId}', NOW())
          RETURNING id;
        `);
        stateDbId = stateResult[0]?.id;
      }

      totalStatesInserted++;

      if (!stateDbId || !stateData.cities || stateData.cities.length === 0) continue;

      // 3. Extract unique city/district names for this state
      const uniqueNames = Array.from(new Set(stateData.cities.map((c) => c.name.trim()))).filter(Boolean);

      const BATCH_SIZE = 500;
      for (let i = 0; i < uniqueNames.length; i += BATCH_SIZE) {
        const batch = uniqueNames.slice(i, i + BATCH_SIZE);
        const valueTuples = batch
          .map((name) => {
            const escaped = name.replace(/'/g, "''");
            return `(gen_random_uuid()::text, '${escaped}', '${stateDbId}', NOW())`;
          })
          .join(',\n');

        // Insert into DistrictMaster
        await db.$executeRawUnsafe(`
          INSERT INTO "DistrictMaster" (id, name, "stateId", "createdAt")
          VALUES ${valueTuples}
          ON CONFLICT ("stateId", name) DO NOTHING;
        `);

        // Insert into CityMaster
        await db.$executeRawUnsafe(`
          INSERT INTO "CityMaster" (id, name, "stateId", "createdAt")
          VALUES ${valueTuples}
          ON CONFLICT ("stateId", name) DO NOTHING;
        `);

        totalDistrictsInserted += batch.length;
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n🎉 SUCCESS: Imported Online Master Dataset into Supabase!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Country: India (IN)`);
    console.log(`   - States & UTs: ${totalStatesInserted}`);
    console.log(`   - Districts & Cities: ${totalDistrictsInserted}`);
    console.log(`⏱️ Duration: ${duration} seconds`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fetching/seeding online master data:', error);
    process.exit(1);
  }
}

fetchAndSeedOnlineDistricts();
