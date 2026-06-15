import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/config-categories/[id] - 获取单个分类
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;

    const category = await prisma.configCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { configs: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json({ error: "分类不存在" }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("获取分类详情失败:", error);
    return NextResponse.json({ error: "获取分类详情失败" }, { status: 500 });
  }
}

// PATCH /api/admin/config-categories/[id] - 更新分类
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;
    const { value, label, description, order } = await request.json();

    // 检查分类是否存在
    const existingCategory = await prisma.configCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: "分类不存在" }, { status: 404 });
    }

    // 如果修改了 value，检查是否与其他分类冲突
    if (value && value !== existingCategory.value) {
      const duplicateCategory = await prisma.configCategory.findUnique({
        where: { value },
      });

      if (duplicateCategory) {
        return NextResponse.json({ error: "分类标识已被使用" }, { status: 400 });
      }
    }

    // 更新分类
    const category = await prisma.configCategory.update({
      where: { id },
      data: {
        ...(value !== undefined && { value }),
        ...(label !== undefined && { label }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("更新分类失败:", error);
    return NextResponse.json({ error: "更新分类失败" }, { status: 500 });
  }
}

// DELETE /api/admin/config-categories/[id] - 删除分类
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;

    // 检查分类是否存在
    const existingCategory = await prisma.configCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { configs: true }
        }
      }
    });

    if (!existingCategory) {
      return NextResponse.json({ error: "分类不存在" }, { status: 404 });
    }

    // 如果分类下有配置，提示用户
    if (existingCategory._count.configs > 0) {
      return NextResponse.json({ 
        error: `该分类下还有 ${existingCategory._count.configs} 个配置，请先迁移或删除这些配置` 
      }, { status: 400 });
    }

    // 删除分类
    await prisma.configCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除分类失败:", error);
    return NextResponse.json({ error: "删除分类失败" }, { status: 500 });
  }
}
