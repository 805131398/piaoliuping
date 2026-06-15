/**
 * 更新数据库中的邮件配置
 * 从环境变量读取 SMTP 配置并写入数据库
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateEmailConfig() {
  console.log('🔧 开始更新邮件配置...\n')

  // 从环境变量读取配置
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT || '587'
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.error('❌ 环境变量中缺少邮件配置')
    console.log('\n请在 .env 文件中设置以下配置：')
    console.log('SMTP_HOST=smtp.qq.com')
    console.log('SMTP_PORT=587')
    console.log('SMTP_USER=your-email@qq.com')
    console.log('SMTP_PASS=your-smtp-password')
    console.log('\n或者取消注释 .env 文件中的 SMTP 配置')
    process.exit(1)
  }

  console.log('📋 当前邮件配置：')
  console.log(`  SMTP_HOST: ${smtpHost}`)
  console.log(`  SMTP_PORT: ${smtpPort}`)
  console.log(`  SMTP_USER: ${smtpUser}`)
  console.log(`  SMTP_PASS: ${'*'.repeat(smtpPass.length)}`)

  try {
    // 更新数据库配置
    await prisma.config.update({
      where: { key: 'email.smtp_host' },
      data: { value: smtpHost },
    })

    await prisma.config.update({
      where: { key: 'email.smtp_port' },
      data: { value: smtpPort },
    })

    await prisma.config.update({
      where: { key: 'email.smtp_user' },
      data: { value: smtpUser },
    })

    await prisma.config.update({
      where: { key: 'email.smtp_pass' },
      data: { value: smtpPass },
    })

    console.log('\n✅ 邮件配置已成功更新到数据库！')
    console.log('\n💡 提示：')
    console.log('1. 现在可以通过后台管理界面修改邮件配置')
    console.log('2. 修改后无需重启应用即可生效')
    console.log('3. 如果需要测试邮件发送，可以访问 /api/system/config/test-email')
  } catch (error) {
    console.error('\n❌ 更新配置失败：', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

updateEmailConfig()
