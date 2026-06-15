import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9_-]{3,32}$/;

export async function POST(request: NextRequest) {
  try {
    const { email, username, password, name } = await request.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedUsername = typeof username === "string" ? username.trim() : "";

    // 验证必填字段
    if ((!normalizedEmail && !normalizedUsername) || !password) {
      return NextResponse.json(
        { error: "用户名或邮箱与密码不能为空" },
        { status: 400 }
      );
    }

    if (normalizedEmail && !emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "邮箱格式不正确" },
        { status: 400 }
      );
    }

    if (normalizedUsername && !usernameRegex.test(normalizedUsername)) {
      return NextResponse.json(
        { error: "用户名仅支持 3-32 位字母、数字、下划线和中划线" },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码长度不能少于6位" },
        { status: 400 }
      );
    }

    const [existingByEmail, existingByUsername] = await Promise.all([
      normalizedEmail
        ? prisma.user.findUnique({
            where: { email: normalizedEmail },
          })
        : Promise.resolve(null),
      normalizedUsername
        ? prisma.user.findUnique({
            where: { username: normalizedUsername },
          })
        : Promise.resolve(null),
    ]);

    if (
      existingByEmail
      && existingByUsername
      && existingByEmail.id !== existingByUsername.id
    ) {
      return NextResponse.json(
        { error: "用户名或邮箱已被其他账户使用" },
        { status: 400 }
      );
    }

    const existingUser = existingByEmail || existingByUsername;

    if (existingUser) {
      // 如果用户存在但没有密码，允许设置密码（绑定密码登录）
      if (!existingUser.password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            password: hashedPassword,
            username: existingUser.username || normalizedUsername || null,
            email: existingUser.email || normalizedEmail || null,
            name: existingUser.name || name || normalizedUsername || normalizedEmail.split("@")[0] || null,
          },
        });

        // 创建 credentials 账户记录
        const existingAccount = await prisma.account.findFirst({
          where: {
            userId: existingUser.id,
            provider: "credentials",
          },
        });

        if (!existingAccount) {
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: "credentials",
              provider: "credentials",
              providerAccountId: normalizedUsername || normalizedEmail,
            },
          });
        }

        return NextResponse.json({
          success: true,
          message: "密码设置成功，现在可以使用密码登录",
        });
      }

      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 生成随机头像种子
    const avatarSeed = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    // 默认昵称优先取显示名，其次用户名，再其次邮箱前缀
    const defaultName = name || normalizedUsername || normalizedEmail.split("@")[0];

    // 创建新用户
    const user = await prisma.user.create({
      data: {
        username: normalizedUsername || null,
        email: normalizedEmail || null,
        password: hashedPassword,
        name: defaultName,
        emailVerified: new Date(), // 密码注册默认视为已验证
        avatarType: "system",
        avatarStyle: "lorelei",
        avatarSeed,
      },
    });

    // 创建账户记录
    await prisma.account.create({
      data: {
        userId: user.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: normalizedUsername || normalizedEmail,
      },
    });

    console.log("新用户注册成功:", user.username || user.email);

    return NextResponse.json({
      success: true,
      message: "注册成功",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("注册失败:", error);
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
