import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// GET /api/admin/menus - 获取菜单列表（树形结构）
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 添加性能监控
    const startTime = Date.now();

    const allMenus = await prisma.menu.findMany({
      orderBy: [
        { order: "asc" },
        { createdAt: "asc" },
      ],
    });

    console.log(`[Menus API] DB query took ${Date.now() - startTime}ms`);

    // 构建树形结构
    const menuMap = new Map();
    const rootMenus: any[] = [];

    // 先创建所有菜单节点
    allMenus.forEach((menu: {
      id: string;
      label: string;
      type: string;
      icon: string | null;
      href: string | null;
      parentId: string | null;
      order: number;
      visible: boolean;
      createdAt: Date;
      updatedAt: Date;
    }) => {
      menuMap.set(menu.id, {
        id: menu.id,
        label: menu.label,
        type: menu.type,
        icon: menu.icon,
        href: menu.href,
        parentId: menu.parentId,
        order: menu.order,
        visible: menu.visible,
        createdAt: menu.createdAt,
        updatedAt: menu.updatedAt,
        children: [],
      });
    });

    // 构建树形关系
    allMenus.forEach((menu: {
      id: string;
      parentId: string | null;
    }) => {
      const menuNode = menuMap.get(menu.id);
      if (menu.parentId) {
        const parent = menuMap.get(menu.parentId);
        if (parent) {
          parent.children.push(menuNode);
        }
      } else {
        rootMenus.push(menuNode);
      }
    });

    console.log(`[Menus API] Total time: ${Date.now() - startTime}ms`);

    return NextResponse.json({
      menus: rootMenus,
      total: allMenus.length,
    });
  } catch (error) {
    console.error("获取菜单列表失败:", error);
    return NextResponse.json({ error: "获取菜单列表失败" }, { status: 500 });
  }
}

// POST /api/admin/menus - 创建新菜单
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const { label, type, icon, href, parentId, order, visible } = body;

    // 验证必填字段
    if (!label) {
      return NextResponse.json({ error: "菜单名称不能为空" }, { status: 400 });
    }

    // 如果指定了父菜单，验证父菜单是否存在
    if (parentId) {
      const parentMenu = await prisma.menu.findUnique({
        where: { id: parentId },
      });
      if (!parentMenu) {
        return NextResponse.json({ error: "父菜单不存在" }, { status: 400 });
      }
    }

    // 创建菜单
    const menu = await prisma.menu.create({
      data: {
        label,
        type: type || "MENU",
        icon: icon || null,
        href: href || null,
        parentId: parentId || null,
        order: order || 0,
        visible: visible !== undefined ? visible : true,
      },
    });

    // 立即刷新后台管理页面的缓存
    revalidatePath("/admin", "layout");

    return NextResponse.json({ menu });
  } catch (error) {
    console.error("创建菜单失败:", error);
    return NextResponse.json({ error: "创建菜单失败" }, { status: 500 });
  }
}
