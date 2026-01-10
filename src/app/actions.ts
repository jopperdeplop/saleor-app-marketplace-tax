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
    throw new Error("No Saleor API connected. Please re-install the app.");
  }

  const { saleorApiUrl, token } = authRecords[0];
  const BRAND_ATTRIBUTE_ID = "QXR0cmlidXRlOjQ0";

  const fetchAllPages = async () => {
    let hasNextPage = true;
    let after = null;
    let vendors: { id: string, name: string }[] = [];

    while (hasNextPage) {
      const query = `
        query DiscoverPages($after: String) {
          pages(first: 100, after: $after) {
            pageInfo { hasNextPage endCursor }
            edges {
              node {
                id
                title
                slug
                pageType { name }
              }
            }
          }
        }
      `;

      const response = await fetch(saleorApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ query, variables: { after } }),
      });
      
      const json: any = await response.json();
      const pagesData = json.data?.pages;
      
      (pagesData?.edges || []).forEach((edge: any) => {
        const page = edge.node;
        const typeName = (page.pageType?.name || "").toLowerCase();
        const slug = (page.slug || "").toLowerCase();

        if (typeName.includes("brand")) {
          vendors.push({ id: page.slug, name: page.title });
          console.log(`[SYNC] HIT: "${page.title}"`);
        }
      });

      hasNextPage = pagesData?.pageInfo?.hasNextPage;
      after = pagesData?.pageInfo?.endCursor;
    }
    return vendors;
  };

  const fetchAttributeChoices = async () => {
    let hasNextPage = true;
    let after = null;
    let vendors: { id: string, name: string }[] = [];

    while (hasNextPage) {
      const query = `
        query DiscoverAttributes($after: String) {
          attribute(id: "${BRAND_ATTRIBUTE_ID}") {
            choices(first: 100, after: $after) {
              pageInfo { hasNextPage endCursor }
              edges {
                node { id name slug }
              }
            }
          }
        }
      `;

      const response = await fetch(saleorApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ query, variables: { after } }),
      });
      
      const json: any = await response.json();
      const choicesData = json.data?.attribute?.choices;

      (choicesData?.edges || []).forEach((c: any) => {
        vendors.push({ id: c.node.slug, name: c.node.name });
      });

      hasNextPage = choicesData?.pageInfo?.hasNextPage;
      after = choicesData?.pageInfo?.endCursor;
    }
    return vendors;
  };

  let foundVendors: { id: string, name: string }[] = [];

  try {
    console.log(`[SYNC] Starting deep sync for ${saleorApiUrl}`);
    const [pageVendors, attrVendors] = await Promise.all([
      fetchAllPages(),
      fetchAttributeChoices()
    ]);
    foundVendors = [...pageVendors, ...attrVendors];
  } catch (err) {
    console.error("[SYNC] Connection failed:", err);
  }

  // Deduplicate and Persist
  const uniqueVendors = Array.from(new Map(foundVendors.map(v => [v.id, v])).values());
  const globalSettings = await (prisma as any).systemSettings.findUnique({ where: { id: "global" } });
  const defaultRate = globalSettings?.defaultCommissionRate ?? 10.0;

  console.log(`[SYNC] Persisting ${uniqueVendors.length} vendors to database.`);

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

export async function deleteLocalVendor(brandSlug: string) {
  await prisma.vendorProfile.delete({
    where: { brandAttributeValue: brandSlug },
  });
  revalidatePath("/dashboard/portal-users");
  revalidatePath("/");
}



