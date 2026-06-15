import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

/**
 * 获取配置列表
 * GET /api/system/config
 */
export async function GET(request: NextRequest) {
  try {
    // 验证登录
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ code: 401, msg: '未登录或登录已过期' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categoryValue = searchParams.get('category')

    let configs

    if (categoryValue) {
      // 获取指定分类的配置
      const category = await prisma.configCategory.findUnique({
        where: { value: categoryValue },
        include: {
          configs: {
            orderBy: { key: 'asc' },
          },
        },
      })

      configs = category?.configs || []
    } else {
      // 获取所有配置
      configs = await prisma.config.findMany({
        include: {
          category: true,
        },
        orderBy: [{ categoryId: 'asc' }, { key: 'asc' }],
      })
    }

    // 隐藏敏感信息的值
    const safeConfigs = configs.map((config) => ({
      ...config,
      value: config.isSecret ? '******' : config.value,
    }))

    return NextResponse.json({
      code: 200,
      msg: '获取成功',
      data: safeConfigs,
    })
  } catch (error) {
    console.error('获取配置失败:', error)
    return NextResponse.json({ code: 500, msg: '服务器错误' }, { status: 500 })
  }
}

/**
 * 更新配置
 * PUT /api/system/config
 */
export async function PUT(request: NextRequest) {
  try {
    // 验证登录
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ code: 401, msg: '未登录或登录已过期' }, { status: 401 })
    }

    const body = await request.json()
    const { key, value } = body

    if (!key) {
      return NextResponse.json({ code: 400, msg: '配置键不能为空' }, { status: 400 })
    }

    // 更新配置
    const config = await prisma.config.update({
      where: { key },
      data: { value },
    })

    return NextResponse.json({
      code: 200,
      msg: '更新成功',
      data: {
        ...config,
        value: config.isSecret ? '******' : config.value,
      },
    })
  } catch (error) {
    console.error('更新配置失败:', error)
    return NextResponse.json({ code: 500, msg: '服务器错误' }, { status: 500 })
  }
}

/**
 * 批量更新配置
 * PATCH /api/system/config
 */
export async function PATCH(request: NextRequest) {
  try {
    // 验证登录
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ code: 401, msg: '未登录或登录已过期' }, { status: 401 })
    }

    const body = await request.json()
    const { configs } = body

    if (!Array.isArray(configs)) {
      return NextResponse.json({ code: 400, msg: '参数格式错误' }, { status: 400 })
    }

    // 批量更新
    await Promise.all(
      configs.map((item: { key: string; value: string }) =>
        prisma.config.update({
          where: { key: item.key },
          data: { value: item.value },
        })
      )
    )

    return NextResponse.json({
      code: 200,
      msg: '批量更新成功',
    })
  } catch (error) {
    console.error('批量更新配置失败:', error)
    return NextResponse.json({ code: 500, msg: '服务器错误' }, { status: 500 })
  }
}
