import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { name, description, rarity, previewUrl, isActive } = await request.json();
    const skin = await prisma.driftBottleSkin.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(rarity !== undefined && { rarity }),
        ...(previewUrl !== undefined && { previewUrl: previewUrl || null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ skin });
  } catch (error) {
    console.error("更新瓶身风格失败:", error);
    return NextResponse.json({ error: "更新瓶身风格失败" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    await prisma.driftBottleSkin.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除瓶身风格失败:", error);
    return NextResponse.json({ error: "删除瓶身风格失败" }, { status: 500 });
  }
}
