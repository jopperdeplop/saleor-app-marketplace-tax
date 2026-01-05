import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next-app-router";
import { saleorApp } from "@/lib/saleor-app";

export const POST = createAppRegisterHandler(saleorApp);
