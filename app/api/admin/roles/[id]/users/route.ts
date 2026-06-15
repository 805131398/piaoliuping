import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/roles/[id]/users - 获取角色的用户列表
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = params;

    // 检查角色是否存在
    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      return NextResponse.json({ error: "角色不存在" }, { status: 404 });
    }

    // 获取该角色的所有用户（通过 UserRole 关联表）
    const userRoles = await prisma.userRole.findMany({
      where: {
        roleId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const users = userRoles.map(ur => ur.user);

    return NextResponse.json({
      users,
      total: users.length,
      roleName: role.name,
    });
  } catch (error) {
    console.error("获取角色用户列表失败:", error);
    return NextResponse.json({ error: "获取角色用户列表失败" }, { status: 500 });
  }
}
