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
    webhooks: [
      {
        name: "Order Paid - Marketplace Tax Sync",
        asyncEvents: ["ORDER_PAID"],
        targetUrl: `${process.env.APP_URL || "http://localhost:3000"}/api/webhooks/order-paid`,
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
  };

  return NextResponse.json(manifest);
};
