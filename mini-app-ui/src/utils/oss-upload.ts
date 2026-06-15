import { http } from '@/http/http'

export interface OssPolicy {
  accessKeyId: string
  policy: string
  signature: string
  dir: string
  host: string
  expire: number
  bucket: string
  region: string
  domain: string
}

/**
 * 上传文件到 OSS
 * @param filePath 本地文件路径（临时路径）
 * @param dir OSS 目录前缀
 * @param maxSizeMB 最大文件大小（MB）
 * @returns { url, objectKey }
 */
export async function uploadToOss(
  filePath: string,
  dir = 'uploads/bubbles/',
  maxSizeMB = 10
): Promise<{ url: string; objectKey: string }> {
  // 1. 获取 OSS 签名策略
  const policy = await http.post<OssPolicy>('/oss/policy', { dir, maxSizeMB })
  
  // 2. 生成文件名
  const ext = filePath.split('.').pop() || 'png'
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const key = `${policy.dir}${filename}`
  
  // 3. 使用 uni.uploadFile 上传到 OSS
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: policy.host,
      filePath: filePath,
      name: 'file',
      formData: {
        key,
        OSSAccessKeyId: policy.accessKeyId,
        policy: policy.policy,
        Signature: policy.signature,
        success_action_status: '200',
        'Content-Disposition': 'inline',
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const fileUrl = `${policy.domain}/${key}`
          resolve({ url: fileUrl, objectKey: key })
        } else {
          reject(new Error(`OSS 上传失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        console.error('上传失败', err)
        reject(new Error('上传失败'))
      }
    })
  })
}

/**
 * 创建用户自定义泡泡（上传到服务器）
 * @param imageUrl OSS 图片 URL
 * @param name 泡泡名称
 * @param tags 泡泡标签
 * @returns 创建的泡泡对象
 */
export async function createUserBubble(imageUrl: string, name = '用户自定义', tags = '用户自定义') {
  return http.post<any>('/game/bubbles/upload', {
    name,
    type: 'IMAGE',
    content: imageUrl,
    description: '用户上传的自定义泡泡',
    tags,
    isActive: true
  })
}

/**
 * 上传图片并创建泡泡
 * @param filePath 本地文件路径
 * @param name 泡泡名称
 * @param tags 泡泡标签（多个标签用逗号分隔）
 * @returns 创建的泡泡对象
 */
export async function uploadAndCreateBubble(filePath: string, name = '用户自定义', tags = '用户自定义'): Promise<any> {
  // 1. 上传图片到 OSS
  const { url } = await uploadToOss(filePath, 'uploads/user-bubbles/')

  // 2. 创建泡泡记录
  const bubble = await createUserBubble(url, name, tags)

  return bubble
}
