import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MenuItem } from "@/types/admin";

// 缓存 1 小时，1 小时后自动重新验证
export const revalidate = 3600;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 检查是否登录，如果没有登录则重定向到登录页
  if (!session) {
    redirect("/login");
  }

  // 检查用户是否有管理员权限
  const userRoles = session.user.roles || [];
  const isAdmin = userRoles.includes("admin") || userRoles.includes("管理员");
  
  if (!isAdmin) {
    redirect("/unauthorized");
  }

  // 在服务端获取菜单数据
  const allMenus = await prisma.menu.findMany({
    orderBy: [
      { order: "asc" },
      { createdAt: "asc" },
    ],
  });

  // 构建树形结构
  const buildMenuTree = (menus: any[]): MenuItem[] => {
    const menuMap = new Map();
    const rootMenus: MenuItem[] = [];

    // 先创建所有菜单节点
    menus.forEach((menu) => {
      menuMap.set(menu.id, {
        id: menu.id,
        label: menu.label,
        type: menu.type,
        icon: menu.icon,
        href: menu.href,
        parentId: menu.parentId,
        order: menu.order,
        visible: menu.visible,
        children: [],
      });
    });

    // 构建树形关系
    menus.forEach((menu) => {
      const menuNode = menuMap.get(menu.id);
      if (menu.parentId) {
        const parent = menuMap.get(menu.parentId);
        if (parent) {
          parent.children.push(menuNode);
        }
      } else {
        rootMenus.push(menuNode);
      }
    });

    return rootMenus;
  };

  // 过滤只显示可见的菜单
  const filterVisible = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter((item) => item.visible !== false)
      .map((item) => ({
        ...item,
        children: item.children ? filterVisible(item.children) : undefined,
      }));
  };

  const menuTree = buildMenuTree(allMenus);
  const visibleMenus = filterVisible(menuTree);

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar menuItems={visibleMenus} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
