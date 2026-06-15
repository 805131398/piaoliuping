import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/config-categories - 获取分类列表
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const categories = await prisma.configCategory.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { configs: true }
        }
      }
    });

    return NextResponse.json({
      categories,
      total: categories.length,
    });
  } catch (error) {
    console.error("获取分类列表失败:", error);
    return NextResponse.json({ error: "获取分类列表失败" }, { status: 500 });
  }
}

// POST /api/admin/config-categories - 创建分类
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { value, label, description, order } = await request.json();

    // 验证必填字段
    if (!value || !label) {
      return NextResponse.json({ error: "分类标识和名称不能为空" }, { status: 400 });
    }

    // 检查分类标识是否已存在
    const existingCategory = await prisma.configCategory.findUnique({
      where: { value },
    });

    if (existingCategory) {
      return NextResponse.json({ error: "分类标识已存在" }, { status: 400 });
    }

    // 创建分类
    const category = await prisma.configCategory.create({
      data: {
        value,
        label,
        description: description || null,
        order: order ?? 0,
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("创建分类失败:", error);
    return NextResponse.json({ error: "创建分类失败" }, { status: 500 });
  }
}
