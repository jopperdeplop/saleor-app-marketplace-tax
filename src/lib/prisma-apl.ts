import { APL, AuthData } from "@saleor/app-sdk/APL";
import { prisma } from "@/lib/prisma";

export class PrismaAPL implements APL {
  async get(saleorApiUrl: string): Promise<AuthData | undefined> {
    const record = await prisma.saleorApp.findUnique({
      where: { saleorApiUrl },
    });

    if (!record) {
      return undefined;
    }

    return {
      saleorApiUrl: record.saleorApiUrl,
      token: record.token,
      appId: record.appId,
      jwks: record.jwks || undefined,
    };
  }

  async set(authData: AuthData): Promise<void> {
    await prisma.saleorApp.upsert({
      where: { saleorApiUrl: authData.saleorApiUrl },
      create: {
        saleorApiUrl: authData.saleorApiUrl,
        token: authData.token,
        appId: authData.appId,
        jwks: authData.jwks,
      },
      update: {
        token: authData.token,
        appId: authData.appId,
        jwks: authData.jwks,
      },
    });
  }

  async delete(saleorApiUrl: string): Promise<void> {
    await prisma.saleorApp.delete({
      where: { saleorApiUrl },
    });
  }

  async getAll(): Promise<AuthData[]> {
    const records = await prisma.saleorApp.findMany();
    return records.map((record) => ({
      saleorApiUrl: record.saleorApiUrl,
      token: record.token,
      appId: record.appId,
      jwks: record.jwks || undefined,
    }));
  }
}
