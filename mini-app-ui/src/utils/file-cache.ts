/**
 * 文件缓存工具
 * 将远程资源（图片、音频）下载到本地，避免重复网络请求
 */

// 缓存映射存储键
const CACHE_MAP_KEY = 'FILE_CACHE_MAP'
// 缓存版本（如需清理缓存可升级版本）
const CACHE_VERSION = 'v1'

// 缓存映射: { remoteUrl: localPath }
let cacheMap: Record<string, string> = {}

// 正在下载的任务队列，避免重复下载
const downloadingTasks: Record<string, Promise<string>> = {}

/**
 * 初始化缓存映射（应在应用启动时调用）
 */
export function initFileCache() {
  try {
    const saved = uni.getStorageSync(CACHE_MAP_KEY)
    if (saved && saved.version === CACHE_VERSION) {
      cacheMap = saved.map || {}
      // 验证缓存文件是否存在，清理无效缓存
      validateCache()
    } else {
      // 版本不匹配，清空缓存
      cacheMap = {}
      saveCacheMap()
    }
  } catch (e) {
    console.warn('初始化文件缓存失败', e)
    cacheMap = {}
  }
}

/**
 * 验证缓存文件是否存在，移除无效缓存
 */
async function validateCache() {
  const fs = uni.getFileSystemManager()
  const invalidUrls: string[] = []
  
  for (const [url, localPath] of Object.entries(cacheMap)) {
    try {
      fs.accessSync(localPath)
    } catch {
      invalidUrls.push(url)
    }
  }
  
  if (invalidUrls.length > 0) {
    invalidUrls.forEach(url => delete cacheMap[url])
    saveCacheMap()
    console.log(`清理无效缓存: ${invalidUrls.length} 个`)
  }
}

/**
 * 保存缓存映射到本地存储
 */
function saveCacheMap() {
  try {
    uni.setStorageSync(CACHE_MAP_KEY, {
      version: CACHE_VERSION,
      map: cacheMap,
      updatedAt: Date.now()
    })
  } catch (e) {
    console.warn('保存缓存映射失败', e)
  }
}

/**
 * 生成本地文件名（基于URL的hash）
 */
function generateLocalFileName(url: string): string {
  // 提取文件扩展名
  const ext = url.split('?')[0].split('.').pop() || 'tmp'
  // 简单hash
  let hash = 0
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return `cached_${Math.abs(hash).toString(16)}.${ext}`
}

/**
 * 获取缓存文件（如果已缓存返回本地路径，否则返回原URL）
 * 这是同步方法，用于立即获取路径
 */
export function getCachedPath(remoteUrl: string): string {
  if (!remoteUrl || !remoteUrl.startsWith('http')) {
    return remoteUrl
  }
  return cacheMap[remoteUrl] || remoteUrl
}

/**
 * 检查是否已缓存
 */
export function isCached(remoteUrl: string): boolean {
  return !!cacheMap[remoteUrl]
}

/**
 * 下载并缓存文件（异步）
 * @returns 本地文件路径
 */
export async function cacheFile(remoteUrl: string): Promise<string> {
  if (!remoteUrl || !remoteUrl.startsWith('http')) {
    return remoteUrl
  }
  
  // 已缓存，直接返回
  if (cacheMap[remoteUrl]) {
    return cacheMap[remoteUrl]
  }
  
  // 正在下载，等待完成
  if (downloadingTasks[remoteUrl]) {
    return downloadingTasks[remoteUrl]
  }
  
  // 开始下载
  const downloadPromise = (async () => {
    try {
      // 下载文件
      const downloadRes = await new Promise<UniApp.DownloadSuccessData>((resolve, reject) => {
        uni.downloadFile({
          url: remoteUrl,
          success: resolve,
          fail: reject
        })
      })
      
      if (downloadRes.statusCode !== 200) {
        throw new Error(`下载失败: ${downloadRes.statusCode}`)
      }
      
      // 保存到本地永久存储
      const fileName = generateLocalFileName(remoteUrl)
      const savedPath = await new Promise<string>((resolve, reject) => {
        const fs = uni.getFileSystemManager()
        // 获取用户数据目录 (兼容写法)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userDataPath = (uni as any).env?.USER_DATA_PATH || (globalThis as any).wx?.env?.USER_DATA_PATH || ''
        const targetPath = `${userDataPath}/${fileName}`
        
        fs.saveFile({
          tempFilePath: downloadRes.tempFilePath,
          filePath: targetPath,
          success: () => resolve(targetPath),
          fail: (err) => {
            // 如果目标路径已存在，尝试删除后重新保存
            try {
              fs.unlinkSync(targetPath)
              fs.saveFile({
                tempFilePath: downloadRes.tempFilePath,
                filePath: targetPath,
                success: () => resolve(targetPath),
                fail: reject
              })
            } catch {
              reject(err)
            }
          }
        })
      })
      
      // 更新缓存映射
      cacheMap[remoteUrl] = savedPath
      saveCacheMap()
      
      return savedPath
    } catch (e) {
      console.warn('缓存文件失败:', remoteUrl, e)
      // 缓存失败，返回原URL
      return remoteUrl
    } finally {
      // 清理下载任务
      delete downloadingTasks[remoteUrl]
    }
  })()
  
  downloadingTasks[remoteUrl] = downloadPromise
  return downloadPromise
}

/**
 * 批量预缓存文件
 * @param urls 需要缓存的URL列表
 * @param concurrency 并发数
 */
export async function preCacheFiles(urls: string[], concurrency: number = 3): Promise<void> {
  // 过滤出未缓存的URL
  const uncachedUrls = urls.filter(url => url && url.startsWith('http') && !cacheMap[url])
  
  if (uncachedUrls.length === 0) {
    return
  }
  
  console.log(`预缓存 ${uncachedUrls.length} 个文件...`)
  
  // 分批并发下载
  for (let i = 0; i < uncachedUrls.length; i += concurrency) {
    const batch = uncachedUrls.slice(i, i + concurrency)
    await Promise.all(batch.map(url => cacheFile(url)))
  }
  
  console.log('预缓存完成')
}

/**
 * 清空所有缓存
 */
export async function clearFileCache(): Promise<void> {
  const fs = uni.getFileSystemManager()
  
  // 删除所有缓存文件
  for (const localPath of Object.values(cacheMap)) {
    try {
      fs.unlinkSync(localPath)
    } catch (e) {
      // 忽略删除失败
    }
  }
  
  // 清空映射
  cacheMap = {}
  saveCacheMap()
  
  console.log('文件缓存已清空')
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats(): { count: number; urls: string[] } {
  return {
    count: Object.keys(cacheMap).length,
    urls: Object.keys(cacheMap)
  }
}
