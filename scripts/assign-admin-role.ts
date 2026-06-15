import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("开始为用户分配超级管理员角色...");

  // 获取所有用户
  const users = await prisma.user.findMany();

  if (users.length === 0) {
    console.log("❌ 未找到任何用户，请先登录系统创建用户账户");
    return;
  }

  console.log(`找到 ${users.length} 个用户\n`);

  // 获取超级管理员角色
  const adminRole = await prisma.role.findUnique({
    where: { name: "admin" },
    include: {
      menus: {
        include: {
          menu: true,
        },
      },
    },
  });

  if (!adminRole) {
    console.log("❌ 未找到管理员角色(admin)");
    return;
  }

  // 为所有用户分配超级管理员角色
  for (const user of users) {
    // Only assign to the specific user we are debugging to avoid cluttering others if needed, 
    // but the script says "assign to all". Let's keep it assigning to all for dev convenience 
    // or just the one. The user didn't ask to change the script's behavior, just fix the role.
    // I will assign to all as per original script intent.
    const existingUserRole = await prisma.userRole.findFirst({
      where: {
        userId: user.id,
        roleId: adminRole.id,
      },
    });

    if (existingUserRole) {
      console.log(`⏭️  用户 ${user.email || user.name} 已经是超级管理员`);
    } else {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: adminRole.id,
        },
      });
      console.log(`✓ 已为用户 ${user.email || user.name} 分配超级管理员角色`);
    }
  }

  console.log(`\n✅ 完成！该角色包含 ${adminRole.menus.length} 个菜单项`);
}

main()
  .catch((e) => {
    console.error("分配角色失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
