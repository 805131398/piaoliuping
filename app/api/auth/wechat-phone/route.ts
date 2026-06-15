import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken, decode } from "next-auth/jwt";

/**
 * 微信手机号解密接口
 *
 * 请求体:
 * - code: 微信 getPhoneNumber 返回的 code
 *
 * 返回:
 * - phonenumber: 解密后的手机号
 */

interface WechatPhoneResponse {
  errcode?: number;
  errmsg?: string;
  phone_info?: {
    phoneNumber: string;
    purePhoneNumber: string;
    countryCode: string;
  };
}

// 获取微信小程序配置
async function getWechatConfig() {
  const appIdConfig = await prisma.config.findUnique({
    where: { key: "wechat.mini.appid" },
  });
  const appSecretConfig = await prisma.config.findUnique({
    where: { key: "wechat.mini.secret" },
  });

  return {
    appId: appIdConfig?.value || process.env.WECHAT_MINIPROGRAM_APPID,
    appSecret: appSecretConfig?.value || process.env.WECHAT_MINIPROGRAM_SECRET,
  };
}

// 获取 access_token
async function getAccessToken(): Promise<string> {
  const { appId, appSecret } = await getWechatConfig();

  if (!appId || !appSecret) {
    throw new Error("微信小程序配置缺失");
  }

  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.errcode) {
    throw new Error(data.errmsg || "获取 access_token 失败");
  }

  return data.access_token;
}

// 通过 code 获取手机号
async function getPhoneNumber(code: string): Promise<WechatPhoneResponse> {
  const accessToken = await getAccessToken();

  const url = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    // 1. 验证登录状态 - 使用与其他 /api 接口一致的方式
    const authHeader = request.headers.get("authorization");
    let tokenString;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      tokenString = authHeader.split(" ")[1];
    }

    let token;
    if (tokenString) {
      token = await decode({
        token: tokenString,
        secret: process.env.AUTH_SECRET!,
        salt: "authjs.session-token",
      });
    } else {
      token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
        salt: "authjs.session-token",
      });
    }

    if (!token || !token.id) {
      return NextResponse.json(
        { code: 401, msg: "未登录" },
        { status: 401 }
      );
    }

    const userId = token.id as string;

    // 2. 获取 code
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json(
        { code: 400, msg: "缺少 code 参数" },
        { status: 400 }
      );
    }

    // 3. 调用微信接口获取手机号
    const phoneData = await getPhoneNumber(code);

    if (phoneData.errcode) {
      console.error("获取手机号失败:", phoneData);
      return NextResponse.json(
        { code: 400, msg: phoneData.errmsg || "获取手机号失败" },
        { status: 400 }
      );
    }

    const phoneNumber = phoneData.phone_info?.purePhoneNumber;
    if (!phoneNumber) {
      return NextResponse.json(
        { code: 400, msg: "获取手机号失败" },
        { status: 400 }
      );
    }

    // 4. 更新用户手机号
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { phone: phoneNumber },
      });
    } catch (error: any) {
      // 处理唯一约束冲突 (P2002)
      if (error.code === 'P2002') {
        return NextResponse.json(
          { code: 400, msg: "该手机号已被其他账号绑定" },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      code: 200,
      msg: "success",
      phonenumber: phoneNumber,
    });
  } catch (error) {
    console.error("微信手机号解密失败:", error);
    return NextResponse.json(
      { code: 500, msg: "获取手机号失败" },
      { status: 500 }
    );
  }
}
