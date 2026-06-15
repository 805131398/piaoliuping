import { NextRequest, NextResponse } from 'next/server'
import { AliyunOssClient } from '@/lib/oss'

export async function POST(req: NextRequest) {
  try {
    const { objectKey, expires = 60 } = await req.json()
    
    if (!objectKey) {
      return NextResponse.json({ error: '缺少 objectKey' }, { status: 400 })
    }
    
    // 从数据库创建 OSS 客户端
    const oss = await AliyunOssClient.createFromDB()
    
    // 生成签名 URL
    // expires 单位为秒
    const url = oss['client'].signatureUrl(objectKey, { expires })
    
    return NextResponse.json({ url })
  } catch (error: any) {
    console.error("生成签名 URL 失败:", error);
    return NextResponse.json({ 
      error: error.message || '生成签名 URL 失败' 
    }, { status: 500 })
  }
} 