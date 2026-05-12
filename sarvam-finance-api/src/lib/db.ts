import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dns from 'node:dns/promises';

async function getIPv4ConnectionString(url: string | undefined): Promise<string | undefined> {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    // Manually resolve to IPv4 only
    const lookup = await dns.lookup(host, { family: 4 });
    console.log(`Resolved ${host} to IPv4: ${lookup.address}`);
    parsed.hostname = lookup.address;
    return parsed.toString();
  } catch (e) {
    console.error('Failed to manually resolve IPv4:', e);
    return url;
  }
}

let prisma: PrismaClient;

async function initPrisma() {
  const originalUrl = process.env.DATABASE_URL;
  const connectionString = await getIPv4ConnectionString(originalUrl);

  if (!connectionString) {
    console.error('DATABASE_URL is not defined!');
    return;
  }

  const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();
    console.log('Successfully connected to database via IPv4!');
  } catch (err) {
    console.error('FAILED to connect to database!');
    console.error('Deep Error:', JSON.stringify(err, null, 2));
  }
}

initPrisma();

export { prisma };
