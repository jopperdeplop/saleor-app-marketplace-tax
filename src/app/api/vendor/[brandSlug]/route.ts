import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const GET = async (
  request: Request,
  { params }: { params: { brandSlug: string } }
) => {
  const brandSlug = params.brandSlug;
  const authHeader = request.headers.get("Authorization");

  // Robustness/Security: Check for authorization
  // In a real Saleor App, this would verify the Saleor-App-Token or a session
  if (process.env.APP_SECRET && authHeader !== `Bearer ${process.env.APP_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { brandAttributeValue: brandSlug },
      include: {
        commissions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!vendor) {
      return new NextResponse("Vendor not found", { status: 404 });
    }

    // Get invoices related to this vendor/brand
    const invoices = await prisma.invoiceLog.findMany({
      where: {
        OR: [
          { orderId: { in: vendor.commissions.map((c) => c.orderId.split("-")[0]) } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      vendor,
      commissions: vendor.commissions,
      invoices,
    });
  } catch (error) {
    console.error("Error fetching vendor data:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
