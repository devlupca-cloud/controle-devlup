import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true },
    });
    return NextResponse.json({
      ok: true,
      dbConnected: true,
      userCount,
      users,
      env: {
        dbUrlStart: process.env.DATABASE_URL?.substring(0, 30) + "...",
        dbUrlEnd: "..." + process.env.DATABASE_URL?.slice(-30),
        hasDirectUrl: !!process.env.DIRECT_URL,
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      dbConnected: false,
      error: error.message,
    });
  }
}
