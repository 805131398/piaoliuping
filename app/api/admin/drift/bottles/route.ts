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
    const q = searchParams.get("q");

    const bottles = await prisma.driftBottle.findMany({
      where: {
        ...(status && status !== "all" ? { status: status as any } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { textContent: { contains: q, mode: "insensitive" } },
                { author: { name: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        author: { select: { id: true, name: true, email: true, phone: true } },
        tags: { include: { tag: true } },
        _count: { select: { discoveries: true, conversations: true, reports: true } },
      },
    });

    return NextResponse.json({ bottles });
  } catch (error) {
    console.error("获取漂流瓶列表失败:", error);
    return NextResponse.json({ error: "获取漂流瓶列表失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const { authorId, title, contentType, textContent, mood, status, tagIds = [] } = body;

    if (!authorId || !contentType) {
      return NextResponse.json({ error: "authorId 和 contentType 不能为空" }, { status: 400 });
    }

    const bottle = await prisma.driftBottle.create({
      data: {
        authorId,
        title: title || null,
        contentType,
        textContent: textContent || null,
        mood: mood || null,
        status: status || "FLOATING",
        tags: {
          create: tagIds.map((tagId: string) => ({ tagId })),
        },
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json({ bottle });
  } catch (error) {
    console.error("创建漂流瓶失败:", error);
    return NextResponse.json({ error: "创建漂流瓶失败" }, { status: 500 });
  }
}
