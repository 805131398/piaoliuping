import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const skins = await prisma.driftBottleSkin.findMany({
      orderBy: [{ rarity: "asc" }, { name: "asc" }],
      include: { _count: { select: { userSkins: true } } },
    });

    return NextResponse.json({ skins });
  } catch (error) {
    console.error("获取瓶身风格失败:", error);
    return NextResponse.json({ error: "获取瓶身风格失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { code, name, description, rarity, previewUrl, isActive } = await request.json();
    if (!code || !name) {
      return NextResponse.json({ error: "code 和 name 不能为空" }, { status: 400 });
    }

    const skin = await prisma.driftBottleSkin.create({
      data: {
        code,
        name,
        description: description || null,
        rarity: rarity || "COMMON",
        previewUrl: previewUrl || null,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ skin });
  } catch (error) {
    console.error("创建瓶身风格失败:", error);
    return NextResponse.json({ error: "创建瓶身风格失败" }, { status: 500 });
  }
}
