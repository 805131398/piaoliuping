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

    const { name, color, sortOrder, isActive } = await request.json();
    const tag = await prisma.driftTag.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(color !== undefined && { color: color || null }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ tag });
  } catch (error) {
    console.error("更新标签失败:", error);
    return NextResponse.json({ error: "更新标签失败" }, { status: 500 });
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

    await prisma.driftTag.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除标签失败:", error);
    return NextResponse.json({ error: "删除标签失败" }, { status: 500 });
  }
}
