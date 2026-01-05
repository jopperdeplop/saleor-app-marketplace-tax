'use server';

import { prisma } from "@/lib/prisma";
import { PrismaAPL } from "@/lib/prisma-apl";
import { revalidatePath } from "next/cache";

export async function updateGlobalSettings(formData: FormData) {

  const rateStr = formData.get("defaultRate");
  if (!rateStr) return;
  const rate = parseFloat(rateStr.toString());
  
  await (prisma as any).systemSettings.upsert({
    where: { id: "global" },
    update: { defaultCommissionRate: rate },
    create: { id: "global", defaultCommissionRate: rate },
  });


  revalidatePath("/");
  revalidatePath("/dashboard/settings");
}

export async function updateVendorOverride(formData: FormData) {
  const brandSlug = formData.get("brandSlug") as string;
  const tempRateStr = formData.get("tempRate");
  const endDateStr = formData.get("endDate");

  const tempRate = tempRateStr && tempRateStr.toString() !== "" ? parseFloat(tempRateStr.toString()) : null;
  const endDate = endDateStr && endDateStr.toString() !== "" ? new Date(endDateStr.toString()) : null;

  await prisma.vendorProfile.update({
    where: { brandAttributeValue: brandSlug },
    data: {
      temporaryCommissionRate: tempRate,
      temporaryCommissionEndsAt: endDate,
    } as any,

  });

  revalidatePath(`/dashboard/vendor/${brandSlug}`);
}

export async function removeVendorOverride(formData: FormData) {
  const brandSlug = formData.get("brandSlug") as string;

  await prisma.vendorProfile.update({
    where: { brandAttributeValue: brandSlug },
    data: {
      temporaryCommissionRate: null,
      temporaryCommissionEndsAt: null,
    } as any,
  });

  revalidatePath(`/dashboard/vendor/${brandSlug}`);
}

export async function registerVendor(formData: FormData) {
  const brandSlug = formData.get("brandSlug");
  const brandName = formData.get("brandName");
  const commissionRateStr = formData.get("commissionRate");
  
  if (!brandSlug || !brandName) {
    throw new Error("Brand Slug and Name are required");
  }

  // Fetch global default if no specific rate provided
  const globalSettings = await (prisma as any).systemSettings.findUnique({
    where: { id: "global" }
  });

  const defaultRate = globalSettings?.defaultCommissionRate ?? 10.0;
  
  const rate = commissionRateStr && commissionRateStr.toString() !== "" 
    ? parseFloat(commissionRateStr.toString()) 
    : defaultRate;

  await prisma.vendorProfile.create({
    data: {
      brandAttributeValue: brandSlug.toString(),
      brandName: brandName.toString(),
      commissionRate: rate,
    }
  });


  revalidatePath("/");
}

export async function syncVendors() {

  const apl = new PrismaAPL();
  const authRecords = await apl.getAll(); 

  if (authRecords.length === 0) {
    throw new Error("No Saleor API connected.");
  }

  const { saleorApiUrl, token } = authRecords[0];

  const query = `
    query FetchBrands($after: String) {
      pages(first: 100, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            title
            pageType {
              name
            }
          }
        }
      }
    }
  `;

  let hasNextPage = true;
  let cursor = null;
  let allPages: any[] = [];

  while (hasNextPage) {
    const response: Response = await fetch(saleorApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        query,
        variables: { after: cursor }
      }),
    });

    const json: any = await response.json();
    const data: any = json.data?.pages;
    
    if (data?.edges) {

      const pageNodes = data.edges.map((e: any) => e.node);
      allPages = [...allPages, ...pageNodes];
    }

    hasNextPage = data?.pageInfo?.hasNextPage || false;
    cursor = data?.pageInfo?.endCursor || null;
  }

  // Filter for pages with Page Type "Brand"
  const brandPages = allPages.filter((p: any) => p.pageType?.name === "Brand");

  let count = 0;
  
  // Get default rate
  const globalSettings = await (prisma as any).systemSettings.findUnique({ where: { id: "global" } });
  const defaultRate = globalSettings?.defaultCommissionRate ?? 10.0;

  for (const page of brandPages) {
    await prisma.vendorProfile.upsert({
      where: { brandAttributeValue: page.id },
      update: {
        brandName: page.title, 
      },
      create: {
        brandAttributeValue: page.id,
        brandName: page.title,
        commissionRate: defaultRate,
      },
    });
    count++;
  }

  revalidatePath("/");
  return { success: true, count };
}


