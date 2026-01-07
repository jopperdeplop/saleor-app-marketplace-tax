import { prisma } from "@/lib/prisma";
import { getPortalUsers } from "@/app/actions/admin";

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

  return { 
    vendor, 
    commissions: vendor.commissions || [], 
    invoices,
    portalUser 
  };
};
