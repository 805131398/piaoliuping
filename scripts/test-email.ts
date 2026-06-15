/**
 * 测试邮件发送
 * 用于诊断 SMTP 配置问题
 */

import nodemailer from 'nodemailer'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testEmail() {
  console.log('📧 开始测试邮件发送...\n')

  try {
    // 1. 从数据库读取配置
    console.log('1️⃣ 从数据库读取邮件配置...')
    const configs = await prisma.config.findMany({
      where: {
        category: { value: 'email' },
      },
    })

    console.log(`找到 ${configs.length} 个邮件配置项:`)
    configs.forEach((config) => {
      const displayValue = config.isSecret ? '***' : config.value
      console.log(`  - ${config.key}: ${displayValue || '(空)'}`)
    })

    const configMap: Record<string, string> = {}
    configs.forEach((config) => {
      if (config.value) {
        configMap[config.key] = config.value
      }
    })

    // 2. 获取配置值
    const host = configMap['email.smtp_host'] || process.env.SMTP_HOST
    const port = parseInt(configMap['email.smtp_port'] || process.env.SMTP_PORT || '587')
    const user = configMap['email.smtp_user'] || process.env.SMTP_USER
    const password = configMap['email.smtp_pass'] || process.env.SMTP_PASS

    console.log('\n2️⃣ 实际使用的配置:')
    console.log(`  Host: ${host}`)
    console.log(`  Port: ${port}`)
    console.log(`  User: ${user}`)
    console.log(`  Pass: ${password ? '***' : '(空)'}`)
    console.log(`  来源: ${configMap['email.smtp_host'] ? '数据库' : '环境变量'}`)

    if (!host || !user || !password) {
      console.error('\n❌ 配置不完整，无法测试')
      process.exit(1)
    }

    // 3. 测试不同的端口和配置
    const testConfigs = [
      {
        name: 'QQ邮箱 - 端口 587 (STARTTLS)',
        config: {
          host,
          port: 587,
          secure: false,
          auth: { user, pass: password },
          tls: { rejectUnauthorized: false },
        },
      },
      {
        name: 'QQ邮箱 - 端口 465 (SSL)',
        config: {
          host,
          port: 465,
          secure: true,
          auth: { user, pass: password },
          tls: { rejectUnauthorized: false },
        },
      },
    ]

    for (const test of testConfigs) {
      console.log(`\n3️⃣ 测试: ${test.name}`)
      try {
        const transporter = nodemailer.createTransport(test.config)

        // 验证连接
        console.log('  验证 SMTP 连接...')
        await transporter.verify()
        console.log('  ✅ SMTP 连接成功！')

        // 发送测试邮件
        console.log('  发送测试邮件...')
        const info = await transporter.sendMail({
          from: `"系统测试" <${user}>`,
          to: user, // 发送给自己
          subject: '邮件配置测试',
          text: '这是一封测试邮件',
          html: '<p>这是一封测试邮件。如果您收到此邮件，说明邮件配置正常。</p>',
        })

        console.log('  ✅ 邮件发送成功！')
        console.log(`  Message ID: ${info.messageId}`)
        console.log(`\n🎉 ${test.name} 配置可用！`)
        
        // 找到可用配置后退出
        console.log('\n💡 建议使用此配置:')
        console.log(`  SMTP_HOST=${host}`)
        console.log(`  SMTP_PORT=${test.config.port}`)
        console.log(`  SMTP_USER=${user}`)
        console.log(`  SMTP_PASS=你的授权码`)
        
        process.exit(0)
      } catch (error: any) {
        console.log(`  ❌ 失败: ${error.message}`)
      }
    }

    console.log('\n❌ 所有配置都失败了')
    console.log('\n💡 可能的原因:')
    console.log('1. SMTP 授权码不正确（不是邮箱密码，是授权码）')
    console.log('2. QQ 邮箱未开启 SMTP 服务')
    console.log('3. 网络问题或防火墙阻止')
    console.log('4. 邮箱账号被限制')
    
    console.log('\n📖 如何获取 QQ 邮箱授权码:')
    console.log('1. 登录 QQ 邮箱 (mail.qq.com)')
    console.log('2. 设置 → 账户 → POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务')
    console.log('3. 开启 SMTP 服务')
    console.log('4. 点击"生成授权码"')
    console.log('5. 使用生成的授权码（16位）作为 SMTP_PASS')

  } catch (error) {
    console.error('\n❌ 测试失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testEmail()
