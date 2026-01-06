import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Type assertion to access adminUser - workaround for Prisma driver adapter type issue
const db = prisma as any;

// One-time setup endpoint to create admin user
// Protected by a setup secret to prevent unauthorized access
export async function POST(request: Request) {
  const { secret } = await request.json();

  // Verify setup secret
  if (secret !== process.env.APP_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Check if admin already exists
    const existing = await db.adminUser.findUnique({
      where: { email: "admin@salp.shop" },
    });

    if (existing) {
      return NextResponse.json({ message: "Admin user already exists", email: existing.email });
    }

    // Create admin user with secure password
    const hashedPassword = await bcrypt.hash("Admin123!", 10);

    const admin = await db.adminUser.create({
      data: {
        email: "admin@salp.shop",
        password: hashedPassword,
        name: "Admin",
      },
    });

    return NextResponse.json({ 
      message: "Admin user created successfully",
      email: admin.email,
      name: admin.name,
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
