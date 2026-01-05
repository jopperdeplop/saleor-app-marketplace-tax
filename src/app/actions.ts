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
    console.error("No Saleor API connected found in database.");
    throw new Error("No Saleor API connected. Please re-install the app in your Saleor Dashboard to re-authorize.");
  }

  const { saleorApiUrl, token } = authRecords[0];

  // Logic 1: Sync from Pages (for marketplaces using pages as vendor profiles)
  const pageQuery = `
    query FetchBrands($after: String) {
      pages(first: 100, after: $after) {
        pageInfo { hasNextPage, endCursor }
        edges {
          node {
            id
            title
            pageType { name }
          }
        }
      }
    }
  `;

  const BRAND_ATTRIBUTE_ID = "QXR0cmlidXRlOjQ0";

  // Logic 2: Sync from Attributes (Specific ID)
  const attrQuery = `
    query FetchAttributeChoices($id: ID!) {
      attribute(id: $id) {
        choices(first: 100) {
          edges {
            node {
              id
              name
              slug
            }
          }
        }
      }
    }
  `;

  let foundVendors: { id: string, name: string }[] = [];

  try {
    // 1. Fetch from specific attribute
    const attrResponse = await fetch(saleorApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ query: attrQuery, variables: { id: BRAND_ATTRIBUTE_ID } }),
    });
    const attrJson: any = await attrResponse.json();
    const choices = attrJson.data?.attribute?.choices?.edges || [];
    
    choices.forEach((c: any) => {
      foundVendors.push({ id: c.node.slug, name: c.node.name });
    });

    // 2. Fetch from Pages (Page Type "Brand")
    let hasNextPage = true;
    let cursor = null;
    while (hasNextPage) {
      const pResponse: Response = await fetch(saleorApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ query: pageQuery, variables: { after: cursor } }),
      });
      const pJson: any = await pResponse.json();
      const pData: any = pJson.data?.pages;
      
      if (pData?.edges) {
        pData.edges.filter((e: any) => e.node.pageType?.name === "Brand").forEach((e: any) => {
          foundVendors.push({ id: e.node.id, name: e.node.title });
        });
      }
      hasNextPage = pData?.pageInfo?.hasNextPage || false;
      cursor = pData?.pageInfo?.endCursor || null;
    }
  } catch (err) {
    console.error("Saleor Sync Fetch Error:", err);
  }

  // Deduplicate and Persist
  const uniqueVendors = Array.from(new Map(foundVendors.map(v => [v.id, v])).values());
  const globalSettings = await (prisma as any).systemSettings.findUnique({ where: { id: "global" } });
  const defaultRate = globalSettings?.defaultCommissionRate ?? 10.0;

  for (const v of uniqueVendors) {
    await (prisma.vendorProfile as any).upsert({
      where: { brandAttributeValue: v.id },
      update: { brandName: v.name },
      create: {
        brandAttributeValue: v.id,
        brandName: v.name,
        commissionRate: defaultRate,
        countryCode: "NL"
      },
    });
  }

  revalidatePath("/");
  return { success: true, count: uniqueVendors.length };
}


