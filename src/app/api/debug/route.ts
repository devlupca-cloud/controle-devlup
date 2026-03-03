import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "";
  const directUrl = process.env.DIRECT_URL || "";

  // Show parts of the URL for debugging (hide password)
  const maskUrl = (url: string) => {
    try {
      const u = new URL(url);
      return `${u.protocol}//${u.username}:***@${u.host}${u.pathname}${u.search}`;
    } catch {
      return `INVALID URL: ${url.substring(0, 20)}...`;
    }
  };

  let dbTest = "not tested";
  try {
    const { prisma } = await import("@/lib/prisma");
    const count = await prisma.user.count();
    dbTest = `connected - ${count} users`;
  } catch (error: any) {
    dbTest = `error: ${error.message}`;
  }

  return NextResponse.json({
    DATABASE_URL: maskUrl(dbUrl),
    DIRECT_URL: maskUrl(directUrl),
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    dbTest,
  });
}
