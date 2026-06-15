import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sendTestEmail } from '@/lib/email'

/**
 * 测试邮件发送
 * POST /api/system/config/test-email
 */
export async function POST(request: NextRequest) {
  try {
    // 验证登录
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ code: 401, msg: '未登录或登录已过期' }, { status: 401 })
    }

    const body = await request.json()
    const { to } = body

    if (!to) {
      return NextResponse.json({ code: 400, msg: '请提供收件人邮箱' }, { status: 400 })
    }

    // 发送测试邮件
    const result = await sendTestEmail(to)

    return NextResponse.json({
      code: 200,
      msg: '测试邮件发送成功',
      data: result,
    })
  } catch (error: any) {
    console.error('测试邮件发送失败:', error)
    return NextResponse.json(
      { 
        code: 500, 
        msg: error.message || '测试邮件发送失败',
        error: error.toString()
      }, 
      { status: 500 }
    )
  }
}
