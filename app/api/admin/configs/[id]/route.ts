import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/configs/[id] - 获取单个配置（包含完整值）
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

    const config = await prisma.config.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!config) {
      return NextResponse.json({ error: "配置不存在" }, { status: 404 });
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error("获取配置失败:", error);
    return NextResponse.json({ error: "获取配置失败" }, { status: 500 });
  }
}

// PATCH /api/admin/configs/[id] - 更新配置
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
    const { key, value, description, category, isSecret } = await request.json();

    // 检查配置是否存在
    const existingConfig = await prisma.config.findUnique({
      where: { id },
    });

    if (!existingConfig) {
      return NextResponse.json({ error: "配置不存在" }, { status: 404 });
    }

    // 如果修改了键，检查新键是否已被其他配置使用
    if (key && key !== existingConfig.key) {
      const duplicateConfig = await prisma.config.findUnique({
        where: { key },
      });

      if (duplicateConfig) {
        return NextResponse.json({ error: "配置键已存在" }, { status: 400 });
      }
    }

    // 更新配置
    const config = await prisma.config.update({
      where: { id },
      data: {
        ...(key !== undefined && { key }),
        ...(value !== undefined && { value: value || null }),
        ...(description !== undefined && { description: description || null }),
        ...(category !== undefined && { categoryId: category || null }),
        ...(isSecret !== undefined && { isSecret }),
      },
      include: { category: true },
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error("更新配置失败:", error);
    return NextResponse.json({ error: "更新配置失败" }, { status: 500 });
  }
}

// DELETE /api/admin/configs/[id] - 删除配置
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

    // 检查配置是否存在
    const config = await prisma.config.findUnique({
      where: { id },
    });

    if (!config) {
      return NextResponse.json({ error: "配置不存在" }, { status: 404 });
    }

    // 删除配置
    await prisma.config.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除配置失败:", error);
    return NextResponse.json({ error: "删除配置失败" }, { status: 500 });
  }
}
