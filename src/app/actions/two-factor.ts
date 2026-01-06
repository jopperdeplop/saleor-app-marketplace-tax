"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { revalidatePath } from "next/cache";

// Type definition for db to avoid lint errors
const db = prisma as any;

export async function generate2FASecret() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const secret = speakeasy.generateSecret({
    name: `AdminHub:${session.user.email}`,
  });

  const otpauthUrl = secret.otpauth_url;
  if (!otpauthUrl) throw new Error("Failed to generate OTP URL");

  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

  return {
    secret: secret.base32,
    qrCodeUrl,
  };
}

export async function enable2FA(secret: string, code: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const verified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: code,
  });

  if (!verified) {
    return { error: "Invalid verification code" };
  }

  await db.adminUser.update({
    where: { id: session.user.id },
    data: {
      twoFactorSecret: secret,
      twoFactorEnabled: true,
    } as any,
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function disable2FA() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.adminUser.update({
    where: { id: session.user.id },
    data: {
      twoFactorSecret: null,
      twoFactorEnabled: false,
    } as any,
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}
