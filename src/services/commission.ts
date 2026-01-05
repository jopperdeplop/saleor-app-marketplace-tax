import { prisma } from "@/lib/prisma";

const BRAND_ATTRIBUTE_ID = "QXR0cmlidXRlOjQ0";

export const calculateAndRecordCommission = async (order: any) => {
  const lineItems = order.lines || [];
  const brandGroups: Record<string, any[]> = {};
  
  for (const line of lineItems) {
    const brandAttr = line.variant?.product?.attributes?.find(
      (a: any) => a.attribute.id === BRAND_ATTRIBUTE_ID
    );
    const brandValue = brandAttr?.values?.[0]?.slug || "unbranded";
    
    if (!brandGroups[brandValue]) {
      brandGroups[brandValue] = [];
    }
    brandGroups[brandValue].push(line);
  }

  return await prisma.$transaction(async (tx: any) => {
    // 1. Fetch Global Settings for default rate
    const globalSettings = await tx.systemSettings.upsert({
      where: { id: "global" },
      update: {},
      create: { id: "global", defaultCommissionRate: 10.0 },
    });
    const defaultRate = globalSettings.defaultCommissionRate;

    const results: any[] = [];

    for (const [brandSlug, lines] of Object.entries(brandGroups)) {
      let vendor: any = await tx.vendorProfile.findUnique({
        where: { brandAttributeValue: brandSlug }
      });

      if (!vendor) {
         // Create vendor profile if it doesn't exist (reactive registration)
        vendor = await tx.vendorProfile.create({
          data: {
            brandAttributeValue: brandSlug,
            brandName: brandSlug.replace(/-/g, " "),
            commissionRate: defaultRate, 
          }
        });
      }

      // 2. Determine Effective Commission Rate
      const now = new Date();
      let effectiveRate = vendor.commissionRate;
      
      if (
        vendor.temporaryCommissionRate !== null &&
        vendor.temporaryCommissionEndsAt &&
        new Date(vendor.temporaryCommissionEndsAt) > now
      ) {
        effectiveRate = vendor.temporaryCommissionRate;
      }

      // Calculation logic: Currently uses NET amount (excluding taxes)
      const brandNetTotal = lines.reduce((acc, line) => {
        return acc + (line.totalPrice?.net?.amount || 0);
      }, 0);

      const commissionAmount = brandNetTotal * (effectiveRate / 100);

      const commission = await tx.commission.upsert({
        where: { orderId: `${order.id}-${brandSlug}` },
        update: {
          amount: commissionAmount,
          vendorProfileId: vendor.id,
          orderGross: brandNetTotal,
          rate: effectiveRate,
        },
        create: {
          orderId: `${order.id}-${brandSlug}`,
          vendorProfileId: vendor.id,
          amount: commissionAmount,
          orderGross: brandNetTotal,
          rate: effectiveRate,
          currency: order.total?.gross?.currency || "EUR",
        }
      });

      results.push({
        vendor,
        lines,
        commissionAmount,
        commissionId: commission.id
      });
    }

    return results;
  });
};
