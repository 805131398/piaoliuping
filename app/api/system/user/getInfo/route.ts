import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

/**
 * 获取当前登录用户信息
 * 
 * 请求头:
 * - Authorization: Bearer <token>
 * 
 * 返回:
 * - user: 用户信息对象
 * - roles: 用户角色列表
 */

export async function GET(request: NextRequest) {
  try {
    console.log("=== /api/system/user/getInfo 被调用 ===");
    console.log("Authorization header:", request.headers.get("authorization"));
    
    // 使用 NextAuth 的 getToken 解析 JWE token
    const token = await getToken({ 
      req: request, 
      secret: process.env.AUTH_SECRET,
      salt: "authjs.session-token",
    });
    
    console.log("getToken 解析结果:", token);
    console.log("AUTH_SECRET 是否存在:", !!process.env.AUTH_SECRET);

    if (!token?.id) {
      console.log("Token 无效或缺少 id 字段");
      return NextResponse.json(
        { code: 401, msg: "未登录或登录已过期" },
        { status: 401 }
      );
    }

    const userId = token.id as string;
    console.log("解析到的 userId:", userId);

    // 2. 查询用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { code: 404, msg: "用户不存在" },
        { status: 404 }
      );
    }

    // 3. 提取角色信息
    const roles = user.roles.map((ur) => ({
      roleId: ur.role.id,
      roleKey: ur.role.name,
      roleName: ur.role.description || ur.role.name,
    }));

    // 4. 返回用户信息（兼容小程序期望的格式）
    return NextResponse.json({
      code: 200,
      msg: "success",
      user: {
        userId: user.id,
        id: user.id,
        userName: user.name || "",
        nickName: user.name || "",
        avatar: user.image || "",
        phonenumber: user.phone || "",
        email: user.email || "",
        sex: "",
        roles: roles.map((r) => r.roleKey),
      },
      roles: roles,
    });
  } catch (error) {
    console.error("获取用户信息失败:", error);
    return NextResponse.json(
      { code: 500, msg: "获取用户信息失败" },
      { status: 500 }
    );
  }
}
