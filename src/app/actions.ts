'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateGlobalSettings(formData: FormData) {
  const rate = parseFloat(formData.get("defaultRate") as string);
  
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
  const tempRateStr = formData.get("tempRate") as string;
  const endDateStr = formData.get("endDate") as string;

  const tempRate = tempRateStr ? parseFloat(tempRateStr) : null;
  const endDate = endDateStr ? new Date(endDateStr) : null;

  await prisma.vendorProfile.update({
    where: { brandAttributeValue: brandSlug },
    data: {
      temporaryCommissionRate: tempRate,
      temporaryCommissionEndsAt: endDate,
    },
  });

  revalidatePath(`/dashboard/vendor/${brandSlug}`);
}
