import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const username = process.argv[2] || 'admin'
  const password = process.argv[3] || 'qwer1234'
  const name = process.argv[4] || '系统管理员'

  if (password.length < 6) {
    throw new Error('密码长度不能少于 6 位')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      name,
      password: hashedPassword,
      isActive: true,
      emailVerified: new Date(),
    },
    create: {
      username,
      name,
      password: hashedPassword,
      emailVerified: new Date(),
      avatarType: 'system',
      avatarStyle: 'lorelei',
      avatarSeed: `admin-${Date.now()}`,
      isActive: true,
    },
  })

  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: 'credentials',
        providerAccountId: username,
      },
    },
    update: {
      userId: user.id,
      type: 'credentials',
    },
    create: {
      userId: user.id,
      type: 'credentials',
      provider: 'credentials',
      providerAccountId: username,
    },
  })

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: { description: '系统管理员' },
    create: {
      name: 'admin',
      description: '系统管理员',
    },
  })

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: adminRole.id,
    },
  })

  const menuCount = await prisma.roleMenu.count({
    where: { roleId: adminRole.id },
  })

  console.log('✅ 管理员账号已就绪')
  console.log(`用户名: ${username}`)
  console.log(`密码: ${password}`)
  console.log(`用户ID: ${user.id}`)
  console.log(`admin 角色菜单数: ${menuCount}`)
}

main()
  .catch((error) => {
    console.error('❌ 创建管理员账号失败:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
