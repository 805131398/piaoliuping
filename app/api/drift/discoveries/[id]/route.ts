import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

async function getCurrentUserId(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    salt: "authjs.session-token",
  });

  return typeof token?.id === "string" ? token.id : "";
}

function serializeDiscovery(discovery: {
  id: string;
  openedAt: Date;
  action: string;
  bottle: {
    createdAt: Date;
    lastDriftedAt: Date;
    tags: Array<{
      tag: {
        id: string;
        code: string;
        name: string;
        color: string | null;
      };
    }>;
  };
}) {
  return {
    discovery: {
      id: discovery.id,
      openedAt: discovery.openedAt.toISOString(),
      action: discovery.action,
    },
    bottle: {
      ...discovery.bottle,
      createdAt: discovery.bottle.createdAt.toISOString(),
      lastDriftedAt: discovery.bottle.lastDriftedAt.toISOString(),
      tags: discovery.bottle.tags.map(item => item.tag),
    },
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getCurrentUserId(request);

    if (!userId) {
      return NextResponse.json({ code: 401, msg: "未登录或登录已过期" }, { status: 401 });
    }

    const { id } = await params;
    const discovery = await prisma.driftDiscovery.findFirst({
      where: {
        id,
        finderId: userId,
      },
      select: {
        id: true,
        openedAt: true,
        action: true,
        bottle: {
          select: {
            id: true,
            title: true,
            contentType: true,
            textContent: true,
            mediaUrl: true,
            mediaDurationSec: true,
            mood: true,
            isAnonymous: true,
            discoveryCount: true,
            replyCount: true,
            lastDriftedAt: true,
            createdAt: true,
            tags: {
              select: {
                tag: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                    color: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!discovery) {
      return NextResponse.json({ code: 404, msg: "没有找到这只漂流瓶" }, { status: 404 });
    }

    return NextResponse.json({ code: 200, msg: "获取成功", data: serializeDiscovery(discovery) });
  } catch (error) {
    console.error("获取漂流瓶发现记录失败:", error);
    return NextResponse.json({ code: 500, msg: "获取漂流瓶失败，请稍后重试" }, { status: 500 });
  }
}
