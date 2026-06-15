import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/users/available - 获取可用用户列表（排除指定角色的用户）
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get("roleId");

    if (!roleId) {
      // 如果没有指定角色，返回所有用户
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({ users });
    }

    // 获取该角色已有的用户ID
    const existingUserRoles = await prisma.userRole.findMany({
      where: { roleId },
      select: { userId: true },
    });

    const existingUserIds = existingUserRoles.map(ur => ur.userId);

    // 获取不在该角色的用户
    const availableUsers = await prisma.user.findMany({
      where: {
        id: {
          notIn: existingUserIds,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      users: availableUsers,
      total: availableUsers.length,
    });
  } catch (error) {
    console.error("获取可用用户列表失败:", error);
    return NextResponse.json({ error: "获取可用用户列表失败" }, { status: 500 });
  }
}
