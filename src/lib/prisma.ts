import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
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
