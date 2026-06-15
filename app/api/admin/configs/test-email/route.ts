import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendTestEmail } from "@/lib/email";

// POST /api/admin/configs/test-email - 发送测试邮件
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "请提供接收邮箱地址" }, { status: 400 });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
    }

    // 发送测试邮件
    const result = await sendTestEmail(email);

    return NextResponse.json({
      success: true,
      message: `测试邮件已发送到 ${email}`,
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error("发送测试邮件失败:", error);
    return NextResponse.json({ 
      error: error.message || "发送测试邮件失败" 
    }, { status: 500 });
  }
}
