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

  // Omni-Discovery Strategy: Target "Brand" models specifically
  const discoveryQuery = `
    query DiscoverVendors {
      # Vector 1: Fetch Page Types to find the "Brand" model definition
      pageTypes(first: 100) {
        edges {
          node {
            id
            name
          }
        }
      }
      # Vector 2: Fetch all Pages (limit 100 for discovery)
      pages(first: 100) {
        edges {
          node {
            id
            title
            slug
            pageType {
              id
              name
            }
          }
        }
      }
      # Vector 3: Global Attribute Discovery
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
    }
  `;

  let foundVendors: { id: string, name: string }[] = [];

  try {
    console.log(`[SYNC] Executing omni-discovery on ${saleorApiUrl}`);
    
    const response = await fetch(saleorApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ query: discoveryQuery }),
    });
    
    const json: any = await response.json();
    if (json.errors) {
      console.error("[SYNC] Saleor GraphQL Protocol Errors:", JSON.stringify(json.errors, null, 2));
    }

    const data = json.data;

    // STEP 1: Identify "Brand" Page Types
    const brandTypeIds = (data?.pageTypes?.edges || [])
      .filter((e: any) => e.node.name.toLowerCase() === "brand")
      .map((e: any) => e.node.id);
    
    console.log(`[SYNC] Identified ${brandTypeIds.length} PageTypes named "Brand"`);

    // STEP 2: Process Pages
    if (data?.pages?.edges) {
      data.pages.edges.forEach((e: any) => {
        const page = e.node;
        const typeName = (page.pageType?.name || "").toLowerCase();
        const typeId = page.pageType?.id;
        const title = (page.title || "").toLowerCase();
        const slug = (page.slug || "").toLowerCase();

        // High-Confidence Match: Official "Brand" Page Type
        const isOfficialBrand = brandTypeIds.includes(typeId) || typeName === "brand";
        
        // Logical Match: Name contains "Brand" or matches known store
        const isNamingMatch = title.includes("brand") || 
                             slug.includes("saleordevelopmentstore") ||
                             title.includes("saleordevelopmentstore");

        if (isOfficialBrand || isNamingMatch) {
          foundVendors.push({ id: page.slug, name: page.title });
          console.log(`[SYNC] Found Match: "${page.title}" [Type: ${page.pageType?.name}, ID: ${page.slug}]`);
        }
      });
    }

    // STEP 3: Process Attributes (Fallback)
    if (data?.attributes?.edges) {
      data.attributes.edges.forEach((edge: any) => {
        const choices = edge.node.choices?.edges || [];
        choices.forEach((c: any) => {
          foundVendors.push({ id: c.node.slug, name: c.node.name });
          console.log(`[SYNC] Found Attribute-Brand: "${c.node.name}" [Slug: ${c.node.slug}]`);
        });
      });
    }

    // STEP 4: Fallback for hardcoded attribute (Backwards Compatibility)
    if (foundVendors.length === 0) {
      console.log("[SYNC] No vendors found via primary discovery. Attempting legacy attribute fallback...");
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
      });
    }

  } catch (err) {
    console.error("[SYNC] Fatal Connection Error:", err);
  }

  // Deduplicate by slug
  const uniqueVendors = Array.from(new Map(foundVendors.map(v => [v.id, v])).values());
  console.log(`[SYNC] Complete. Persisting ${uniqueVendors.length} unique vendors.`);

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



