import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getPortalUsers } from "@/app/actions/admin";

export const GET = async () => {
  const session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 1. Fetch local vendor profiles (those with tax setup)
    const localVendors = await (prisma.vendorProfile as any).findMany({
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

    // 2. Fetch portal users
    let portalUsers = [];
    try {
      portalUsers = await getPortalUsers();
    } catch (e) {
      console.error("Failed to fetch portal users for merge", e);
    }

    // 3. Merge them
    // Map brand to local profile
    const localMap = new Map();
    localVendors.forEach((v: any) => localMap.set(v.brandAttributeValue, v));

    const mergedVendors = [...localVendors];
    const seenBrands = new Set(localVendors.map((v: any) => v.brandAttributeValue));

    portalUsers.forEach((u: any) => {
      if (u.brand && !seenBrands.has(u.brand)) {
        mergedVendors.push({
          brandName: u.name || u.brand, // Fallback to brand slug if name missing
          brandAttributeValue: u.brand,
          commissionRate: 10, // Default
          countryCode: "??", // Unknown yet
          isPlaceholder: true // Mark as not yet setup in tax engine
        });
        seenBrands.add(u.brand);
      }
    });

    return NextResponse.json(mergedVendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
