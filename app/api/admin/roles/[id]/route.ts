import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/roles/[id] - 更新角色
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
    const { name, description, menuIds } = await request.json();

    // 检查角色是否存在
    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return NextResponse.json({ error: "角色不存在" }, { status: 404 });
    }

    // 如果修改了名称，检查新名称是否已被其他角色使用
    if (name && name !== existingRole.name) {
      const duplicateRole = await prisma.role.findUnique({
        where: { name },
      });

      if (duplicateRole) {
        return NextResponse.json({ error: "角色名称已存在" }, { status: 400 });
      }
    }

    // 更新角色
    const role = await prisma.role.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(menuIds !== undefined && {
          menus: {
            deleteMany: {},
            create: menuIds.map((menuId: string) => ({
              menu: {
                connect: { id: menuId },
              },
            })),
          },
        }),
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
    console.error("更新角色失败:", error);
    return NextResponse.json({ error: "更新角色失败" }, { status: 500 });
  }
}

// DELETE /api/admin/roles/[id] - 删除角色
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

    // 检查角色是否存在
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      return NextResponse.json({ error: "角色不存在" }, { status: 404 });
    }

    // 检查是否有用户使用此角色
    if (role._count.users > 0) {
      return NextResponse.json(
        { error: `该角色正被 ${role._count.users} 个用户使用，无法删除` },
        { status: 400 }
      );
    }

    // 删除角色
    await prisma.role.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除角色失败:", error);
    return NextResponse.json({ error: "删除角色失败" }, { status: 500 });
  }
}
