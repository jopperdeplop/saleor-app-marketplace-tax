import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.POSTGRES_PRISMA_URL;

const prismaClientSingleton = () => {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const getPrisma = () => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const client = prismaClientSingleton();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
};

export const prisma = new Proxy({} as PrismaClientSingleton, {
  get: (target, prop) => {
    return (getPrisma() as any)[prop];
  },
});
