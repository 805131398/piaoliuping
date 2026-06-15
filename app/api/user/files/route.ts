import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { AliyunOssClient } from '@/lib/oss'

/**
 * DELETE /api/user/files
 * 删除用户自己的文件
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { objectKey } = body as { objectKey?: string }

    if (!objectKey) {
      return NextResponse.json({ error: 'Missing objectKey' }, { status: 400 })
    }

    // 权限检查：必须以 users/{userId}/ 开头
    const userPrefix = `users/${session.user.id}/`
    
    // 检查前缀
    if (!objectKey.startsWith(userPrefix)) {
       // 即使是管理员，也建议使用 Admin 接口来管理非自己的文件
       return NextResponse.json({ error: '无权删除该文件' }, { status: 403 })
    }

    const ossClient = await AliyunOssClient.createFromDB()
    await ossClient.deleteFile(objectKey)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('删除文件失败:', error)
    return NextResponse.json({ error: error.message || '删除失败' }, { status: 500 })
  }
}
