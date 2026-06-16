import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const reports = await prisma.driftReport.findMany({
      where: status && status !== "all" ? { status: status as any } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        handler: { select: { id: true, name: true, email: true } },
        bottle: { select: { id: true, title: true, textContent: true, status: true } },
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("获取举报失败:", error);
    return NextResponse.json({ error: "获取举报失败" }, { status: 500 });
  }
}
