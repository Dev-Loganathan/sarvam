import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dns from 'node:dns';

// 1. Force IPv4 for database connections (CRITICAL for Render + Supabase)
dns.setDefaultResultOrder('ipv4first');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not defined in environment variables');
} else {
  const maskedUrl = connectionString.replace(/:([^:@]+)@/, ':****@');
  console.log('Initializing Prisma with connection string:', maskedUrl);
}

// 2. Set up the PostgreSQL Pool with SSL
const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 15000, // Increased timeout to 15s
});

// 3. Initialize the Prisma Adapter (Mandatory for Prisma 7)
const adapter = new PrismaPg(pool);

// 4. Create the Prisma Client using the adapter
export const prisma = new PrismaClient({ adapter });
