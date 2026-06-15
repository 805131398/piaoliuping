import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

/**
 * 更新用户资料接口
 * 
 * 请求体:
 * - nickName?: 昵称
 * - avatar?: 头像URL
 * - phonenumber?: 手机号
 */

export async function POST(request: NextRequest) {
  try {
    // 1. 验证登录状态
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      salt: "authjs.session-token",
    });

    if (!token?.id) {
      return NextResponse.json(
        { code: 401, msg: "登录已过期" },
        { status: 401 }
      );
    }

    const userId = token.id as string;

    // 2. 获取更新数据
    const body = await request.json();
    const { nickName, avatar, phonenumber } = body;

    // 3. 构建更新对象
    const updateData: Record<string, string> = {};
    
    if (nickName !== undefined && nickName !== null) {
      updateData.name = String(nickName).trim();
    }
    
    if (avatar !== undefined && avatar !== null) {
      updateData.image = String(avatar);
      updateData.avatarType = "custom";
    }
    
    if (phonenumber !== undefined && phonenumber !== null) {
      const phone = String(phonenumber).replace(/\D/g, "");
      if (phone.length === 11) {
        updateData.phone = phone;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        code: 200,
        msg: "无需更新",
      });
    }

    // 4. 更新用户
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      code: 200,
      msg: "success",
      data: {
        userId: user.id,
        userName: user.name,
        nickName: user.name,
        avatar: user.image,
        phonenumber: user.phone,
      },
    });
  } catch (error) {
    console.error("更新用户资料失败:", error);
    return NextResponse.json(
      { code: 500, msg: "更新失败" },
      { status: 500 }
    );
  }
}
