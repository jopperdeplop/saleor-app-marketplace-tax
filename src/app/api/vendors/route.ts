import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Fetches all registered vendors for the marketplace dashboard.
 * Includes active commission rates and tax residency info.
 */
export const GET = async () => {
  try {
    const vendors = await prisma.vendorProfile.findMany({
      orderBy: { brandName: "asc" },
      select: {
        brandName: true,
        brandAttributeValue: true,
        commissionRate: true,
        temporaryCommissionRate: true,
        temporaryCommissionEndsAt: true,
        countryCode: true,
      },
    });

    return NextResponse.json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
