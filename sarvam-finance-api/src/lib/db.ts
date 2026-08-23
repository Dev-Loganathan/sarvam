import dotenv from 'dotenv';
dotenv.config();

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

let prismaInstance: PrismaClient;
let initPromise: Promise<PrismaClient> | null = null;

export async function getPrismaClient(): Promise<PrismaClient> {
  if (prismaInstance) return prismaInstance;
  if (!initPromise) {
    initPromise = (async () => {
      const originalUrl = process.env.DATABASE_URL;
      const connectionString = await getIPv4ConnectionString(originalUrl);

      if (!connectionString) {
        throw new Error('DATABASE_URL is not defined!');
      }

      const pool = new Pool({ 
        connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 15000,
      });

      const adapter = new PrismaPg(pool);
      prismaInstance = new PrismaClient({ adapter });
      await prismaInstance.$connect();
      console.log('Successfully connected to database via IPv4!');
      return prismaInstance;
    })();
  }
  return initPromise;
}

// Auto init on import
getPrismaClient().catch((err) => console.error('Prisma auto-init error:', err));

const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    if (!prismaInstance) {
      // If accessed before init finishes, return proxy function that waits or throws
      return (...args: any[]) => {
        return getPrismaClient().then((client) => {
          const method = (client as any)[prop];
          if (typeof method === 'function') {
            return method.apply(client, args);
          }
          return method;
        });
      };
    }
    const val = Reflect.get(prismaInstance, prop, receiver);
    return typeof val === 'function' ? val.bind(prismaInstance) : val;
  },
});

export { prisma };
