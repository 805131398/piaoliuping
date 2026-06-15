/**
 * 修复数据库中的邮件主机配置
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixEmailHost() {
  console.log('🔧 修复邮件主机配置...\n')

  try {
    // 查看当前配置
    const currentConfig = await prisma.config.findUnique({
      where: { key: 'email.smtp_host' },
    })

    console.log('当前配置:')
    console.log(`  email.smtp_host = "${currentConfig?.value}"`)

    // 修复为正确的值
    await prisma.config.update({
      where: { key: 'email.smtp_host' },
      data: { value: 'smtp.qq.com' },
    })

    console.log('\n✅ 已修复为: smtp.qq.com')
    
    // 验证
    const updatedConfig = await prisma.config.findUnique({
      where: { key: 'email.smtp_host' },
    })
    
    console.log('\n验证修复后的配置:')
    console.log(`  email.smtp_host = "${updatedConfig?.value}"`)
    
    console.log('\n💡 现在可以重新测试邮件发送:')
    console.log('  npx tsx scripts/test-email.ts')
  } catch (error) {
    console.error('❌ 修复失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixEmailHost()
