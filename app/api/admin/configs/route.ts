import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/configs - 获取配置列表
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const configs = await prisma.config.findMany({
      where: category ? { categoryId: category } : undefined,
      orderBy: { key: "asc" },
      include: {
        category: true,
      },
    });

    // 按分类排序（先按分类order，再按key）
    const sortedConfigs = configs.sort((a, b) => {
      const orderA = a.category?.order ?? 999;
      const orderB = b.category?.order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.key.localeCompare(b.key);
    });

    // 对于敏感信息，只返回部分内容（脱敏）
    const maskedConfigs = sortedConfigs.map(config => ({
      ...config,
      value: config.isSecret && config.value 
        ? `${config.value.substring(0, 4)}****` 
        : config.value,
    }));

    return NextResponse.json({
      configs: maskedConfigs,
      total: configs.length,
    });
  } catch (error) {
    console.error("获取配置列表失败:", error);
    return NextResponse.json({ error: "获取配置列表失败" }, { status: 500 });
  }
}

// POST /api/admin/configs - 创建配置
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { key, value, description, category, isSecret } = await request.json();

    // 验证必填字段
    if (!key) {
      return NextResponse.json({ error: "配置键不能为空" }, { status: 400 });
    }

    // 检查配置键是否已存在
    const existingConfig = await prisma.config.findUnique({
      where: { key },
    });

    if (existingConfig) {
      return NextResponse.json({ error: "配置键已存在" }, { status: 400 });
    }

    // 创建配置
    const config = await prisma.config.create({
      data: {
        key,
        value: value || null,
        description: description || null,
        categoryId: category || null,
        isSecret: isSecret || false,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error("创建配置失败:", error);
    return NextResponse.json({ error: "创建配置失败" }, { status: 500 });
  }
}
