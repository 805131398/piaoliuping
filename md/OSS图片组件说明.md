# OSS 图片组件使用说明

## 概述

本项目提供了智能的 OSS 图片组件，能够自动判断图片 URL 是否为阿里云 OSS 图片，如果是则自动获取签名 URL 进行访问。

## 核心功能

- ✅ **智能判断**：自动识别 OSS 图片 URL
- ✅ **签名 URL**：自动获取带签名的访问 URL
- ✅ **缓存机制**：避免重复获取签名 URL
- ✅ **错误处理**：优雅降级到原始 URL
- ✅ **React Hook**：提供便捷的 Hook 接口
- ✅ **组件封装**：提供开箱即用的 React 组件

## 文件结构

```
lib/
├── oss-image.ts          # OSS 图片工具类
└── hooks/
    └── useOssImage.ts    # React Hook

components/ui/
└── oss-image.tsx         # OSS 图片组件
```

## 工具类使用

### 基础函数

```typescript
import { isOssImage, getOssImageUrl, getOssImageUrlWithCache } from '@/lib/oss-image';

// 判断是否为 OSS 图片
const isOss = isOssImage('https://pop.luckcoder.oss-cn-beijing.aliyuncs.com/uploads/avatar.jpg');
// 返回: true

// 获取签名 URL
const signedUrl = await getOssImageUrl('https://pop.luckcoder.oss-cn-beijing.aliyuncs.com/uploads/avatar.jpg');
// 返回: https://pop.luckcoder.oss-cn-beijing.aliyuncs.com/uploads/avatar.jpg?Expires=...&Signature=...

// 带缓存的签名 URL
const cachedUrl = await getOssImageUrlWithCache('https://pop.luckcoder.oss-cn-beijing.aliyuncs.com/uploads/avatar.jpg');
```

### 批量处理

```typescript
import { getOssImageUrls } from '@/lib/oss-image';

const urls = [
  'https://pop.luckcoder.oss-cn-beijing.aliyuncs.com/uploads/avatar1.jpg',
  'https://via.placeholder.com/300x200',
  'https://pop.luckcoder.oss-cn-beijing.aliyuncs.com/uploads/avatar2.jpg'
];

const signedUrls = await getOssImageUrls(urls);
// 返回: [签名URL1, 原始URL2, 签名URL3]
```

## React Hook 使用

### 单个图片

```typescript
import { useOssImage } from '@/lib/hooks/useOssImage';

function MyComponent() {
  const { imageUrl, isLoading, error, isOssImage } = useOssImage(
    'https://pop.luckcoder.oss-cn-beijing.aliyuncs.com/uploads/avatar.jpg'
  );

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>加载失败: {error}</div>;

  return <img src={imageUrl} alt="头像" />;
}
```

### 批量图片

```typescript
import { useOssImages } from '@/lib/hooks/useOssImage';

function MyComponent() {
  const { imageUrls, isLoading, error } = useOssImages([
    'https://pop.luckcoder.oss-cn-beijing.aliyuncs.com/uploads/avatar1.jpg',
    'https://via.placeholder.com/300x200',
    'https://pop.luckcoder.oss-cn-beijing.aliyuncs.com/uploads/avatar2.jpg'
  ]);

  if (isLoading) return <div>加载中...</div>;

  return (
    <div>
      {imageUrls.map((url, index) => (
        <img key={index} src={url} alt={`图片 ${index}`} />
      ))}
    </div>
  );
}
```

## React 组件使用

### OssImage 组件

```typescript
import { OssImage } from '@/components/ui/oss-image';

function MyComponent() {
  return (
    <OssImage
      src="https://pop.luckcoder.oss-cn-beijing.aliyuncs.com/uploads/avatar.jpg"
      alt="用户头像"
      width={200}
      height={150}
      className="rounded-lg"
      fallbackSrc="/default-avatar.png"
      expires={3600} // 签名 URL 有效期（秒）
    />
  );
}
```

### OssAvatar 组件

```typescript
import { OssAvatar } from '@/components/ui/oss-image';

function MyComponent() {
  return (
    <OssAvatar
      src="https://pop.luckcoder.oss-cn-beijing.aliyuncs.com/uploads/avatar.jpg"
      alt="用户头像"
      size={80}
      className="border-2 border-blue-400"
    />
  );
}
```

### OssImageGrid 组件

```typescript
import { OssImageGrid } from '@/components/ui/oss-image';

function MyComponent() {
  const images = [
    'https://pop.luckcoder.oss-cn-beijing.aliyuncs.com/uploads/avatar1.jpg',
    'https://via.placeholder.com/300x200',
    'https://pop.luckcoder.oss-cn-beijing.aliyuncs.com/uploads/avatar2.jpg',
    null
  ];

  return (
    <OssImageGrid
      images={images}
      alt="图片网格"
      gridClassName="grid grid-cols-2 gap-4"
      imageClassName="w-full h-32 object-cover rounded"
    />
  );
}
```

## 实际应用示例

### 用户头像显示

```typescript
import { OssAvatar } from '@/components/ui/oss-image';

function UserProfile({ user }) {
  return (
    <div className="flex items-center gap-4">
      <OssAvatar
        src={user.avatar}
        alt={user.name}
        size={60}
        className="border-2 border-blue-400"
      />
      <div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    </div>
  );
}
```

### 图片列表

```typescript
import { OssImageGrid } from '@/components/ui/oss-image';

function ImageGallery({ images }) {
  return (
    <OssImageGrid
      images={images}
      alt="图片画廊"
      gridClassName="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2"
      imageClassName="w-full h-24 object-cover rounded-lg hover:scale-105 transition-transform"
    />
  );
}
```

### 动态图片切换

```typescript
import { useOssImage } from '@/lib/hooks/useOssImage';

function DynamicImage({ imageUrl }) {
  const { imageUrl: signedUrl, isLoading, error } = useOssImage(imageUrl);

  if (isLoading) {
    return <div className="w-64 h-48 bg-gray-200 animate-pulse rounded" />;
  }

  if (error) {
    return <div className="w-64 h-48 bg-red-100 text-red-600 flex items-center justify-center rounded">
      图片加载失败
    </div>;
  }

  return (
    <img
      src={signedUrl}
      alt="动态图片"
      className="w-64 h-48 object-cover rounded"
    />
  );
}
```

## 配置说明

### 环境变量

确保已配置 OSS 相关环境变量：

```bash
OSS_REGION=oss-cn-beijing
OSS_BUCKET=your-bucket-name
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret
OSS_HOST=https://your-bucket-name.oss-cn-beijing.aliyuncs.com
```

### 缓存配置

签名 URL 缓存默认配置：
- 缓存时间：与签名 URL 有效期相同
- 提前过期：5 分钟（避免过期后访问失败）
- 缓存清理：自动清理过期缓存

## 性能优化

### 1. 缓存策略
- 签名 URL 自动缓存，避免重复请求
- 缓存过期自动清理
- 支持批量处理，减少 API 调用

### 2. 错误处理
- 网络错误时降级到原始 URL
- 签名失败时使用原始 URL
- 提供友好的错误提示

### 3. 加载优化
- 支持加载状态显示
- 骨架屏加载效果
- 渐进式图片加载

## 测试

访问 `/test/oss-image` 页面测试各种功能：

1. **单个图片测试**：测试 OSS 和普通图片
2. **头像测试**：测试头像组件
3. **批量图片测试**：测试图片网格
4. **URL 切换测试**：测试动态切换
5. **调试信息**：查看处理状态

## 注意事项

1. **存储桶权限**：确保 OSS 存储桶配置正确
2. **签名有效期**：根据业务需求设置合适的有效期
3. **错误处理**：始终提供 fallback 机制
4. **性能考虑**：大量图片时考虑使用批量处理
5. **缓存策略**：合理设置缓存时间，避免频繁请求

## 故障排除

### 常见问题

1. **签名 URL 获取失败**
   - 检查 OSS 环境变量配置
   - 确认 RAM 用户权限
   - 验证存储桶权限设置

2. **图片加载失败**
   - 检查原始 URL 是否有效
   - 确认文件是否存在于 OSS
   - 查看网络连接状态

3. **缓存问题**
   - 清除浏览器缓存
   - 检查签名 URL 是否过期
   - 重新获取签名 URL

### 调试方法

1. 使用浏览器开发者工具查看网络请求
2. 检查控制台错误信息
3. 使用测试页面验证功能
4. 查看组件调试信息 