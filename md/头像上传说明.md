# 头像上传功能实现说明

## 功能概述

本项目已实现通过阿里云 OSS 上传用户头像的功能，**使用前端直传 OSS 的方式**，支持以下特性：

- ✅ 系统头像（DiceBear 生成）
- ✅ 自定义头像（用户上传图片）
- ✅ 图片裁剪和旋转
- ✅ 前端直传阿里云 OSS
- ✅ 数据库 URL 存储
- ✅ 上传进度显示

## 技术架构

### 前端组件
- `AvatarDialog.tsx` - 头像选择对话框
- `UploadAvatarPanel.tsx` - 自定义头像上传面板（**使用 oss-utils.ts 前端直传**）
- `DiceBearAvatarPanel.tsx` - 系统头像选择面板
- `ProfileAvatar.tsx` - 头像显示和编辑组件

### 后端 API
- `app/api/profile/avatar/route.ts` - 头像保存 API（**简化版，只保存 URL**）
- `app/api/oss/policy/route.ts` - OSS 签名生成 API（**被 oss-utils.ts 调用**）

### 工具类
- `lib/oss-utils.ts` - **前端 OSS 直传工具类（主要使用）**
- `lib/oss.ts` - 服务端 OSS 客户端工具类（备用）

## 实现流程

### 1. 系统头像
1. 用户选择 DiceBear 风格和种子
2. 前端生成 SVG 预览
3. 保存风格和种子到数据库
4. 前端实时生成头像显示

### 2. 自定义头像（前端直传）
1. 用户选择图片文件
2. 前端进行图片裁剪和旋转
3. 点击"上传到 OSS"按钮
4. **使用 oss-utils.ts 的 uploadToOss 函数**
5. 获取 OSS 签名和策略
6. **前端直接上传到 OSS**
7. 获取 OSS URL 并保存到数据库

## 数据库设计

User 表中的相关字段：
```sql
image          String?  -- 存储头像 URL（OSS 链接）
avatarSeed     String?  -- DiceBear 种子
avatarStyle    String?  -- DiceBear 风格
avatarType     String?  -- 头像类型：'system' 或 'custom'
```

## 环境变量配置

在 `.env.local` 中添加：
```bash
OSS_REGION=oss-cn-hangzhou
OSS_BUCKET=your-bucket-name
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret
OSS_HOST=https://your-bucket-name.oss-cn-hangzhou.aliyuncs.com
```

## 文件存储结构

OSS 中的文件路径格式：
```
uploads/avatars/{timestamp}_{randomString}.{extension}
```

示例：
```
uploads/avatars/1703123456789_abc123.jpg
```

## 工具类复用说明

### 主要使用：`lib/oss-utils.ts`
- **uploadToOss()** - 前端直传文件到 OSS
- **getOssSignedUrl()** - 获取签名 URL（用于私有文件访问）

### 备用：`lib/oss.ts`
- **AliyunOssClient** - 服务端 OSS 客户端
- **generatePolicySignature()** - 生成签名策略

## 前端直传优势

1. **性能更好**：文件直接从浏览器上传到 OSS，不经过服务器
2. **服务器压力小**：不需要处理文件上传和存储
3. **带宽节省**：文件不经过服务器中转
4. **用户体验好**：实时显示上传进度

## 安全考虑

1. **文件类型限制**：只允许图片格式（jpg, png, gif）
2. **文件大小限制**：最大 5MB
3. **路径安全**：使用时间戳和随机字符串生成唯一文件名
4. **权限控制**：需要用户登录才能上传
5. **OSS 权限**：建议使用 RAM 用户，最小权限原则
6. **签名验证**：使用 OSS 签名确保上传安全

## 测试方法

1. 访问 `/test/oss` 测试 OSS 配置
2. 在用户资料页面测试头像上传
3. 检查控制台日志确认上传成功
4. 验证 OSS 中是否生成了文件

## 错误处理

- OSS 配置缺失时返回错误信息
- 文件上传失败时显示详细错误
- 网络错误时提供重试机制
- 文件格式/大小验证

## 性能优化

1. **图片压缩**：前端裁剪时自动压缩
2. **CDN 加速**：OSS 支持 CDN 加速
3. **缓存策略**：头像 URL 缓存到数据库
4. **异步处理**：上传过程不阻塞用户界面
5. **进度显示**：实时显示上传进度

## 扩展功能

可以考虑添加的功能：
- 头像历史记录
- 批量上传
- 图片滤镜效果
- 头像模板
- 社交分享
- 图片压缩优化 