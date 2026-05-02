import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function makePrisma() {
  // Strip sslmode from URL — pg v8 treats sslmode=require as verify-full
  // which rejects Supabase's self-signed cert chain.
  const connectionString = (process.env.DATABASE_URL ?? "").replace(
    /([?&])sslmode=[^&]*/,
    (_, sep) => sep === "?" ? "?" : ""
  ).replace(/\?$/, "");

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? makePrisma();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
