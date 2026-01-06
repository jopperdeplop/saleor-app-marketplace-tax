import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * Fetches all registered vendors for the marketplace dashboard.
 * Includes active commission rates and tax residency info.
 */
export const GET = async () => {
  const session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const vendors = await (prisma.vendorProfile as any).findMany({
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
