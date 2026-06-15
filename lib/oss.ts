import OSS from 'ali-oss'
import crypto from 'crypto'
import { getOssConfigValues } from './oss-config'

interface OssConfig {
  region: string
  accessKeyId: string
  accessKeySecret: string
  bucket: string
  domain?: string  // 自定义域名，如 https://cdn.example.com
}

/**
 * 从数据库获取 OSS 配置
 */
async function getOssConfigFromDB() {
  return getOssConfigValues()
}

// 文件列表项接口
export interface OssFileItem {
  name: string;           // 文件完整路径
  url: string;            // 文件 URL
  size: number;           // 文件大小（字节）
  lastModified: Date;     // 最后修改时间
  etag: string;           // ETag
  type: string;           // 文件类型（根据扩展名判断）
}

// 文件夹项接口
export interface OssFolderItem {
  name: string;           // 文件夹路径（以 / 结尾）
  prefix: string;         // 前缀
}

// 列表结果接口
export interface OssListResult {
  files: OssFileItem[];
  folders: OssFolderItem[];
  nextMarker?: string;    // 用于分页
  isTruncated: boolean;   // 是否还有更多数据
}

export class AliyunOssClient {
  private client: OSS
  private bucket: string
  private region: string
  private domain: string  // 自定义域名

  constructor(config: OssConfig) {
    // 处理 region 格式，确保是 oss-cn-xxx 格式
    let region = config.region.trim();

    // 移除协议前缀
    if (region.includes('://')) {
      region = region.split('://')[1];
    }
    // 移除 .aliyuncs.com 后缀
    if (region.includes('.aliyuncs.com')) {
      region = region.replace('.aliyuncs.com', '');
    }
    // 如果包含 bucket 名称（如 bucket.oss-cn-beijing），取后半部分
    if (region.includes('.oss-')) {
      region = region.split('.').slice(1).join('.');
    }
    // 如果是简写格式（如 beijing），转换为完整格式 oss-cn-beijing
    if (!region.startsWith('oss-')) {
      region = `oss-cn-${region}`;
    }

    this.client = new OSS({
      region: region,
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      bucket: config.bucket,
      secure: true,
    })
    this.bucket = config.bucket
    this.region = region
    // 保存自定义域名（去掉末尾的 /）
    this.domain = config.domain?.replace(/\/$/, '') || ''
  }

  /**
   * 获取文件访问的 host URL
   * 优先使用自定义域名，否则使用默认的 OSS 域名
   */
  getHost(): string {
    if (this.domain) {
      return this.domain
    }
    // 默认 OSS 域名格式: bucket.oss-cn-region.aliyuncs.com
    return `https://${this.bucket}.${this.region}.aliyuncs.com`
  }

  /**
   * 从数据库创建 OSS 客户端
   */
  static async createFromDB() {
    const config = await getOssConfigFromDB();

    if (!config.region || !config.bucket || !config.accessKeyId || !config.accessKeySecret) {
      throw new Error('OSS 配置不完整，请在参数管理页面配置');
    }

    return new AliyunOssClient({
      region: config.region,
      bucket: config.bucket,
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      domain: config.domain,  // 传入自定义域名
    });
  }

  /**
   * 上传文件到 OSS（服务端直传，适合小文件或特殊场景）
   */
  async upload(objectKey: string, file: Buffer | string) {
    try {
      const result = await this.client.put(objectKey, file)
      // 使用自定义域名生成 URL
      const url = `${this.getHost()}/${result.name}`
      return {
        url,
        name: result.name,
        res: result.res,
      }
    } catch (error) {
      // 可根据 ali-oss 错误类型细化处理
      throw new Error('OSS 上传失败: ' + (error as Error).message)
    }
  }

  /**
   * 根据文件扩展名获取 MIME 类型
   */
  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    const mimeTypes: Record<string, string> = {
      // 图片
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'ico': 'image/x-icon',
      'bmp': 'image/bmp',
      // 视频
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      'mkv': 'video/x-matroska',
      // 音频
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      // 文档
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'json': 'application/json',
      'xml': 'application/xml',
      // 压缩包
      'zip': 'application/zip',
      'rar': 'application/vnd.rar',
      '7z': 'application/x-7z-compressed',
      'tar': 'application/x-tar',
      'gz': 'application/gzip',
    }
    return mimeTypes[ext] || 'application/octet-stream'
  }

  /**
   * 列出 OSS 文件和文件夹
   * @param prefix 前缀（文件夹路径），如 'uploads/' 或 'uploads/avatars/'
   * @param options 选项
   * @returns 文件和文件夹列表
   */
  async listFiles(
      prefix = '',
      options: {
        maxKeys?: number;      // 每次返回的最大数量，默认 100
        marker?: string;       // 分页标记
        delimiter?: string;    // 分隔符，默认 '/'，用于模拟文件夹
      } = {}
  ): Promise<OssListResult> {
    const { maxKeys = 100, marker, delimiter = '/' } = options

    try {
      const result = await this.client.list({
        prefix,
        'max-keys': maxKeys,
        marker,
        delimiter,
      }, {})

      console.log('[OSS listFiles] 获取成功, objects数量:', result.objects?.length || 0)
      const host = this.getHost()

      // 处理文件列表 - 添加安全检查
      const objects = result.objects || []
      const files: OssFileItem[] = []
      
      for (const obj of objects) {
        if (obj && typeof obj.name === 'string' && !obj.name.endsWith('/')) {
          files.push({
            name: obj.name,
            url: `${host}/${obj.name}`,
            size: obj.size || 0,
            lastModified: obj.lastModified ? new Date(obj.lastModified) : new Date(),
            etag: obj.etag || '',
            type: this.getMimeType(obj.name),
          })
        }
      }

      // 处理文件夹列表（通过 CommonPrefixes）
      const prefixList = result.prefixes || []
      const folders: OssFolderItem[] = []
      
      for (const p of prefixList) {
        if (p && typeof p === 'string') {
          folders.push({
            name: p,
            prefix: p,
          })
        }
      }

      return {
        files,
        folders,
        nextMarker: result.nextMarker,
        isTruncated: result.isTruncated,
      }
    } catch (error) {
      console.error('[OSS listFiles] 完整错误:', error)
      throw new Error('获取文件列表失败: ' + (error as Error).message)
    }
  }

  /**
   * 列出所有文件（不分文件夹，递归获取）
   * @param prefix 前缀
   * @param maxKeys 最大数量
   */
  async listAllFiles(prefix = '', maxKeys = 1000): Promise<OssFileItem[]> {
    const allFiles: OssFileItem[] = []
    let marker: string | undefined

    do {
      const result = await this.listFiles(prefix, {
        maxKeys: Math.min(maxKeys - allFiles.length, 100),
        marker,
        delimiter: '', // 不使用分隔符，获取所有文件
      })
      allFiles.push(...result.files)
      marker = result.nextMarker
    } while (marker && allFiles.length < maxKeys)

    return allFiles
  }

  /**
   * 删除 OSS 文件
   * @param objectKey 文件路径
   */
  async deleteFile(objectKey: string): Promise<void> {
    try {
      await this.client.delete(objectKey)
    } catch (error) {
      throw new Error('删除文件失败: ' + (error as Error).message)
    }
  }

  /**
   * 批量删除 OSS 文件
   * @param objectKeys 文件路径数组
   */
  async deleteFiles(objectKeys: string[]): Promise<void> {
    try {
      await this.client.deleteMulti(objectKeys)
    } catch (error) {
      throw new Error('批量删除文件失败: ' + (error as Error).message)
    }
  }

  /**
   * 获取文件的签名 URL（用于私有文件访问）
   * @param objectKey 文件路径
   * @param expires 有效期（秒），默认 120
   */
  async signUrl(objectKey: string, expires = 120): Promise<string> {
    try {
      const url = await this.client.signatureUrl(objectKey, { expires })
      return url.replace(/^http:/, 'https:')
    } catch (error) {
      throw new Error('生成签名 URL 失败: ' + (error as Error).message)
    }
  }

  /**
   * 更新文件的 HTTP 头（通过复制到自身实现）
   * @param objectKey 文件路径
   * @param headers 要设置的 HTTP 头
   */
  async updateFileHeaders(
      objectKey: string,
      headers: Record<string, string>
  ): Promise<void> {
    try {
      // 使用 copy 方法复制到自身，并设置新的 headers
      await this.client.copy(objectKey, objectKey, {
        headers: {
          // 设置元数据替换模式
          'x-oss-metadata-directive': 'REPLACE',
          ...headers,
        },
      })
    } catch (error) {
      throw new Error('更新文件头失败: ' + (error as Error).message)
    }
  }

  /**
   * 生成前端直传 OSS 的 Policy/签名（推荐最佳实践）
   * @param options 生成策略参数
   * @returns policy、signature、accessKeyId、host、dir、expire 等
   */
  static generatePolicySignature({
                                   dir = '',
                                   expireSeconds = 60,
                                   maxSizeMB = 10,
                                   bucket,
                                   region,
                                   accessKeyId,
                                   accessKeySecret,
                                   host,
                                 }: {
    dir?: string
    expireSeconds?: number
    maxSizeMB?: number
    bucket: string
    region: string
    accessKeyId: string
    accessKeySecret: string
    host: string
  }) {
    const now = Math.floor(Date.now() / 1000)
    const expire = now + expireSeconds
    const policyText = {
      expiration: new Date(expire * 1000).toISOString(),
      conditions: [
        ["content-length-range", 0, maxSizeMB * 1024 * 1024],
        ["starts-with", "$key", dir],
        // 允许设置 Content-Disposition 和 Content-Type
        ["starts-with", "$Content-Disposition", ""],
        ["starts-with", "$Content-Type", ""],
      ],
    }
    const policyBase64 = Buffer.from(JSON.stringify(policyText)).toString('base64')
    const signature = crypto.createHmac('sha1', accessKeySecret).update(policyBase64).digest('base64')
    return {
      accessKeyId,
      policy: policyBase64,
      signature,
      dir,
      host,
      expire,
      bucket,
      region,
    }
  }

  /**
   * 从数据库配置生成前端直传签名
   */
  static async generatePolicySignatureFromDB({
                                               dir = '',
                                               expireSeconds = 60,
                                               maxSizeMB = 10,
                                             }: {
    dir?: string
    expireSeconds?: number
    maxSizeMB?: number
  } = {}) {
    const config = await getOssConfigFromDB();

    if (!config.region || !config.bucket || !config.accessKeyId || !config.accessKeySecret) {
      throw new Error('OSS 配置不完整，请在参数管理页面配置');
    }

    // 规范化 region 格式，确保是 oss-cn-xxx 格式
    let region = config.region.trim();
    if (region.includes('://')) {
      region = region.split('://')[1];
    }
    if (region.includes('.aliyuncs.com')) {
      region = region.replace('.aliyuncs.com', '');
    }
    if (region.includes('.oss-')) {
      region = region.split('.').slice(1).join('.');
    }
    if (!region.startsWith('oss-')) {
      region = `oss-cn-${region}`;
    }

    // 构建上传 host URL（必须使用 OSS 原始域名）
    const uploadHost = `https://${config.bucket}.${region}.aliyuncs.com`;

    // 自定义域名用于文件访问（如果配置了的话）
    const domain = config.domain?.replace(/\/$/, '') || uploadHost;

    const result = AliyunOssClient.generatePolicySignature({
      dir,
      expireSeconds,
      maxSizeMB,
      bucket: config.bucket,
      region,
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      host: uploadHost,
    });

    return {
      ...result,
      domain,  // 返回自定义域名，用于生成文件访问 URL
    };
  }
}

/**
 * 用法说明：
 * - 在 API 路由中调用 AliyunOssClient.generatePolicySignature，返回给前端
 * - 前端用该签名、policy、accessKeyId、host 直传 OSS
 * - 参考阿里云官方直传文档：https://help.aliyun.com/zh/oss/developer-reference/browser-direct-upload
 */

// 用法示例（在 API 路由或服务端调用）：
// const oss = new AliyunOssClient({ region, accessKeyId, accessKeySecret, bucket })
// await oss.upload('uploads/avatars/xxx.png', fileBuffer) 
