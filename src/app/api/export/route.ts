import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * Expert Tax Export API
 * Generates CSV data for quarterly tax filing and OSS reporting.
 */
export const GET = async (request: Request) => {
  const session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const brandSlug = searchParams.get("brandSlug");
  const type = searchParams.get("type") || "commissions"; // commissions or oss

  try {
    let csvContent = "";
    
    if (type === "commissions") {
        const commissions = await (prisma.commission as any).findMany({
            where: brandSlug ? { vendor: { brandAttributeValue: brandSlug } } : {},
            include: { vendor: true },
            orderBy: { createdAt: "desc" }
        });

        const headers = ["ID", "Date", "Vendor", "Order ID", "Customer", "Gross Sales", "Net Sales", "Order VAT", "Comm. Net", "Comm. VAT", "Destination", "OSS"];
        csvContent = headers.join(",") + "\n";
        
        commissions.forEach((c: any) => {
            const row = [
                c.id,
                new Date(c.createdAt).toISOString().split('T')[0],
                c.vendor.brandName,
                c.orderId,
                c.customerEmail || "N/A",
                Number(c.orderGrossTotal).toFixed(2),
                (Number(c.orderGrossTotal) - Number(c.orderVatTotal || 0)).toFixed(2),
                Number(c.orderVatTotal || 0).toFixed(2),
                Number(c.commissionNet).toFixed(2),
                Number(c.commissionVat).toFixed(2),
                c.destinationCountry || "",
                c.isOss ? "YES" : "NO"
            ];
            csvContent += row.join(",") + "\n";
        });
    } else if (type === "oss") {
        const commissions = await (prisma.commission as any).findMany({
            where: { isOss: true },
            orderBy: { destinationCountry: "asc" }
        });

        const summary = commissions.reduce((acc: any, c: any) => {
            const country = c.destinationCountry || "UNKNOWN";
            if (!acc[country]) acc[country] = { gross: 0, vat: 0, count: 0, net: 0 };
            acc[country].gross += Number(c.orderGrossTotal);
            acc[country].net += (Number(c.orderGrossTotal) - Number(c.orderVatTotal || 0));
            acc[country].vat += Number(c.orderVatTotal || 0);
            acc[country].count += 1;
            return acc;
        }, {});

        const headers = ["EU Country", "Country Code", "Total Transactions", "Total Gross Sales", "Total Net Sales", "Total Order VAT Collected"];
        csvContent = headers.join(",") + "\n";
        
        Object.entries(summary).forEach(([country, stats]: [string, any]) => {
            const row = [
                country, // Name if available
                country, // Code
                stats.count,
                stats.gross.toFixed(2),
                stats.net.toFixed(2),
                stats.vat.toFixed(2)
            ];
            csvContent += row.join(",") + "\n";
        });
    } else if (type === "receipt") {
        const orderId = searchParams.get("orderId");
        const comm = await (prisma.commission as any).findFirst({
            where: { orderId },
            include: { vendor: true }
        });

        if (!comm) return new NextResponse("Commission not found", { status: 404 });

        const receipt = `
FISCAL RECEIPT - MARKETPLACE FEES
---------------------------------
Date: ${new Date(comm.createdAt).toLocaleDateString()}
Order ID: ${comm.orderId}
Vendor: ${comm.vendor.brandName}

FINANCIAL BREAKDOWN:
Order Gross Total: €${Number(comm.orderGrossTotal).toFixed(2)}
Marketplace Net Fee: €${Number(comm.commissionNet).toFixed(2)}
VAT (21% NL): €${Number(comm.commissionVat).toFixed(2)}
---------------------------------
TOTAL PARENT FEE: €${Number(comm.commissionAmount).toFixed(2)}

Status: PAID (Automated Payout Deducted)
        `.trim();

        return new NextResponse(receipt, {
            headers: {
                "Content-Type": "text/plain",
                "Content-Disposition": `attachment; filename=receipt-${orderId}.txt`,
            },
        });
    }

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=tax-export-${type}-${new Date().toISOString().split('T')[0]}.csv`,
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
