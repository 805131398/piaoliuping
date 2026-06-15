import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/roles - 获取角色列表
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const roles = await prisma.role.findMany({
      include: {
        menus: {
          include: {
            menu: true,
          },
        },
        _count: {
          select: {
            users: true,
            menus: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      roles,
      total: roles.length,
    });
  } catch (error) {
    console.error("获取角色列表失败:", error);
    return NextResponse.json({ error: "获取角色列表失败" }, { status: 500 });
  }
}

// POST /api/admin/roles - 创建角色
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { name, description, menuIds } = await request.json();

    // 验证必填字段
    if (!name) {
      return NextResponse.json({ error: "角色名称不能为空" }, { status: 400 });
    }

    // 检查角色名称是否已存在
    const existingRole = await prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      return NextResponse.json({ error: "角色名称已存在" }, { status: 400 });
    }

    // 创建角色
    const role = await prisma.role.create({
      data: {
        name,
        description: description || null,
        menus: menuIds && menuIds.length > 0
          ? {
              create: menuIds.map((menuId: string) => ({
                menu: {
                  connect: { id: menuId },
                },
              })),
            }
          : undefined,
      },
      include: {
        menus: {
          include: {
            menu: true,
          },
        },
        _count: {
          select: {
            users: true,
            menus: true,
          },
        },
      },
    });

    return NextResponse.json({ role });
  } catch (error) {
    console.error("创建角色失败:", error);
    return NextResponse.json({ error: "创建角色失败" }, { status: 500 });
  }
}
