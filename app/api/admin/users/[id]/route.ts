import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/users/[id] - 更新用户
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
    const { name, email, phone, isActive } = body;

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 检查邮箱是否被其他用户使用
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });
      if (emailExists) {
        return NextResponse.json({ error: "该邮箱已被使用" }, { status: 400 });
      }
    }

    // 检查手机号是否被其他用户使用
    if (phone && phone !== existingUser.phone) {
      const phoneExists = await prisma.user.findUnique({
        where: { phone },
      });
      if (phoneExists) {
        return NextResponse.json({ error: "该手机号已被使用" }, { status: 400 });
      }
    }

    // 更新用户
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    return NextResponse.json({
      user: {
        ...user,
        avatar: user.image,
        provider: user.accounts[0]?.provider || "email",
      },
    });
  } catch (error) {
    console.error("更新用户失败:", error);
    return NextResponse.json({ error: "更新用户失败" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - 删除用户
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

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 不允许删除自己
    if (id === session.user.id) {
      return NextResponse.json({ error: "不能删除自己的账户" }, { status: 400 });
    }

    // 删除用户（级联删除关联的 accounts 和 sessions）
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除用户失败:", error);
    return NextResponse.json({ error: "删除用户失败" }, { status: 500 });
  }
}
