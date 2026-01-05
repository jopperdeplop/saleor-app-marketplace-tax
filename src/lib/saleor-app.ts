import { SaleorApp } from "@saleor/app-sdk/saleor-app";
import { FileAPL } from "@saleor/app-sdk/APL/file";
import { VercelKvApl } from "@saleor/app-sdk/APL/vercel-kv";

const getApl = () => {
  if (process.env.APL === "vercel") {
    return new VercelKvApl();
  }
  return new FileAPL();
};

export const saleorApp = new SaleorApp({
  apl: getApl(),
});

