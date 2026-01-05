import { SaleorApp } from "@saleor/app-sdk";
import { FileAPL, VercelAPL } from "@saleor/app-sdk/APL";

const getApl = () => {
  if (process.env.APL === "vercel") {
    return new VercelAPL();
  }
  return new FileAPL();
};

export const saleorApp = new SaleorApp({
  apl: getApl(),
});
