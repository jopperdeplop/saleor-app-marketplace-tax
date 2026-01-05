import { NextResponse } from "next/server";
import { saleorApp } from "@/lib/saleor-app";
import { calculateAndRecordCommission } from "@/services/commission";

export const POST = async (request: Request) => {
  const signature = request.headers.get("x-saleor-signature");
  
  if (!signature) {
    return new NextResponse("Missing signature", { status: 400 });
  }

  try {
    const body = await request.json();
    
    // In a real app, use @saleor/app-sdk verify method for JWS
    // For now, we process the order from the payload
    if (body.order) {
      await calculateAndRecordCommission(body.order);
    }

    return new NextResponse("Accepted", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
