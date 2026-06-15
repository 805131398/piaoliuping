import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const menus = [
  {
    id: "menu-dashboard",
    label: "仪表盘",
    type: "MENU" as const,
    icon: "LayoutDashboard",
    href: "/admin",
    parentId: null,
    order: 10,
    visible: true,
  },
  {
    id: "menu-system",
    label: "系统管理",
    type: "DIRECTORY" as const,
    icon: "Settings",
    href: null,
    parentId: null,
    order: 20,
    visible: true,
  },
  {
    id: "menu-user",
    label: "用户管理",
    type: "MENU" as const,
    icon: "Users",
    href: "/admin/users",
    parentId: "menu-system",
    order: 10,
    visible: true,
  },
  {
    id: "menu-role",
    label: "角色管理",
    type: "MENU" as const,
    icon: "Shield",
    href: "/admin/roles",
    parentId: "menu-system",
    order: 20,
    visible: true,
  },
  {
    id: "menu-menu",
    label: "菜单管理",
    type: "MENU" as const,
    icon: "Menu",
    href: "/admin/menus",
    parentId: "menu-system",
    order: 30,
    visible: true,
  },
  {
    id: "menu-file",
    label: "文件管理",
    type: "MENU" as const,
    icon: "FileText",
    href: "/admin/files",
    parentId: "menu-system",
    order: 40,
    visible: true,
  },
  {
    id: "menu-config",
    label: "配置管理",
    type: "MENU" as const,
    icon: "Settings2",
    href: "/admin/configs",
    parentId: "menu-system",
    order: 50,
    visible: true,
  },
  {
    id: "menu-config-categories",
    label: "配置分类",
    type: "MENU" as const,
    icon: "FolderTree",
    href: "/admin/config-categories",
    parentId: "menu-system",
    order: 70,
    visible: true,
  },
];

const legacyMenuPrefixes = [
  "/admin/clocking",
  "/admin/game",
];

const legacyMenuKeywords = [
  "打卡",
  "题库",
  "答题",
  "排行",
  "奖金",
  "优惠券",
  "订单",
  "会员",
  "VIP",
  "游戏",
  "主题",
  "音效",
  "轮播",
  "广告",
];

const obsoleteMenuIds = ["menu-configs"];

function isLegacyBusinessMenu(menu: { href: string | null; label: string }) {
  return (
    legacyMenuPrefixes.some(prefix => menu.href?.startsWith(prefix) === true)
    || legacyMenuKeywords.some(keyword => menu.label.includes(keyword))
  );
}

async function main() {
  console.log("开始初始化菜单数据...");

  const legacyMenus = await prisma.menu.findMany();
  const legacyIds = legacyMenus.filter(isLegacyBusinessMenu).map(menu => menu.id);
  if (legacyIds.length > 0) {
    await prisma.menu.deleteMany({
      where: {
        id: { in: legacyIds },
      },
    });
    console.log(`✓ 清理旧业务菜单 ${legacyIds.length} 个`);
  }

  const removedObsoleteMenus = await prisma.menu.deleteMany({
    where: {
      id: { in: obsoleteMenuIds },
    },
  });
  if (removedObsoleteMenus.count > 0) {
    console.log(`✓ 清理重复配置菜单 ${removedObsoleteMenus.count} 个`);
  }

  for (const menu of menus) {
    await prisma.menu.upsert({
      where: { id: menu.id },
      update: {
        label: menu.label,
        type: menu.type,
        icon: menu.icon,
        href: menu.href,
        parentId: menu.parentId,
        order: menu.order,
        visible: menu.visible,
      },
      create: menu,
    });
    console.log(`✓ 初始化菜单: ${menu.label}`);
  }

  console.log("✅ 菜单初始化完成");
}

main()
  .catch((error) => {
    console.error("菜单初始化失败:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
