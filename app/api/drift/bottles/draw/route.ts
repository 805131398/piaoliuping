import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

const DEFAULT_DAILY_DISCOVER_LIMIT = 10;

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

async function getCurrentUserId(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    salt: "authjs.session-token",
  });

  return typeof token?.id === "string" ? token.id : "";
}

async function getDailyDiscoverLimit() {
  const config = await prisma.config.findUnique({
    where: { key: "drift.daily_discover_limit" },
    select: { value: true },
  });
  const limit = Number(config?.value);

  return Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_DAILY_DISCOVER_LIMIT;
}

function serializeBottle<T extends { createdAt: Date; lastDriftedAt: Date }>(bottle: T) {
  return {
    ...bottle,
    createdAt: bottle.createdAt.toISOString(),
    lastDriftedAt: bottle.lastDriftedAt.toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);

    if (!userId) {
      return NextResponse.json({ code: 401, msg: "未登录或登录已过期" }, { status: 401 });
    }

    const counterDate = startOfToday();
    const limitCount = await getDailyDiscoverLimit();

    const result = await prisma.$transaction(async (tx) => {
      const counter = await tx.driftUserDailyCounter.upsert({
        where: {
          userId_counterDate_actionType: {
            userId,
            counterDate,
            actionType: "DISCOVER",
          },
        },
        create: {
          userId,
          counterDate,
          actionType: "DISCOVER",
          usedCount: 0,
          limitCount,
        },
        update: {
          limitCount,
        },
      });

      if (counter.usedCount >= counter.limitCount) {
        throw new Error("DAILY_DISCOVER_LIMIT_EXCEEDED");
      }

      const seenBottleRows = await tx.driftDiscovery.findMany({
        where: { finderId: userId },
        select: { bottleId: true },
      });

      const candidateCount = await tx.driftBottle.count({
        where: {
          authorId: { not: userId },
          deletedAt: null,
          status: "FLOATING",
          id: {
            notIn: seenBottleRows.map(row => row.bottleId),
          },
        },
      });

      if (candidateCount === 0) {
        throw new Error("NO_BOTTLE_AVAILABLE");
      }

      const skip = Math.floor(Math.random() * candidateCount);
      const [bottle] = await tx.driftBottle.findMany({
        where: {
          authorId: { not: userId },
          deletedAt: null,
          status: "FLOATING",
          id: {
            notIn: seenBottleRows.map(row => row.bottleId),
          },
        },
        orderBy: [
          { lastDriftedAt: "asc" },
          { createdAt: "asc" },
        ],
        skip,
        take: 1,
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
      });

      if (!bottle) {
        throw new Error("NO_BOTTLE_AVAILABLE");
      }

      const discovery = await tx.driftDiscovery.create({
        data: {
          bottleId: bottle.id,
          finderId: userId,
          source: "RANDOM",
          action: "OPENED",
        },
        select: {
          id: true,
          openedAt: true,
        },
      });

      const updatedBottle = await tx.driftBottle.update({
        where: { id: bottle.id },
        data: {
          discoveryCount: { increment: 1 },
          lastDriftedAt: new Date(),
        },
        select: {
          discoveryCount: true,
          lastDriftedAt: true,
        },
      });

      const updatedCounter = await tx.driftUserDailyCounter.update({
        where: { id: counter.id },
        data: { usedCount: { increment: 1 } },
        select: { usedCount: true, limitCount: true },
      });

      await tx.driftUserStats.upsert({
        where: { userId },
        create: {
          userId,
          discoveryCount: 1,
          lastActiveAt: new Date(),
        },
        update: {
          discoveryCount: { increment: 1 },
          lastActiveAt: new Date(),
        },
      });

      return {
        discovery: {
          id: discovery.id,
          openedAt: discovery.openedAt.toISOString(),
        },
        bottle: {
          ...serializeBottle({
            ...bottle,
            discoveryCount: updatedBottle.discoveryCount,
            lastDriftedAt: updatedBottle.lastDriftedAt,
          }),
          tags: bottle.tags.map(item => item.tag),
        },
        remainingDraws: Math.max(0, updatedCounter.limitCount - updatedCounter.usedCount),
      };
    });

    return NextResponse.json({ code: 200, status: "FOUND", msg: "捕捞成功", data: result });
  } catch (error) {
    if (error instanceof Error && error.message === "DAILY_DISCOVER_LIMIT_EXCEEDED") {
      return NextResponse.json({
        code: 429,
        status: "LIMIT_EXCEEDED",
        msg: "今天的捕捞次数已用完",
        data: null,
      });
    }

    if (error instanceof Error && error.message === "NO_BOTTLE_AVAILABLE") {
      return NextResponse.json({
        code: 404,
        status: "EMPTY",
        msg: "暂时没有可捕捞的漂流瓶",
        data: null,
      });
    }

    console.error("捕捞漂流瓶失败:", error);
    return NextResponse.json({ code: 500, msg: "捕捞失败，请稍后重试" }, { status: 500 });
  }
}
