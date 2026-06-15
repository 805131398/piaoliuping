# OSS URL 存储修复说明

## 问题描述

在测试过程中发现，之前存储到数据库中的头像 URL 是带签名的临时 URL，这些签名 URL 有时效性（默认 1 小时），过期后无法访问，导致头像显示失败。

## 问题分析

### 之前的实现（有问题）
```typescript
// 上传成功后获取签名 URL 并存储
const signedUrl = await getOssSignedUrl(result.objectKey, 3600);
onChange({ avatarUrl: signedUrl }); // 存储签名 URL

// 数据库中存储的是：
// https://pop.luckcoder.oss-cn-beijing.aliyuncs.com/uploads/avatar.jpg?Expires=1703123456&Signature=abc123...
```

### 问题
1. **时效性问题**：签名 URL 1 小时后过期
2. **无法访问**：过期后头像无法显示
3. **数据不一致**：数据库中存储的是临时 URL

## 解决方案

### 修复后的实现（正确）
```typescript
// 上传成功后存储原始 OSS URL
const originalOssUrl = result.url;
onChange({ avatarUrl: originalOssUrl }); // 存储原始 URL

// 数据库中存储的是：
// https://pop.luckcoder.oss-cn-beijing.aliyuncs.com/uploads/avatar.jpg
```

### 显示时的处理
```typescript
// 在显示时动态获取签名 URL
const { imageUrl } = useOssImage(originalOssUrl);
// 自动处理：如果是 OSS 图片，获取签名 URL；如果不是，直接使用
```

## 修复内容

### 1. 修改上传逻辑
**文件：** `components/avatar/UploadAvatarPanel.tsx`

```typescript
// 修改前：存储签名 URL
const signedUrl = await getOssSignedUrl(result.objectKey, 3600);
onChange({ avatarUrl: signedUrl });

// 修改后：存储原始 OSS URL
const originalOssUrl = result.url;
onChange({ avatarUrl: originalOssUrl });
```

### 2. 智能显示机制
**文件：** `lib/oss-image.ts` 和 `lib/hooks/useOssImage.ts`

- 自动判断是否为 OSS 图片
- 动态获取签名 URL
- 缓存机制避免重复请求
- 过期前自动重新获取

### 3. 缓存策略
```typescript
// 缓存配置
- 缓存时间：与签名 URL 有效期相同（默认 1 小时）
- 提前过期：5 分钟（避免过期后访问失败）
- 自动清理：过期缓存自动删除
```

## 数据流程

### 上传流程
1. 用户选择图片 → 裁剪 → 上传到 OSS
2. 获取原始 OSS URL：`https://pop.luckcoder.oss-cn-beijing.aliyuncs.com/uploads/avatar.jpg`
3. 存储到数据库：原始 OSS URL（永久有效）

### 显示流程
1. 从数据库读取：原始 OSS URL
2. 智能判断：是否为 OSS 图片
3. 动态处理：
   - 如果是 OSS 图片：获取签名 URL（带缓存）
   - 如果不是 OSS 图片：直接使用原始 URL
4. 显示图片

## 优势

### 1. 数据持久性
- 数据库中存储的 URL 永久有效
- 不会因为签名过期而失效

### 2. 灵活性
- 支持公共和私有存储桶
- 自动适应不同的访问策略

### 3. 性能优化
- 签名 URL 缓存机制
- 避免重复请求
- 过期前自动更新

### 4. 安全性
- 私有存储桶通过签名 URL 访问
- 公共存储桶直接访问
- 自动处理权限问题

## 测试验证

### 1. 访问测试页面
访问 `/test/oss-image` 页面，查看：
- **是否为签名 URL**：显示当前 URL 是否包含签名参数
- **URL 类型说明**：了解原始 URL 和签名 URL 的区别

### 2. 功能测试
1. 上传新头像
2. 检查数据库中存储的 URL（应该是原始 OSS URL）
3. 刷新页面，确认头像正常显示
4. 等待签名过期，确认头像仍然正常显示

### 3. 缓存测试
1. 多次访问同一头像
2. 查看网络请求，确认签名 URL 被缓存
3. 等待缓存过期，确认自动重新获取

## 注意事项

### 1. 现有数据
如果数据库中已有签名 URL，建议：
- 清理过期的签名 URL
- 或者编写迁移脚本转换为原始 URL

### 2. 存储桶配置
- 公共存储桶：直接访问原始 URL
- 私有存储桶：通过签名 URL 访问

### 3. 缓存配置
- 根据业务需求调整缓存时间
- 监控缓存命中率
- 定期清理过期缓存

## 总结

通过这次修复，我们实现了：
- ✅ 数据库中存储永久有效的原始 OSS URL
- ✅ 显示时动态获取签名 URL
- ✅ 智能缓存机制避免重复请求
- ✅ 自动处理公共/私有存储桶访问
- ✅ 优雅的错误处理和降级机制

这样确保了头像 URL 的持久性和访问的可靠性！ 