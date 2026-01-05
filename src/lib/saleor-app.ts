// Saleor App SDK v1.5.0 Compatibility Layer
import { SaleorApp } from "@saleor/app-sdk/saleor-app";
import { PrismaAPL } from "@/lib/prisma-apl";

export const saleorApp = new SaleorApp({
  apl: new PrismaAPL(),
});

