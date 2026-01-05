import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Expert Tax Export API
 * Generates CSV data for quarterly tax filing and OSS reporting.
 */
export const GET = async (request: Request) => {
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

        const headers = ["ID", "Date", "Vendor", "Order ID", "Gross Sales", "Net Commission", "VAT Paid", "Destination", "OSS"];
        csvContent = headers.join(",") + "\n";
        
        commissions.forEach((c: any) => {
            const row = [
                c.id,
                new Date(c.createdAt).toISOString().split('T')[0],
                c.vendor.brandName,
                c.orderId,
                Number(c.orderGrossTotal).toFixed(2),
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
            if (!acc[country]) acc[country] = { gross: 0, vat: 0, count: 0 };
            acc[country].gross += Number(c.orderGrossTotal);
            acc[country].vat += Number(c.orderVatTotal || 0);
            acc[country].count += 1;
            return acc;
        }, {});

        const headers = ["Destination Country", "Total Gross Sales", "Total Order VAT", "Transaction Count"];
        csvContent = headers.join(",") + "\n";
        
        Object.entries(summary).forEach(([country, stats]: [string, any]) => {
            const row = [
                country,
                stats.gross.toFixed(2),
                stats.vat.toFixed(2),
                stats.count
            ];
            csvContent += row.join(",") + "\n";
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
