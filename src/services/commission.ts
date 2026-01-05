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

  return await prisma.$transaction(async (tx) => {
    const results: any[] = [];

    for (const [brandSlug, lines] of Object.entries(brandGroups)) {
      let vendor = await tx.vendorProfile.findUnique({
        where: { brandAttributeValue: brandSlug }
      });

      if (!vendor) {
        vendor = await tx.vendorProfile.create({
          data: {
            brandAttributeValue: brandSlug,
            brandName: brandSlug.replace(/-/g, " "),
          }
        });
      }

      const brandNetTotal = lines.reduce((acc, line) => {
        return acc + (line.totalPrice?.net?.amount || 0);
      }, 0);

      const commissionAmount = brandNetTotal * (vendor.commissionRate / 100);

      const commission = await tx.commission.upsert({
        where: { orderId: `${order.id}-${brandSlug}` },
        update: {
          amount: commissionAmount,
          vendorProfileId: vendor.id,
        },
        create: {
          orderId: `${order.id}-${brandSlug}`,
          vendorProfileId: vendor.id,
          amount: commissionAmount,
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
