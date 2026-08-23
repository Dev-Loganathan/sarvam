import dotenv from 'dotenv';
dotenv.config();

import { getPrismaClient } from './lib/db';

async function syncAndSeed() {
  console.log('Starting DB table synchronization...');
  
  try {
    const db = await getPrismaClient();

    // 1. Create CountryMaster table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CountryMaster" (
        "id" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CountryMaster_pkey" PRIMARY KEY ("id")
      );
    `);

    await db.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "CountryMaster_code_key" ON "CountryMaster"("code");
    `);
    await db.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "CountryMaster_name_key" ON "CountryMaster"("name");
    `);

    // 2. Create StateMaster table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "StateMaster" (
        "id" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "countryId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "StateMaster_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "StateMaster_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "CountryMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await db.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "StateMaster_countryId_code_key" ON "StateMaster"("countryId", "code");
    `);
    await db.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "StateMaster_countryId_name_key" ON "StateMaster"("countryId", "name");
    `);

    // 3. Create CityMaster table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CityMaster" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "stateId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CityMaster_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "CityMaster_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "StateMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await db.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "CityMaster_stateId_name_key" ON "CityMaster"("stateId", "name");
    `);

    // 4. Create DistrictMaster table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "DistrictMaster" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "stateId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "DistrictMaster_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "DistrictMaster_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "StateMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await db.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "DistrictMaster_stateId_name_key" ON "DistrictMaster"("stateId", "name");
    `);

    // Add country and district columns to Customer table if missing
    await db.$executeRawUnsafe(`
      ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "country" TEXT DEFAULT 'India';
      ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "district" TEXT;
    `);

    console.log('DB tables created successfully in Supabase!');
    process.exit(0);
  } catch (error) {
    console.error('Error synchronizing tables:', error);
    process.exit(1);
  }
}

syncAndSeed();
