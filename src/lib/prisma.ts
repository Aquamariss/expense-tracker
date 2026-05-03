import dns from "dns";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function makePrisma() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    // Force IPv4: Render cannot route outbound IPv6, but Supabase DNS returns AAAA first.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lookup: (hostname: string, options: dns.LookupOptions, cb: any) => {
      dns.lookup(hostname, { ...options, family: 4 }, cb);
    },
  } as ConstructorParameters<typeof Pool>[0]);
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? makePrisma();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
