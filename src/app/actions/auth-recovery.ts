"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mail";

const db = prisma as any;

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  try {
    const user = await db.adminUser.findUnique({
      where: { email },
    });

    if (!user) {
      // Security: return success even if user not found
      return { success: true };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.adminUser.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      } as any,
    });

    await sendPasswordResetEmail(email, token);

    return { success: true };
  } catch (error) {
    console.error("Error requesting reset:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token || !password || password !== confirmPassword) {
    return { error: "Invalid request or passwords do not match" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long" };
  }

  try {
    const user = await db.adminUser.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return { error: "Invalid or expired reset link" };
    }

    const hashedPassword = await hash(password, 10);

    await db.adminUser.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      } as any,
    });

    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { error: "An unexpected error occurred" };
  }
}
