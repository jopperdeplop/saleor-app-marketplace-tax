import { prisma } from "@/lib/prisma";
import { getPortalUsers } from "@/app/actions/admin";
import { PrismaAPL } from "@/lib/prisma-apl";

export const getVendorData = async (brandSlug: string) => {
  // 1. Fetch local profile
  let vendor = await prisma.vendorProfile.findFirst({
    where: {
      OR: [
        { brandAttributeValue: brandSlug },
        { brandName: { equals: brandSlug, mode: 'insensitive' } }
      ]
    },
    include: {
      commissions: {
        orderBy: { createdAt: "desc" },
      },
    },
  }) as any;

  // 2. Fetch portal user data
  let portalUser = null;
  try {
    const portalUsers = await getPortalUsers();
    portalUser = portalUsers.find((u: any) => u.brand === brandSlug);
  } catch (e) {
    console.error("Portal API error in getVendorData:", e);
  }

  // Handle case where vendor profile doesn't exist locally but portal user does
  if (!vendor) {
    if (!portalUser) return null;
    
    // Create a virtual placeholder vendor
    vendor = {
      brandName: portalUser.name || portalUser.brand,
      brandAttributeValue: portalUser.brand,
      commissionRate: 10,
      countryCode: "??",
      isPlaceholder: true,
      commissions: []
    };
  }

  const invoices = await prisma.invoiceLog.findMany({
    where: {
      orderId: { in: (vendor.commissions || []).map((c: any) => c.orderId.split("-")[0]) }
    },
    orderBy: { createdAt: "desc" },
  });

  // 3. Fetch Real Platform Performance from Saleor
  let platformStats = {
    productCount: 0,
    totalOrders: (vendor.commissions || []).length,
    avgOrderValue: 0
  };

  try {
    const apl = new PrismaAPL();
    const authRecords = await apl.getAll(); 
    if (authRecords.length > 0) {
      const { saleorApiUrl, token } = authRecords[0];
      const BRAND_ATTRIBUTE_ID = "QXR0cmlidXRlOjQ0"; // Same as in actions.ts

      const query = `
        query BrandStats($attributeId: ID!, $brandValue: String!) {
          products(filter: { attributes: [{ id: $attributeId, values: [$brandValue] }] }) {
            totalCount
          }
        }
      `;

      const response = await fetch(saleorApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ 
          query, 
          variables: { 
            attributeId: BRAND_ATTRIBUTE_ID, 
            brandValue: vendor.brandAttributeValue 
          } 
        }),
      });
      
      const json: any = await response.json();
      platformStats.productCount = json.data?.products?.totalCount || 0;
    }
  } catch (err) {
    console.error("Failed to fetch product count from Saleor:", err);
  }

  // Calculate internal financials
  if (platformStats.totalOrders > 0) {
    const totalGross = (vendor.commissions || []).reduce((acc: number, c: any) => acc + Number(c.orderGrossTotal), 0);
    platformStats.avgOrderValue = totalGross / platformStats.totalOrders;
  }

  return { 
    vendor, 
    commissions: vendor.commissions || [], 
    invoices,
    portalUser,
    platformStats
  };
};
