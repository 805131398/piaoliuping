import { useState, useEffect, useRef } from 'react';
import { getOssImageUrlWithCache, isOssImage, ossUrlCache } from '../oss-image';

/**
 * 使用 OSS 图片的 React Hook
 * @param url 图片 URL
 * @param expires 签名 URL 有效期（秒），默认 1 小时
 * @returns 处理后的图片 URL 和加载状态
 */
export function useOssImage(url: string | null | undefined, expires: number = 3600) {
  // 同步检查缓存，避免不必要的 loading 状态
  const getInitialUrl = () => {
    if (!url) return null;
    if (!isOssImage(url)) return url;
    // 同步检查缓存
    const cached = ossUrlCache.get(url);
    return cached || url;
  };
  
  const getInitialLoading = () => {
    if (!url) return false;
    if (!isOssImage(url)) return false;
    // 有缓存就不需要 loading
    return !ossUrlCache.get(url);
  };

  const [imageUrl, setImageUrl] = useState<string | null>(getInitialUrl);
  const [isLoading, setIsLoading] = useState(getInitialLoading);
  const [error, setError] = useState<string | null>(null);
  const prevUrlRef = useRef(url);

  useEffect(() => {
    // URL 未变化且已有有效图片，跳过
    if (url === prevUrlRef.current && imageUrl && !isLoading) {
      return;
    }
    prevUrlRef.current = url;

    if (!url) {
      setImageUrl(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    // 如果不是 OSS 图片，直接使用原始 URL
    if (!isOssImage(url)) {
      setImageUrl(url);
      setError(null);
      setIsLoading(false);
      return;
    }

    // 同步检查缓存
    const cached = ossUrlCache.get(url);
    if (cached) {
      setImageUrl(cached);
      setError(null);
      setIsLoading(false);
      return;
    }

    // 无缓存，异步获取签名 URL
    setIsLoading(true);
    setError(null);

    getOssImageUrlWithCache(url, expires)
      .then((signedUrl) => {
        setImageUrl(signedUrl);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('获取 OSS 图片失败:', err);
        setError(err.message || '获取图片失败');
        setImageUrl(url); // 失败时使用原始 URL
        setIsLoading(false);
      });
  }, [url, expires]);

  return {
    imageUrl,
    isLoading,
    error,
    isOssImage: url ? isOssImage(url) : false,
  };
}

/**
 * 批量使用 OSS 图片的 React Hook
 * @param urls 图片 URL 数组
 * @param expires 签名 URL 有效期（秒），默认 1 小时
 * @returns 处理后的图片 URL 数组和加载状态
 */
export function useOssImages(urls: (string | null | undefined)[], expires: number = 3600) {
  const [imageUrls, setImageUrls] = useState<(string | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!urls || urls.length === 0) {
      setImageUrls([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // 过滤掉空值并处理每个 URL
    const validUrls = urls.filter((url): url is string => !!url);
    
    Promise.all(
      validUrls.map(async (url) => {
        if (!isOssImage(url)) {
          return url;
        }
        
        try {
          return await getOssImageUrlWithCache(url, expires);
        } catch (err) {
          console.error('获取 OSS 图片失败:', err);
          return url; // 失败时使用原始 URL
        }
      })
    )
      .then((processedUrls) => {
        // 保持原始数组的长度和位置
        const result = urls.map((url, index) => {
          if (!url) return null;
          const validIndex = validUrls.indexOf(url);
          return validIndex >= 0 ? processedUrls[validIndex] : url;
        });
        
        setImageUrls(result);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('批量获取 OSS 图片失败:', err);
        setError(err.message || '批量获取图片失败');
        setImageUrls(urls.map(url => url || null)); // 失败时使用原始 URL
        setIsLoading(false);
      });
  }, [urls, expires]);

  return {
    imageUrls,
    isLoading,
    error,
  };
} 