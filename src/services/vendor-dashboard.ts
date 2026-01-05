import { prisma } from "@/lib/prisma";

export const getVendorData = async (brandSlug: string) => {
  const vendor = await prisma.vendorProfile.findFirst({
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
  });

  if (!vendor) return null;

  const invoices = await prisma.invoiceLog.findMany({
    where: {
      orderId: { in: vendor.commissions.map((c) => c.orderId.split("-")[0]) }
    },
    orderBy: { createdAt: "desc" },
  });

  return { vendor, commissions: vendor.commissions, invoices };
};
