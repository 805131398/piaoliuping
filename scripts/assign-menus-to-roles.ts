import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("开始为角色分配菜单...");

  const adminRole = await prisma.role.findUnique({
    where: { name: "admin" },
  });

  if (!adminRole) {
    throw new Error("未找到 admin 角色，请先运行 init-roles.ts");
  }

  const allMenus = await prisma.menu.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  for (const menu of allMenus) {
    await prisma.roleMenu.upsert({
      where: {
        roleId_menuId: {
          roleId: adminRole.id,
          menuId: menu.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        menuId: menu.id,
      },
    });
    console.log(`✓ 已分配给 admin: ${menu.label}`);
  }

  console.log("✅ 菜单分配完成");
}

main()
  .catch((error) => {
    console.error("分配菜单失败:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
