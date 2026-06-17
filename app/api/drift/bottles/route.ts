import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

const MOODS = new Set(["HAPPY", "LONELY", "CURIOUS", "CALM", "SAD"]);
const CONTENT_TYPES = new Set(["TEXT", "VOICE", "IMAGE"]);
const DEFAULT_DAILY_THROW_LIMIT = 3;

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function extractObjectKey(url?: string | null) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    return decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
  } catch {
    return null;
  }
}

async function getCurrentUserId(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    salt: "authjs.session-token",
  });

  return typeof token?.id === "string" ? token.id : "";
}

async function getDailyThrowLimit() {
  const config = await prisma.config.findUnique({
    where: { key: "drift.daily_throw_limit" },
    select: { value: true },
  });
  const limit = Number(config?.value);

  return Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_DAILY_THROW_LIMIT;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);

    if (!userId) {
      return NextResponse.json({ code: 401, msg: "未登录或登录已过期" }, { status: 401 });
    }

    const body = await request.json();
    const contentType = String(body.contentType || "").toUpperCase();
    const textContent = typeof body.textContent === "string" ? body.textContent.trim() : "";
    const mediaUrl = typeof body.mediaUrl === "string" ? body.mediaUrl.trim() : "";
    const mediaDurationSec = Number(body.mediaDurationSec);
    const mood = body.mood ? String(body.mood).toUpperCase() : null;
    const isAnonymous = body.isAnonymous !== false;

    if (!CONTENT_TYPES.has(contentType)) {
      return NextResponse.json({ code: 400, msg: "漂流瓶类型不正确" }, { status: 400 });
    }

    if (!textContent && !mediaUrl) {
      return NextResponse.json({ code: 400, msg: "请至少留下一段内容" }, { status: 400 });
    }

    if ((contentType === "VOICE" || contentType === "IMAGE") && !mediaUrl) {
      return NextResponse.json({ code: 400, msg: "请先上传附件" }, { status: 400 });
    }

    if (textContent.length > 500) {
      return NextResponse.json({ code: 400, msg: "文字内容不能超过500字" }, { status: 400 });
    }

    if (mood && !MOODS.has(mood)) {
      return NextResponse.json({ code: 400, msg: "心情类型不正确" }, { status: 400 });
    }

    const counterDate = startOfToday();
    const limitCount = await getDailyThrowLimit();

    const result = await prisma.$transaction(async (tx) => {
      const counter = await tx.driftUserDailyCounter.upsert({
        where: {
          userId_counterDate_actionType: {
            userId,
            counterDate,
            actionType: "THROW",
          },
        },
        create: {
          userId,
          counterDate,
          actionType: "THROW",
          usedCount: 0,
          limitCount,
        },
        update: {
          limitCount,
        },
      });

      if (counter.usedCount >= counter.limitCount) {
        throw new Error("DAILY_THROW_LIMIT_EXCEEDED");
      }

      const bottle = await tx.driftBottle.create({
        data: {
          authorId: userId,
          title: textContent.slice(0, 24) || null,
          contentType: contentType as any,
          textContent: textContent || null,
          mediaUrl: mediaUrl || null,
          mediaObjectKey: extractObjectKey(mediaUrl),
          mediaDurationSec: contentType === "VOICE" && Number.isFinite(mediaDurationSec)
            ? Math.max(1, Math.round(mediaDurationSec))
            : null,
          mood: mood as any,
          status: "FLOATING",
          isAnonymous,
          lastDriftedAt: new Date(),
        },
        select: {
          id: true,
          contentType: true,
          textContent: true,
          mediaUrl: true,
          mediaDurationSec: true,
          mood: true,
          status: true,
          createdAt: true,
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
          bottleCount: 1,
          lastActiveAt: new Date(),
        },
        update: {
          bottleCount: { increment: 1 },
          lastActiveAt: new Date(),
        },
      });

      return {
        bottle,
        remainingThrows: Math.max(0, updatedCounter.limitCount - updatedCounter.usedCount),
      };
    });

    return NextResponse.json({ code: 200, msg: "投递成功", data: result });
  } catch (error) {
    if (error instanceof Error && error.message === "DAILY_THROW_LIMIT_EXCEEDED") {
      return NextResponse.json({ code: 429, msg: "今天的投递次数已用完" }, { status: 429 });
    }

    console.error("投递漂流瓶失败:", error);
    return NextResponse.json({ code: 500, msg: "投递失败，请稍后重试" }, { status: 500 });
  }
}
