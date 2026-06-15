import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/admin/roles/[id]/users/manage - 添加用户到角色
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id: roleId } = params;
    const { userIds } = await request.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "请选择要添加的用户" }, { status: 400 });
    }

    // 检查角色是否存在
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return NextResponse.json({ error: "角色不存在" }, { status: 404 });
    }

    // 批量创建用户角色关联
    const userRoles = await prisma.userRole.createMany({
      data: userIds.map((userId: string) => ({
        userId,
        roleId,
      })),
      skipDuplicates: true, // 跳过已存在的关联
    });

    return NextResponse.json({
      success: true,
      count: userRoles.count,
      message: `成功添加 ${userRoles.count} 个用户到角色`,
    });
  } catch (error) {
    console.error("添加用户到角色失败:", error);
    return NextResponse.json({ error: "添加用户到角色失败" }, { status: 500 });
  }
}

// DELETE /api/admin/roles/[id]/users/manage - 从角色移除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id: roleId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "缺少用户ID" }, { status: 400 });
    }

    // 检查角色是否存在
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return NextResponse.json({ error: "角色不存在" }, { status: 404 });
    }

    // 删除用户角色关联
    await prisma.userRole.deleteMany({
      where: {
        userId,
        roleId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "成功从角色移除用户",
    });
  } catch (error) {
    console.error("从角色移除用户失败:", error);
    return NextResponse.json({ error: "从角色移除用户失败" }, { status: 500 });
  }
}
