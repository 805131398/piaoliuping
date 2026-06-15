/**
 * 给用户添加管理员角色的脚本
 * 
 * 使用方法：
 * npx tsx scripts/add-admin-role.ts <邮箱>
 * 
 * 示例：
 * npx tsx scripts/add-admin-role.ts admin@example.com
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addAdminRole(email: string) {
  console.log(`\n🔍 查找用户: ${email}`);
  
  // 1. 查找用户
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    console.error(`❌ 用户不存在: ${email}`);
    process.exit(1);
  }

  console.log(`✅ 找到用户: ${user.name || user.email} (${user.id})`);

  // 2. 查找或创建 admin 角色
  let adminRole = await prisma.role.findUnique({
    where: { name: 'admin' },
  });

  if (!adminRole) {
    console.log('📝 创建 admin 角色...');
    adminRole = await prisma.role.create({
      data: {
        name: 'admin',
        description: '系统管理员，拥有全部权限',
      },
    });
    console.log(`✅ admin 角色已创建: ${adminRole.id}`);
  } else {
    console.log(`✅ admin 角色已存在: ${adminRole.id}`);
  }

  // 3. 检查用户是否已有该角色
  const existingUserRole = await prisma.userRole.findUnique({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: adminRole.id,
      },
    },
  });

  if (existingUserRole) {
    console.log(`⚠️ 用户已拥有 admin 角色，无需重复添加`);
  } else {
    // 4. 给用户分配 admin 角色
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: adminRole.id,
      },
    });
    console.log(`✅ 已成功给用户 ${user.email} 添加 admin 角色`);
  }

  // 5. 显示用户当前所有角色
  const userRoles = await prisma.userRole.findMany({
    where: { userId: user.id },
    include: { role: true },
  });

  console.log(`\n📋 用户当前角色列表:`);
  userRoles.forEach((ur) => {
    console.log(`   - ${ur.role.name}: ${ur.role.description || '无描述'}`);
  });

  console.log(`\n🎉 完成！用户 ${user.email} 现在可以访问管理后台了。`);
}

// 主程序
async function main() {
  const email = process.argv[2];

  if (!email) {
    console.log('使用方法: npx tsx scripts/add-admin-role.ts <邮箱>');
    console.log('示例: npx tsx scripts/add-admin-role.ts admin@example.com');
    process.exit(1);
  }

  try {
    await addAdminRole(email);
  } catch (error) {
    console.error('❌ 发生错误:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
