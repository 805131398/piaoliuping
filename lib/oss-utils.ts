export interface OssPolicy {
  accessKeyId: string
  policy: string
  signature: string
  dir: string
  host: string
  expire: number
  bucket: string
  region: string
  domain: string  // 自定义域名，用于生成文件访问 URL
}

/**
 * 签名直传文件到 OSS
 * @param file 文件对象
 * @param dir OSS 目录前缀
 * @param maxSizeMB 最大文件大小（MB）
 * @param onProgress 上传进度回调
 * @returns { url, objectKey }
 */
export async function uploadToOss(
    file: File,
    dir = "uploads/avatars/",
    maxSizeMB = 10,
    onProgress?: (percent: number) => void
): Promise<{ url: string; objectKey: string }> {
  const res = await fetch("/api/oss/policy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dir, maxSizeMB }),
  })
  const policy: OssPolicy = await res.json()
  if (!res.ok) throw new Error((policy as { error?: string }).error || "获取签名失败")

  const ext = file.name.split(".").pop() || "bin"
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const key = `${policy.dir}${filename}`
  const formData = new FormData()
  formData.append("key", key)
  formData.append("OSSAccessKeyId", policy.accessKeyId)
  formData.append("policy", policy.policy)
  formData.append("Signature", policy.signature)
  formData.append("success_action_status", "200")
  // 设置 Content-Disposition 为 inline，允许浏览器预览而非下载
  formData.append("Content-Disposition", "inline")
  // 设置正确的 Content-Type
  formData.append("Content-Type", file.type || "application/octet-stream")
  formData.append("file", file)

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", policy.host, true)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve()
      } else {
        reject(new Error(`OSS 上传失败: ${xhr.status}`))
      }
    }
    xhr.onerror = () => {
      reject(new Error("网络错误"))
    }
    xhr.send(formData)
  })

  // 使用自定义域名生成文件访问 URL
  // domain 已经包含 https:// 前缀
  const fileUrl = `${policy.domain}/${key}`

  return { url: fileUrl, objectKey: key }
}

/**
 * 获取 OSS 签名图片 URL
 * @param objectKey OSS 文件 key
 * @param expires 有效期（秒）
 * @returns 签名 URL
 */
export async function getOssSignedUrl(objectKey: string, expires = 120): Promise<string> {
  const res = await fetch("/api/oss/sign-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ objectKey, expires }),
  })
  const data: { url?: string; error?: string } = await res.json()
  if (!res.ok) throw new Error(data.error || "获取签名 URL 失败")

  // 将 http 协议替换为 https 协议
  const originalUrl = data.url as string
  const httpsUrl = originalUrl.replace(/^http:/, 'https:')

  return httpsUrl
}

/**
 * 测试函数：验证 URL 协议转换
 * @param url 原始 URL
 * @returns 转换后的 HTTPS URL
 */
export function ensureHttps(url: string): string {
  return url.replace(/^http:/, 'https:')
} 