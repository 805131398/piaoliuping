import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/permissions - 获取权限列表
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const permissions = await prisma.permission.findMany({
      orderBy: [
        { resource: "asc" },
        { action: "asc" },
      ],
    });

    // 按资源分组
    const groupedPermissions = permissions.reduce((acc: any, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    }, {});

    return NextResponse.json({
      permissions,
      grouped: groupedPermissions,
      total: permissions.length,
    });
  } catch (error) {
    console.error("获取权限列表失败:", error);
    return NextResponse.json({ error: "获取权限列表失败" }, { status: 500 });
  }
}
