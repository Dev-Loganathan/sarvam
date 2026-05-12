import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dns from 'node:dns';

// Force IPv4 for database connections (Fixes ENETUNREACH on Render)
dns.setDefaultResultOrder('ipv4first');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not defined in environment variables');
} else {
  const maskedUrl = connectionString.replace(/:([^:@]+)@/, ':****@');
  console.log('Initializing Prisma with connection string:', maskedUrl);
}

const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000, // 10 seconds timeout
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
