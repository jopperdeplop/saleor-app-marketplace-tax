'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateGlobalSettings(formData: FormData) {
  const rateStr = formData.get("defaultRate");
  if (!rateStr) return;
  const rate = parseFloat(rateStr.toString());
  
  await prisma.systemSettings.upsert({
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
    },
  });

  revalidatePath(`/dashboard/vendor/${brandSlug}`);
}
