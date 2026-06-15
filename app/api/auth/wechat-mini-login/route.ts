import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import { encode } from "next-auth/jwt";

/**
 * 微信小程序登录接口
 * 
 * 请求体:
 * - socialCode: 小程序 wx.login() 获取的 code
 * - socialState?: 登录状态标识
 * - userInfo?: 用户信息（可选，用于更新用户资料）
 *   - nickName: 昵称
 *   - avatarUrl: 头像URL
 * 
 * 返回:
 * - token / access_token: NextAuth JWT token，用于后续请求认证
 * - expiresIn / expire_in: token 有效期（秒）
 * - user: 用户信息
 */

interface WechatSessionResponse {
  openid?: string;
  session_key?: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

interface UserInfo {
  nickName?: string;
  avatarUrl?: string;
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

// 通过 code 获取微信 session
async function getWechatSession(code: string): Promise<WechatSessionResponse> {
  const { appId, appSecret } = await getWechatConfig();

  if (!appId || !appSecret) {
    throw new Error("微信小程序配置缺失");
  }

  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;

  const response = await fetch(url);
  const data = await response.json();

  return data;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { 
      socialCode?: string;
      code?: string;  // 兼容直接传 code 的情况
      socialState?: string;
      source?: string;
      userInfo?: UserInfo;
    };

    // 兼容 socialCode 和 code 两种参数名
    const code = body.socialCode || body.code;

    if (!code) {
      return NextResponse.json(
        { error: "缺少 socialCode 参数" },
        { status: 400 }
      );
    }

    // 1. 通过 code 获取 openid
    const sessionData = await getWechatSession(code);

    if (sessionData.errcode) {
      console.error("微信登录失败:", sessionData);
      return NextResponse.json(
        { error: sessionData.errmsg || "微信登录失败" },
        { status: 400 }
      );
    }

    const { openid, unionid } = sessionData;

    if (!openid) {
      return NextResponse.json(
        { error: "获取 openid 失败" },
        { status: 400 }
      );
    }

    // 2. 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { openid },
    });

    if (!user) {
      // 如果有 unionid，尝试通过 unionid 查找（用于多端互通）
      if (unionid) {
        user = await prisma.user.findUnique({
          where: { unionid },
        });
      }

      if (!user) {
        // 创建新用户
        user = await prisma.user.create({
          data: {
            openid,
            unionid,
            name: body.userInfo?.nickName || `微信用户${openid.slice(-4)}`,
            image: body.userInfo?.avatarUrl,
            avatarType: body.userInfo?.avatarUrl ? "custom" : "system",
            avatarStyle: "lorelei",
            avatarSeed: openid,
          },
        });

        // 创建账户记录
        await prisma.account.create({
          data: {
            userId: user.id,
            type: "oauth",
            provider: "wechat_miniprogram",
            providerAccountId: openid,
          },
        });

        console.log("新微信用户已创建:", user.id);
      } else {
        // 用 unionid 找到了用户，更新 openid
        user = await prisma.user.update({
          where: { id: user.id },
          data: { openid },
        });
      }
    } else {
      // 更新用户信息（如果提供了新的用户信息）
      const userInfo = body.userInfo;
      if (userInfo?.nickName || userInfo?.avatarUrl || unionid) {
        const updateData: Record<string, string | undefined> = {};
        if (userInfo?.nickName) updateData.name = userInfo.nickName;
        if (userInfo?.avatarUrl) {
          updateData.image = userInfo.avatarUrl;
          updateData.avatarType = "custom";
        }
        if (unionid) updateData.unionid = unionid;

        if (Object.keys(updateData).length > 0) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
          });
        }
      }
    }

    // 3. 使用 NextAuth 的 encode 生成标准 JWT token
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new Error("AUTH_SECRET 未配置");
    }

    // 构造符合 NextAuth JWT 格式的 token payload
    const token = await encode({
      token: {
        id: user.id,
        email: user.email || "",
        phone: user.phone || "",
        name: user.name || "",
        image: user.image || "",
        avatarType: user.avatarType,
        avatarStyle: user.avatarStyle,
        avatarSeed: user.avatarSeed,
      },
      secret,
      salt: "authjs.session-token", // NextAuth v5 默认 cookie 名称
      maxAge: 30 * 24 * 60 * 60, // 30天
    });

    // 4. 返回用户信息和 token（兼容小程序期望的字段格式）
    const expiresIn = 30 * 24 * 60 * 60; // 30天，单位秒
    return NextResponse.json({
      // 兼容两种格式
      token,
      access_token: token,
      expiresIn,
      expire_in: expiresIn,
      user: {
        userId: user.id,
        userName: user.name,
        nickName: user.name,
        avatar: user.image,
        phonenumber: user.phone,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("微信小程序登录失败:", error);
    return NextResponse.json(
      { error: "登录失败，请稍后重试" },
      { status: 500 }
    );
  }
}
