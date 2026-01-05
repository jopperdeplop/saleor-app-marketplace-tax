import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "@/lib/saleor-app";

export const POST = createAppRegisterHandler(saleorApp);
