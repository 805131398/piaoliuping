import { prisma } from "@/lib/prisma";
import { RoleManagementClient } from "@/components/admin/RoleManagementClient";

// 服务端组件 - 直接查询数据库
export default async function RolesPage() {
  // 获取所有角色（包含关联数据）
  const roles = await prisma.role.findMany({
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
    orderBy: {
      createdAt: "desc",
    },
  });

  // 获取所有菜单
  const allMenus = await prisma.menu.findMany({
    orderBy: [
      { order: "asc" },
      { createdAt: "asc" },
    ],
  });

  // 将数据传递给客户端组件
  return (
    <RoleManagementClient
      initialRoles={roles}
      menus={allMenus}
    />
  );
}
