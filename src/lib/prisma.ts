import dns from "dns";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Render resolves Supabase hostname to IPv6 which it can't route outbound.
// Force IPv4 so the pg pool connects via 0.0.0.0 instead of :::0.
dns.setDefaultResultOrder("ipv4first");

function makePrisma() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? makePrisma();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
