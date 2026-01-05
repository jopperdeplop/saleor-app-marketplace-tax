import { NextResponse } from "next/server";
import { AppManifest } from "@saleor/app-sdk/types";

export const GET = async () => {
  const appBaseUrl = process.env.APP_URL
    ? process.env.APP_URL
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const manifest: AppManifest = {
    id: "saleor-app-marketplace-tax",
    version: "1.0.0",
    name: "Marketplace Tax & Commission",
    permissions: [
      "MANAGE_ORDERS",
      "MANAGE_PRODUCTS",
    ],
    appUrl: appBaseUrl,
    tokenTargetUrl: `${appBaseUrl}/api/register`,
    extensions: [],
    webhooks: [
      {
        name: "Order Paid - Marketplace Tax Sync",
        asyncEvents: ["ORDER_PAID"],
        targetUrl: `${appBaseUrl}/api/webhooks/order-paid`,
        query: `
          subscription {
            event {
              ... on OrderPaid {
                order {
                  id
                  total {
                    gross {
                      amount
                      currency
                    }
                  }
                  lines {
                    id
                    totalPrice {
                      net {
                        amount
                      }
                    }
                    variant {
                      product {
                        attributes {
                          attribute {
                            id
                          }
                          values {
                            slug
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
      },
    ],
    brand: {
      logo: {
        default: `${appBaseUrl}/app-icon.png`,
      },
    },
  };

  return NextResponse.json(manifest);
};
