import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  // 获取用户的 GitHub access_token
  const account = await prisma.account.findFirst({
    where: {
      user: { email: session.user.email },
      provider: "github",
    },
  });
  if (!account?.access_token) {
    return NextResponse.json({ error: "未绑定 GitHub" }, { status: 400 });
  }

  // 拉取 GitHub 用户信息
  const githubRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `token ${account.access_token}` },
  });
  if (!githubRes.ok) {
    return NextResponse.json({ error: "GitHub 拉取失败" }, { status: 500 });
  }
  const githubUser = await githubRes.json();

  // 更新数据库
  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      name: githubUser.name || githubUser.login,
      image: githubUser.avatar_url,
    },
  });

  return NextResponse.json({ success: true });
} 