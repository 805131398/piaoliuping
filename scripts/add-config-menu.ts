import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("同步配置管理菜单...");

  // 获取系统管理目录
  const systemMenu = await prisma.menu.findFirst({
    where: { label: "系统管理" },
  });

  if (!systemMenu) {
    console.log("❌ 未找到系统管理目录");
    return;
  }

  const removedDuplicateMenus = await prisma.menu.deleteMany({
    where: {
      id: "menu-configs",
    },
  });
  if (removedDuplicateMenus.count > 0) {
    console.log(`✓ 清理重复配置菜单 ${removedDuplicateMenus.count} 个`);
  }

  const configMenu = await prisma.menu.upsert({
    where: { id: "menu-config" },
    update: {
      label: "配置管理",
      type: "MENU",
      icon: "Settings2",
      href: "/admin/configs",
      parentId: systemMenu.id,
      order: 50,
      visible: true,
    },
    create: {
      id: "menu-config",
      label: "配置管理",
      type: "MENU",
      icon: "Settings2",
      href: "/admin/configs",
      parentId: systemMenu.id,
      order: 50,
      visible: true,
    },
  });

  console.log(`✓ 同步菜单: ${configMenu.label}`);

  // 为所有角色分配这个菜单
  const roles = await prisma.role.findMany();
  
  for (const role of roles) {
    if (role.name === "admin") {
      const existing = await prisma.roleMenu.findFirst({
        where: {
          roleId: role.id,
          menuId: configMenu.id,
        },
      });

      if (!existing) {
        await prisma.roleMenu.create({
          data: {
            roleId: role.id,
            menuId: configMenu.id,
          },
        });
        console.log(`  ✓ 分配给角色: ${role.name}`);
      }
    }
  }

  console.log("\n✅ 配置管理菜单同步完成！");
}

main()
  .catch((e) => {
    console.error("同步菜单失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
