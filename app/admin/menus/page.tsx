import { prisma } from "@/lib/prisma";
import { MenuItem } from "@/types/admin";
import { MenuManagementClient } from "@/components/admin/MenuManagementClient";

// 构建树形结构
function buildMenuTree(menus: any[]): MenuItem[] {
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
}

// 服务端组件 - 直接查询数据库
export default async function MenusPage() {
  // 在服务端直接查询数据库，避免重复查询
  const allMenus = await prisma.menu.findMany({
    orderBy: [
      { order: "asc" },
      { createdAt: "asc" },
    ],
  });

  const menuTree = buildMenuTree(allMenus);

  // 将数据传递给客户端组件
  return <MenuManagementClient initialMenus={menuTree} />;
}
