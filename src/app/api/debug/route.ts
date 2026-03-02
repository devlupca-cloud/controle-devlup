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
        hasDbUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL,
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
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
