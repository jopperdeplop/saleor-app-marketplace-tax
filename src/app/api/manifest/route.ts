import { NextResponse } from "next/server";
import { AppManifest } from "@saleor/app-sdk/types";

export const GET = async () => {
  const manifest: AppManifest = {
    id: "saleor-app-marketplace-tax",
    version: "1.0.0",
    name: "Marketplace Tax & Commission",
    permissions: [
      "MANAGE_ORDERS",
      "MANAGE_PRODUCTS",
    ],
    appUrl: process.env.APP_URL || "http://localhost:3000",
    tokenTargetUrl: `${process.env.APP_URL || "http://localhost:3000"}/api/register`,
    extensions: [],
    webhooks: [],
  };

  return NextResponse.json(manifest);
};
