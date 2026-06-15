import { NextRequest, NextResponse } from 'next/server'
import { AliyunOssClient } from '@/lib/oss'
import { getToken } from 'next-auth/jwt'

export async function POST(req: NextRequest) {
  try {
    const { dir = '', maxSizeMB = 10 } = await req.json()

    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
      salt: "authjs.session-token",
    })
    let targetDir = dir

    // 如果是普通用户，强制隔离目录
    // 这里假�� Role 'ADMIN' 是管理员，其他都是普通用户
    // 如果没有 token (未登录)，可能需要拒绝，或者允许上传到临时目录(temp/)
    if (token?.id) {
      // 简单的权限判断，根据实际情况调整
      // const isAdmin = token.role === 'ADMIN'

      // 普通用户强制隔离到自己的目录
      // 移除开头的 / (如果有)
      const cleanDir = dir.replace(/^\/+/, '')
      // 强制前缀: users/{userId}/
      targetDir = `users/${token.id}/${cleanDir}`
    } else {
      // 未登录用户，仅允许上传到 temporary/ 目录，或者直接拒绝
      // targetDir = `temporary/${dir}`
      // 暂时保持原样以便兼容开发环境，或者你可以决定拒绝
    }

    // 从数据库获取配置并生成签名
    const result = await AliyunOssClient.generatePolicySignatureFromDB({
      dir: targetDir,
      maxSizeMB,
    })

    console.log("生成 OSS 签名成功, dir:", targetDir);
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("生成 OSS 签名失败:", error);
    return NextResponse.json({
      error: error.message || '生成 OSS 签名失败'
    }, { status: 500 })
  }
} 