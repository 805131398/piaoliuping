import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * 退出登录接口
 * 
 * 由于 JWT 是无状态的，服务端无法主动使 token 失效
 * 这个接口主要用于：
 * 1. 验证当前 token 是否有效
 * 2. 返回成功响应，提示客户端删除本地 token
 * 3. 可选：记录退出日志
 */
export async function POST(req: NextRequest) {
  try {
    // 验证 token（可选，确认用户身份）
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    
    if (token?.id) {
      console.log(`用户 ${token.id} 退出登录`);
      // 这里可以添加退出日志记录到数据库
    }

    return NextResponse.json({ 
      success: true,
      message: "退出成功，请清除本地 token" 
    });
  } catch (error) {
    console.error("退出登录失败:", error);
    return NextResponse.json(
      { error: "退出失败" },
      { status: 500 }
    );
  }
}

// 支持 GET 请求（兼容性）
export async function GET(req: NextRequest) {
  return POST(req);
}
