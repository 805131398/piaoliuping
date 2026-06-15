import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

/**
 * 获取配置分类列表
 * GET /api/system/config/categories
 */
export async function GET(request: NextRequest) {
  try {
    // 验证登录
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ code: 401, msg: '未登录或登录已过期' }, { status: 401 })
    }

    const categories = await prisma.configCategory.findMany({
      include: {
        _count: {
          select: { configs: true },
        },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({
      code: 200,
      msg: '获取成功',
      data: categories,
    })
  } catch (error) {
    console.error('获取配置分类失败:', error)
    return NextResponse.json({ code: 500, msg: '服务器错误' }, { status: 500 })
  }
}
