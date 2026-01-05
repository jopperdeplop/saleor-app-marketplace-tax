import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const GET = async (request: Request) => {
  const authHeader = request.headers.get("Authorization");

  if (process.env.APP_SECRET && authHeader !== `Bearer ${process.env.APP_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "global" },
    });

    return NextResponse.json({
      defaultCommissionRate: settings?.defaultCommissionRate || 10.0,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
