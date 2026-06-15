import { NextResponse } from 'next/server'
import { ConfigManager, ConfigKeys } from '@/lib/config'

/**
 * 获取登录配置（公开 API，不需要认证）
 * 返回支持的登录方式列表
 */
export async function GET() {
  try {
    // 从数据库获取登录样式配置
    const loginStyle = await ConfigManager.get(ConfigKeys.LOGIN_STYLE, 'email,phone,credentials')

    // 解析支持的登录方式
    const styles = loginStyle.split(',').map(s => s.trim()).filter(Boolean)

    // 定义所有可用的登录方式
    const allLoginMethods = {
      phone: { key: 'phone_code', label: '手机号验证码登录' },
      email: { key: 'email', label: '邮箱验证码登录' },
      credentials: { key: 'credentials', label: '账号密码登录' },
      github: { key: 'github', label: 'GitHub 登录' },
      google: { key: 'google', label: 'Google 登录' },
    }

    // 根据配置过滤可用的登录方式
    const enabledMethods = styles
      .map(style => allLoginMethods[style as keyof typeof allLoginMethods])
      .filter(Boolean)

    return NextResponse.json({
      success: true,
      data: {
        styles,
        methods: enabledMethods,
      },
    })
  } catch (error) {
    console.error('获取登录配置失败:', error)
    // 发生错误时返回默认配置
    return NextResponse.json({
      success: true,
      data: {
        styles: ['email', 'phone'],
        methods: [
          { key: 'phone_code', label: '手机号验证码登录' },
          { key: 'email', label: '邮箱验证码登录' },
          { key: 'credentials', label: '账号密码登录' },
        ],
      },
    })
  }
}
