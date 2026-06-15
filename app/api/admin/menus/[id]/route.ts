import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// PATCH /api/admin/menus/[id] - 更新菜单
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { label, type, icon, href, parentId, order, visible } = body;

    // 检查菜单是否存在
    const existingMenu = await prisma.menu.findUnique({
      where: { id },
    });

    if (!existingMenu) {
      return NextResponse.json({ error: "菜单不存在" }, { status: 404 });
    }

    // 如果修改父菜单，需要验证
    if (parentId !== undefined && parentId !== null) {
      // 不能将菜单设置为自己的子菜单
      if (parentId === id) {
        return NextResponse.json(
          { error: "不能将菜单设置为自己的子菜单" },
          { status: 400 }
        );
      }

      // 验证父菜单是否存在
      const parentMenu = await prisma.menu.findUnique({
        where: { id: parentId },
      });
      if (!parentMenu) {
        return NextResponse.json({ error: "父菜单不存在" }, { status: 400 });
      }

      // 防止循环引用：检查是否会形成循环
      const checkCircular = async (menuId: string, targetParentId: string): Promise<boolean> => {
        if (menuId === targetParentId) return true;
        
        const parent = await prisma.menu.findUnique({
          where: { id: targetParentId },
        });
        
        if (!parent || !parent.parentId) return false;
        
        return checkCircular(menuId, parent.parentId);
      };

      const isCircular = await checkCircular(id, parentId);
      if (isCircular) {
        return NextResponse.json(
          { error: "不能创建循环引用的菜单结构" },
          { status: 400 }
        );
      }
    }

    // 更新菜单
    const menu = await prisma.menu.update({
      where: { id },
      data: {
        ...(label !== undefined && { label }),
        ...(type !== undefined && { type }),
        ...(icon !== undefined && { icon: icon || null }),
        ...(href !== undefined && { href: href || null }),
        ...(parentId !== undefined && { parentId: parentId || null }),
        ...(order !== undefined && { order }),
        ...(visible !== undefined && { visible }),
      },
    });

    // 立即刷新后台管理页面的缓存
    revalidatePath("/admin", "layout");

    return NextResponse.json({ menu });
  } catch (error) {
    console.error("更新菜单失败:", error);
    return NextResponse.json({ error: "更新菜单失败" }, { status: 500 });
  }
}

// DELETE /api/admin/menus/[id] - 删除菜单
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = params;

    // 检查菜单是否存在
    const existingMenu = await prisma.menu.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });

    if (!existingMenu) {
      return NextResponse.json({ error: "菜单不存在" }, { status: 404 });
    }

    // 检查是否有子菜单
    if (existingMenu.children.length > 0) {
      return NextResponse.json(
        { error: "请先删除子菜单" },
        { status: 400 }
      );
    }

    // 删除菜单
    await prisma.menu.delete({
      where: { id },
    });

    // 立即刷新后台管理页面的缓存
    revalidatePath("/admin", "layout");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除菜单失败:", error);
    return NextResponse.json({ error: "删除菜单失败" }, { status: 500 });
  }
}
