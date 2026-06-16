import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const tags = await prisma.driftTag.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { bottles: true } } },
    });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("获取标签失败:", error);
    return NextResponse.json({ error: "获取标签失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { code, name, color, sortOrder, isActive } = await request.json();
    if (!code || !name) {
      return NextResponse.json({ error: "code 和 name 不能为空" }, { status: 400 });
    }

    const tag = await prisma.driftTag.create({
      data: {
        code,
        name,
        color: color || null,
        sortOrder: Number(sortOrder || 0),
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ tag });
  } catch (error) {
    console.error("创建标签失败:", error);
    return NextResponse.json({ error: "创建标签失败" }, { status: 500 });
  }
}
