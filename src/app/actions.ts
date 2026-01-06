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

  // Omni-Discovery Query: Total fetch of Pages, Attributes, and Product Types
  const discoveryQuery = `
    query DiscoverVendors {
      # 1. Total Page Scan
      pages(first: 100) {
        edges {
          node {
            id
            title
            slug
            pageType { name }
          }
        }
      }
      # 2. Attribute Search
      attributes(filter: {search: "Brand"}, first: 20) {
        edges {
          node {
            id
            name
            choices(first: 100) {
              edges {
                node {
                  id name slug
                }
              }
            }
          }
        }
      }
      # 3. Product Type Search
      productTypes(filter: {search: "Brand"}, first: 20) {
        edges {
          node {
            id name
          }
        }
      }
    }
  `;

  let foundVendors: { id: string, name: string }[] = [];

  try {
    console.log(`[SYNC] Initiating deep discovery for ${saleorApiUrl}`);
    
    const response = await fetch(saleorApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ query: discoveryQuery }),
    });
    
    const json: any = await response.json();
    if (json.errors) console.error("[SYNC] Saleor Errors:", json.errors);

    const data = json.data;

    // Advanced Page Discovery: Match anything that looks like a Brand/Vendor/Store
    if (data?.pages?.edges) {
      data.pages.edges.forEach((e: any) => {
        const title = (e.node.title || "").toLowerCase();
        const slug = (e.node.slug || "").toLowerCase();
        const typeName = (e.node.pageType?.name || "").toLowerCase();
        
        const isMatch = typeName.includes("brand") || 
                        typeName.includes("vendor") || 
                        typeName.includes("store") ||
                        title.includes("brand") ||
                        title.includes("vendor") ||
                        title.includes("saleordevelopmentstore") ||
                        slug.includes("saleordevelopmentstore");

        if (isMatch) {
          foundVendors.push({ id: e.node.slug, name: e.node.title });
          console.log(`[SYNC] Found Page-Brand: "${e.node.title}" [ID: ${e.node.slug}]`);
        }
      });
    }

    // Attribute choices
    if (data?.attributes?.edges) {
      data.attributes.edges.forEach((edge: any) => {
        const choices = edge.node.choices?.edges || [];
        choices.forEach((c: any) => {
          foundVendors.push({ id: c.node.slug, name: c.node.name });
          console.log(`[SYNC] Found Attribute-Brand: "${c.node.name}" [ID: ${c.node.slug}]`);
        });
      });
    }

    // Product Types
    if (data?.productTypes?.edges) {
      data.productTypes.edges.forEach((edge: any) => {
        foundVendors.push({ id: edge.node.id, name: edge.node.name });
        console.log(`[SYNC] Found ProductType-Brand: "${edge.node.name}"`);
      });
    }

    // Fallback/Priority Attribute
    const priorityResponse = await fetch(saleorApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ 
        query: `query { attribute(id: "${BRAND_ATTRIBUTE_ID}") { choices(first: 100) { edges { node { id name slug } } } } }`
      }),
    });
    const priorityJson: any = await priorityResponse.json();
    (priorityJson.data?.attribute?.choices?.edges || []).forEach((c: any) => {
      foundVendors.push({ id: c.node.slug, name: c.node.name });
      console.log(`[SYNC] Found Priority-Brand: "${c.node.name}"`);
    });

  } catch (err) {
    console.error("[SYNC] Fatal Error:", err);
  }

  // Deduplicate and Persist
  const uniqueVendors = Array.from(new Map(foundVendors.map(v => [v.id, v])).values());
  console.log(`[SYNC] Discovery finished. Syncing ${uniqueVendors.length} vendors to database.`);

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


