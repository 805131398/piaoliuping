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

    const { id } = params;
    const body = await request.json();
    const { title, textContent, mood, status, isAnonymous, tagIds } = body;

    const bottle = await prisma.$transaction(async (tx) => {
      if (Array.isArray(tagIds)) {
        await tx.driftBottleTag.deleteMany({ where: { bottleId: id } });
        if (tagIds.length > 0) {
          await tx.driftBottleTag.createMany({
            data: tagIds.map((tagId: string) => ({ bottleId: id, tagId })),
            skipDuplicates: true,
          });
        }
      }

      return tx.driftBottle.update({
        where: { id },
        data: {
          ...(title !== undefined && { title: title || null }),
          ...(textContent !== undefined && { textContent: textContent || null }),
          ...(mood !== undefined && { mood: mood || null }),
          ...(status !== undefined && { status }),
          ...(isAnonymous !== undefined && { isAnonymous }),
        },
        include: {
          author: { select: { id: true, name: true, email: true } },
          tags: { include: { tag: true } },
          _count: { select: { discoveries: true, conversations: true, reports: true } },
        },
      });
    });

    return NextResponse.json({ bottle });
  } catch (error) {
    console.error("更新漂流瓶失败:", error);
    return NextResponse.json({ error: "更新漂流瓶失败" }, { status: 500 });
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

    await prisma.driftBottle.update({
      where: { id: params.id },
      data: {
        status: "DELETED",
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除漂流瓶失败:", error);
    return NextResponse.json({ error: "删除漂流瓶失败" }, { status: 500 });
  }
}
