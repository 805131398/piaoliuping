import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  console.log(session?.user);

  if (!session?.user?.email && !session?.user?.phone) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { avatarStyle, avatarSeed, avatarUrl, avatarType } = await req.json();

  console.log(avatarStyle, avatarSeed, avatarUrl, avatarType);

  const whereClause = session.user.email
      ? { email: session.user.email }
      : { phone: session.user.phone };

  try {
    console.log(avatarType === "system", "avatarType === system");
    console.log(avatarType === "custom", "avatarType === custom");

    if (avatarType === "system") {
      console.log(avatarUrl, "保存系统头像");
      await prisma.user.update({
        where: whereClause,
        data: {
          avatarType,
          avatarStyle,
          avatarSeed,
        },
      });
    } else if (avatarType === "custom") {
      console.log(avatarUrl, "保存自定义头像");

      // 验证 URL 格式
      if (!avatarUrl || !avatarUrl.startsWith('http')) {
        return NextResponse.json({ error: "无效的头像 URL" }, { status: 400 });
      }

      await prisma.user.update({
        where: whereClause,
        data: {
          avatarType,
          image: avatarUrl, // 保存 OSS URL
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
} 