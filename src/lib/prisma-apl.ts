import { APL, AuthData } from "@saleor/app-sdk/APL";
import { prisma } from "@/lib/prisma";

export class PrismaAPL implements APL {
  async get(saleorApiUrl: string): Promise<AuthData | undefined> {
    const record = await (prisma as any).saleorApp.findUnique({
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
    try {
      console.log("Saving auth data to Prisma:", JSON.stringify(authData, null, 2));
      await (prisma as any).saleorApp.upsert({
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
      console.log("Auth data saved successfully.");
    } catch (error) {
      console.error("Failed to save auth data to Prisma:", error);
      throw error; // Initial error was 500, we want to see the logs but still fail if DB fails
    }
  }

  async delete(saleorApiUrl: string): Promise<void> {
    await (prisma as any).saleorApp.delete({
      where: { saleorApiUrl },
    });
  }

  async getAll(): Promise<AuthData[]> {
    const records = await (prisma as any).saleorApp.findMany();
    return records.map((record: any) => ({
      saleorApiUrl: record.saleorApiUrl,
      token: record.token,
      appId: record.appId,
      jwks: record.jwks || undefined,
    }));
  }
}
