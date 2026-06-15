import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { AliyunOssClient } from '@/lib/oss'

/**
 * GET /api/admin/files
 * 获取 OSS 文件列表
 */
export async function GET(request: NextRequest) {
  try {
    // 验证登录
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams
    const prefix = searchParams.get('prefix') || ''
    const marker = searchParams.get('marker') || undefined
    const maxKeys = parseInt(searchParams.get('maxKeys') || '100', 10)
    const recursive = searchParams.get('recursive') === 'true'

    // 创建 OSS 客户端
    const ossClient = await AliyunOssClient.createFromDB()

    // 获取文件列表
    if (recursive) {
      // 递归获取所有文件
      const files = await ossClient.listAllFiles(prefix, maxKeys)
      return NextResponse.json({
        files,
        folders: [],
        isTruncated: false,
      })
    } else {
      // 按文件夹层级获取
      const result = await ossClient.listFiles(prefix, { maxKeys, marker })
      return NextResponse.json(result)
    }
  } catch (error) {
    console.error('获取文件列表失败:', error)
    return NextResponse.json(
      { error: (error as Error).message || '获取文件列表失败' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/files
 * 删除 OSS 文件
 */
export async function DELETE(request: NextRequest) {
  try {
    // 验证登录
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { objectKey, objectKeys } = body as { objectKey?: string; objectKeys?: string[] }

    if (!objectKey && (!objectKeys || objectKeys.length === 0)) {
      return NextResponse.json({ error: '请提供要删除的文件' }, { status: 400 })
    }

    // 创建 OSS 客户端
    const ossClient = await AliyunOssClient.createFromDB()

    // 删除文件
    if (objectKeys && objectKeys.length > 0) {
      await ossClient.deleteFiles(objectKeys)
    } else if (objectKey) {
      await ossClient.deleteFile(objectKey)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除文件失败:', error)
    return NextResponse.json(
      { error: (error as Error).message || '删除文件失败' },
      { status: 500 }
    )
  }
}
