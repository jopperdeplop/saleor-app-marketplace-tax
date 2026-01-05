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
    // 1. Fetch Global Settings for default rate and marketplace info
    const globalSettings = await tx.systemSettings.upsert({
      where: { id: "global" },
      update: {},
      create: { 
        id: "global", 
        defaultCommissionRate: 10.0,
        companyName: "Saleor Marketplace NL",
        addressCountry: "NL"
      },
    });
    
    const defaultRate = globalSettings.defaultCommissionRate;
    const results: any[] = [];

    for (const [brandSlug, lines] of Object.entries(brandGroups)) {
      let vendor: any = await tx.vendorProfile.findUnique({
        where: { brandAttributeValue: brandSlug }
      });

      if (!vendor) {
        vendor = await tx.vendorProfile.create({
          data: {
            brandAttributeValue: brandSlug,
            brandName: brandSlug.replace(/-/g, " "),
            commissionRate: defaultRate,
            countryCode: "NL" // Default to NL until portal sync
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

      // 3. Totals from Saleor Order Lines
      const brandGrossTotal = lines.reduce((acc, line) => acc + (line.totalPrice?.gross?.amount || 0), 0);
      const brandNetTotal = lines.reduce((acc, line) => acc + (line.totalPrice?.net?.amount || 0), 0);
      const brandVatTotal = brandGrossTotal - brandNetTotal;
      
      // Calculate effective VAT rate on the order for vendor reporting
      const orderVatRate = brandNetTotal > 0 ? (brandVatTotal / brandNetTotal) * 100 : 0;

      // 4. OSS & Destination Tracking
      const destinationCountry = order.shippingAddress?.country?.code || "NL";
      const isOss = globalSettings.ossEnabled && destinationCountry !== vendor.countryCode;

      // 5. Calculate Commission (Marketplaced based on Gross as per industry standard)
      const commissionNet = brandGrossTotal * (effectiveRate / 100);
      
      // 6. Apply Tax on Commission (Marketplace Fee Tax logic)
      // Dutch Hub Rules:
      // - Vendor in NL: 21% VAT
      // - Vendor in EU (non-NL) with VAT Number: 0% (Reverse Charge)
      // - others: 21% VAT (standard)
      let commissionVatRate = 0.21; 
      if (vendor.countryCode !== "NL" && vendor.vatNumber && vendor.isVatVerified) {
        commissionVatRate = 0.0; // EU Reverse Charge
      } else if (vendor.countryCode !== "NL" && !vendor.vatNumber) {
        commissionVatRate = 0.21;
      }
      
      const commissionVat = commissionNet * commissionVatRate;
      const commissionTotalCharged = commissionNet + commissionVat;

      const commission = await tx.commission.upsert({
        where: { orderId: `${order.id}-${brandSlug}` },
        update: {
          commissionAmount: commissionTotalCharged,
          commissionNet: commissionNet,
          commissionVat: commissionVat,
          vendorProfileId: vendor.id,
          orderGrossTotal: brandGrossTotal,
          orderNetTotal: brandNetTotal,
          orderVatTotal: brandVatTotal,
          orderVatRate: orderVatRate,
          destinationCountry: destinationCountry,
          isOss: isOss,
          rate: effectiveRate,
        },
        create: {
          orderId: `${order.id}-${brandSlug}`,
          vendorProfileId: vendor.id,
          commissionAmount: commissionTotalCharged,
          commissionNet: commissionNet,
          commissionVat: commissionVat,
          orderGrossTotal: brandGrossTotal,
          orderNetTotal: brandNetTotal,
          orderVatTotal: brandVatTotal,
          orderVatRate: orderVatRate,
          destinationCountry: destinationCountry,
          isOss: isOss,
          rate: effectiveRate,
          currency: order.total?.gross?.currency || "EUR",
        }
      });

      results.push({
        vendor,
        lines,
        commissionAmount: commissionTotalCharged,
        commissionId: commission.id
      });
    }

    return results;
  });
};
