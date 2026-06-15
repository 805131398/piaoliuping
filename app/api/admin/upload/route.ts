import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { AliyunOssClient } from '@/lib/oss'
import crypto from 'crypto'
import path from 'path'

/**
 * POST /api/admin/upload
 * 上传文件到 OSS
 */
export async function POST(request: NextRequest) {
  try {
    // 验证登录
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null

    if (!file) {
      return NextResponse.json({ error: '请选择要上传的文件' }, { status: 400 })
    }

    // 验证文件类型
    if (type === 'cert') {
      if (!file.name.endsWith('.p12') && !file.name.endsWith('.pem')) {
        return NextResponse.json(
          { error: '证书文件必须是 .p12 或 .pem 格式' },
          { status: 400 }
        )
      }
    }

    // 读取文件内容
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 生成唯一文件名（保留原始扩展名）
    const ext = path.extname(file.name)
    const hash = crypto.randomBytes(8).toString('hex')
    const timestamp = Date.now()
    const fileName = `${type || 'file'}_${timestamp}_${hash}${ext}`
    
    // 根据类型确定 OSS 目录
    const ossDir = type === 'cert' ? 'certs' : 'uploads'
    const objectKey = `${ossDir}/${fileName}`

    // 上传到 OSS
    const ossClient = await AliyunOssClient.createFromDB()
    const result = await ossClient.upload(objectKey, buffer)

    return NextResponse.json({
      success: true,
      url: result.url,
      path: result.url,
      fileName,
    })
  } catch (error) {
    console.error('上传文件失败:', error)
    return NextResponse.json(
      { error: (error as Error).message || '上传文件失败' },
      { status: 500 }
    )
  }
}
