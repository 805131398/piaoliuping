import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const permissions = [
  { name: "创建用户", resource: "user", action: "create" },
  { name: "查看用户", resource: "user", action: "read" },
  { name: "更新用户", resource: "user", action: "update" },
  { name: "删除用户", resource: "user", action: "delete" },
  { name: "创建角色", resource: "role", action: "create" },
  { name: "查看角色", resource: "role", action: "read" },
  { name: "更新角色", resource: "role", action: "update" },
  { name: "删除角色", resource: "role", action: "delete" },
  { name: "创建菜单", resource: "menu", action: "create" },
  { name: "查看菜单", resource: "menu", action: "read" },
  { name: "更新菜单", resource: "menu", action: "update" },
  { name: "删除菜单", resource: "menu", action: "delete" },
  { name: "创建配置", resource: "config", action: "create" },
  { name: "查看配置", resource: "config", action: "read" },
  { name: "更新配置", resource: "config", action: "update" },
  { name: "删除配置", resource: "config", action: "delete" },
  { name: "上传文件", resource: "file", action: "create" },
  { name: "查看文件", resource: "file", action: "read" },
  { name: "更新文件", resource: "file", action: "update" },
  { name: "删除文件", resource: "file", action: "delete" },
];

async function main() {
  console.log("开始初始化角色和权限...");

  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: { description: "系统管理员" },
    create: { name: "admin", description: "系统管理员" },
  });

  await prisma.role.upsert({
    where: { name: "user" },
    update: { description: "普通用户" },
    create: { name: "user", description: "普通用户" },
  });

  await prisma.role.upsert({
    where: { name: "guest" },
    update: { description: "访客" },
    create: { name: "guest", description: "访客" },
  });

  for (const permission of permissions) {
    const created = await prisma.permission.upsert({
      where: {
        resource_action: {
          resource: permission.resource,
          action: permission.action,
        },
      },
      update: { name: permission.name },
      create: permission,
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: created.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: created.id,
      },
    });
  }

  console.log("✅ 角色和权限初始化完成");
}

main()
  .catch((error) => {
    console.error("初始化失败:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
