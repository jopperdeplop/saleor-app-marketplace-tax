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

  // Omni-Discovery Query: Pages, Attributes, and Product Types
  const discoveryQuery = `
    query DiscoverVendors($after: String) {
      # 1. Page Discovery
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
      # 2. Attribute Discovery (Search for "Brand")
      attributes(filter: {search: "Brand"}, first: 10) {
        edges {
          node {
            id
            name
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
      }
      # 3. Product Type Discovery (Search for "Brand")
      productTypes(filter: {search: "Brand"}, first: 10) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `;

  let foundVendors: { id: string, name: string }[] = [];

  try {
    console.log(`Starting omni-sync for Saleor at: ${saleorApiUrl}`);
    
    // Attempt multi-vector discovery
    const response = await fetch(saleorApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ query: discoveryQuery }),
    });
    
    const json: any = await response.json();
    if (json.errors) {
      console.error("Saleor GraphQL Errors:", json.errors);
    }

    const data = json.data;

    // Vector A: Pages with PageType "Brand"
    if (data?.pages?.edges) {
      data.pages.edges
        .filter((e: any) => e.node.pageType?.name?.toLowerCase().includes("brand"))
        .forEach((e: any) => {
          foundVendors.push({ id: e.node.id, name: e.node.title });
          console.log(`Vector A Found: ${e.node.title}`);
        });
    }

    // Vector B: Choices from Attributes named "Brand"
    if (data?.attributes?.edges) {
      data.attributes.edges.forEach((edge: any) => {
        const choices = edge.node.choices?.edges || [];
        choices.forEach((c: any) => {
          foundVendors.push({ id: c.node.slug, name: c.node.name });
          console.log(`Vector B Found: ${c.node.name}`);
        });
      });
    }

    // Vector C: Product Types named "Brand"
    if (data?.productTypes?.edges) {
      data.productTypes.edges.forEach((edge: any) => {
        foundVendors.push({ id: edge.node.id, name: edge.node.name });
        console.log(`Vector C Found: ${edge.node.name}`);
      });
    }

    // Priority Vector: Hardcoded ID choices (just in case)
    const priorityResponse = await fetch(saleorApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ 
        query: `query { attribute(id: "${BRAND_ATTRIBUTE_ID}") { choices(first: 100) { edges { node { id name slug } } } } }`
      }),
    });
    const priorityJson: any = await priorityResponse.json();
    const priorityChoices = priorityJson.data?.attribute?.choices?.edges || [];
    priorityChoices.forEach((c: any) => {
      foundVendors.push({ id: c.node.slug, name: c.node.name });
      console.log(`Priority Vector Found: ${c.node.name}`);
    });

  } catch (err) {
    console.error("Saleor Discovery Error:", err);
  }

  // Deduplicate by slug/ID
  const uniqueVendors = Array.from(new Map(foundVendors.map(v => [v.id, v])).values());
  console.log(`Discovery complete. Found ${uniqueVendors.length} unique vendors.`);

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


