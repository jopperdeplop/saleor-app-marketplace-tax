import { NextResponse } from "next/server";
import { saleorApp } from "@/lib/saleor-app";
import { verifySignatureWithJwks, getJwksUrlFromSaleorApiUrl } from "@saleor/app-sdk/auth";
import { calculateAndRecordCommission } from "@/services/commission";
import { 
  generateCustomerInvoice, 
  generateCommissionInvoice, 
  saveInvoice 
} from "@/lib/invoice-generator";

export const dynamic = "force-dynamic";

export const POST = async (request: Request) => {
  const signature = request.headers.get("x-saleor-signature");
  const saleorApiUrl = request.headers.get("x-saleor-api-url");
  
  if (!signature || !saleorApiUrl) {
    return new NextResponse("Missing signature or API URL", { status: 400 });
  }

  try {
    const rawBody = await request.text();
    
    // Fetch JWKS from Saleor to verify JWS signature
    const jwksUrl = getJwksUrlFromSaleorApiUrl(saleorApiUrl);
    const jwksResponse = await fetch(jwksUrl);
    const jwks = await jwksResponse.text();

    try {
      await verifySignatureWithJwks(jwks, signature as string, rawBody);
    } catch (e) {
      console.error("Invalid Saleor signature:", e);
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const order = body.order;
    
    if (order) {
      // 1. Calculate and record commissions
      const commissionResults = await calculateAndRecordCommission(order);

      // 2. Generate and save invoices for each brand involvement
      for (const result of commissionResults) {
        const { vendor, lines, commissionAmount } = result;

        try {
          // A. Customer Receipt (Brand is the seller)
          const customerPdfBuffer = await generateCustomerInvoice(order, vendor, lines);
          await saveInvoice(order.id, "CUSTOMER", customerPdfBuffer, vendor.brandAttributeValue);

          // B. Commission Invoice (Platform to Brand)
          const commissionPdfBuffer = await generateCommissionInvoice(order, vendor, commissionAmount);
          await saveInvoice(order.id, "COMMISSION", commissionPdfBuffer, vendor.brandAttributeValue);
        } catch (invoiceError) {
          console.error(`Failed to generate/save invoice for vendor ${vendor.brandAttributeValue}:`, invoiceError);
          // We don't fail the whole webhook if one invoice fails, but we log it.
        }
      }
    }

    return new NextResponse("Accepted", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
