/**
 * 数据库连接诊断工具
 * 用于检查数据库连接配置是否正确
 */

import { PrismaClient } from '@prisma/client'

async function checkDatabaseConnection() {
  console.log('🔍 开始检查数据库连接...\n')

  // 1. 检查环境变量
  console.log('📋 环境变量检查:')
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL 环境变量未设置')
    process.exit(1)
  }

  console.log(`✓ DATABASE_URL: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`)

  // 解析数据库 URL
  try {
    const url = new URL(databaseUrl.replace('postgresql://', 'http://'))
    console.log(`  - 协议: postgresql`)
    console.log(`  - 主机: ${url.hostname}`)
    console.log(`  - 端口: ${url.port || '5432'}`)
    console.log(`  - 数据库: ${url.pathname.substring(1)}`)
    console.log(`  - 用户名: ${url.username}`)
  } catch (error) {
    console.error('❌ DATABASE_URL 格式错误:', error)
    process.exit(1)
  }

  // 2. 测试数据库连接
  console.log('\n🔌 测试数据库连接:')
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  })

  try {
    await prisma.$connect()
    console.log('✓ 数据库连接成功')

    // 3. 测试查询
    console.log('\n📊 测试数据库查询:')
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('✓ 查询成功:', result)

    // 4. 检查表是否存在
    console.log('\n📦 检查数据库表:')
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `
    console.log(`✓ 找到 ${tables.length} 个表:`)
    tables.forEach((table) => {
      console.log(`  - ${table.tablename}`)
    })

    console.log('\n✅ 数据库连接检查完成！')
  } catch (error) {
    console.error('\n❌ 数据库连接失败:')
    console.error(error)
    console.log('\n💡 可能的解决方案:')
    console.log('1. 检查数据库服务是否正在运行')
    console.log('2. 检查主机名是否正确（如果是 Docker 容器，确保容器名称正确）')
    console.log('3. 检查端口是否正确')
    console.log('4. 检查用户名和密码是否正确')
    console.log('5. 检查防火墙设置')
    console.log('6. 如果使用 Docker，尝试使用 localhost 或 127.0.0.1 替代容器名')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseConnection()
