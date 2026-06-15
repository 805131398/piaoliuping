import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await auth();
    console.log(session);
    
    // 支持邮箱或手机号登录
    if (!session?.user?.email && !session?.user?.phone) {
        return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { nickname } = await req.json();
    
    // 根据登录方式更新用户信息
    const whereClause = session.user.email 
        ? { email: session.user.email }
        : { phone: session.user.phone };
    
    await prisma.user.update({
        where: whereClause,
        data: { name: nickname }
    });
    return NextResponse.json({ success: true });
}

export async function GET() {
    const session = await auth();
    
    // 支持邮箱或手机号登录
    if (!session?.user?.email && !session?.user?.phone) {
        return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    
    // 根据登录方式查询用户信息
    const whereClause = session.user.email 
        ? { email: session.user.email }
        : { phone: session.user.phone };
    
    const user = await prisma.user.findUnique({
        where: whereClause,
        select: { name: true, email: true, phone: true, image: true, id: true, avatarType: true, avatarStyle: true, avatarSeed: true }
    });
    
    // 查询账户信息
    const account = await prisma.account.findFirst({
        where: { userId: user?.id },
        select: { provider: true }
    });
    
    return NextResponse.json({ 
        ...user, 
        provider: account?.provider || null 
    });
} 