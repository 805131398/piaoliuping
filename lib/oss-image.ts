import { getOssSignedUrl } from './oss-utils';

/**
 * 判断是否为 OSS 图片 URL
 * @param url 图片 URL
 * @returns 是否为 OSS 图片
 */
export function isOssImage(url: string): boolean {
  if (!url) return false;
  
  // 检查是否为 OSS 域名
  const ossDomains = [
    '.aliyuncs.com',
    '.aliyun.com',
    'oss-cn-',
    'oss-cn-beijing',
    'oss-cn-hangzhou',
    'oss-cn-shanghai',
    'oss-cn-shenzhen',
    'oss-cn-hongkong',
    'oss-us-west-1',
    'oss-ap-southeast-1',
    'oss-eu-central-1'
  ];
  
  return ossDomains.some(domain => url.includes(domain));
}

/**
 * 从 OSS URL 中提取 objectKey
 * @param url OSS URL
 * @returns objectKey
 */
export function extractObjectKey(url: string): string | null {
  if (!isOssImage(url)) return null;
  
  try {
    const urlObj = new URL(url);
    // 移除开头的斜杠
    return urlObj.pathname.substring(1);
  } catch {
    return null;
  }
}

/**
 * 获取 OSS 图片的签名 URL
 * @param url 原始 OSS URL
 * @param expires 有效期（秒），默认 1 小时
 * @returns 签名 URL 或原始 URL
 */
export async function getOssImageUrl(url: string, expires: number = 3600): Promise<string> {
  if (!isOssImage(url)) {
    return url; // 不是 OSS 图片，直接返回原始 URL
  }
  
  try {
    const objectKey = extractObjectKey(url);
    if (!objectKey) {
      console.warn('无法从 URL 中提取 objectKey:', url);
      return url;
    }
    
    const signedUrl = await getOssSignedUrl(objectKey, expires);
    return signedUrl;
  } catch (error) {
    console.error('获取 OSS 签名 URL 失败:', error);
    return url; // 失败时返回原始 URL
  }
}

/**
 * 批量获取 OSS 图片的签名 URL
 * @param urls 图片 URL 数组
 * @param expires 有效期（秒），默认 1 小时
 * @returns 签名 URL 数组
 */
export async function getOssImageUrls(urls: string[], expires: number = 3600): Promise<string[]> {
  const promises = urls.map(url => getOssImageUrl(url, expires));
  return Promise.all(promises);
}

/**
 * 缓存 OSS 签名 URL
 */
class OssUrlCache {
  private cache = new Map<string, { url: string; expires: number }>();
  
  /**
   * 获取缓存的签名 URL
   */
  get(key: string): string | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    // 检查是否过期（提前 5 分钟过期）
    if (Date.now() > cached.expires - 5 * 60 * 1000) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.url;
  }
  
  /**
   * 设置缓存的签名 URL
   */
  set(key: string, url: string, expiresInSeconds: number): void {
    const expires = Date.now() + expiresInSeconds * 1000;
    this.cache.set(key, { url, expires });
  }
  
  /**
   * 清除缓存
   */
  clear(): void {
    this.cache.clear();
  }
}

// 创建全局缓存实例
export const ossUrlCache = new OssUrlCache();

/**
 * 获取 OSS 图片的签名 URL（带缓存）
 * @param url 原始 OSS URL
 * @param expires 有效期（秒），默认 1 小时
 * @returns 签名 URL 或原始 URL
 */
export async function getOssImageUrlWithCache(url: string, expires: number = 3600): Promise<string> {
  if (!isOssImage(url)) {
    return url;
  }
  
  // 检查缓存
  const cachedUrl = ossUrlCache.get(url);
  if (cachedUrl) {
    return cachedUrl;
  }
  
  try {
    const signedUrl = await getOssImageUrl(url, expires);
    // 缓存签名 URL
    ossUrlCache.set(url, signedUrl, expires);
    return signedUrl;
  } catch (error) {
    console.error('获取 OSS 签名 URL 失败:', error);
    return url;
  }
} 