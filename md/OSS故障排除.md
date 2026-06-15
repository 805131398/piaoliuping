# OSS 故障排除指南

## AccessDenied 错误解决方案

### 错误信息
```
<Error>
<Code>AccessDenied</Code>
<Message>You have no right to access this object because of bucket acl.</Message>
<RequestId>6880468F820F3F35349FC5DD</RequestId>
<HostId>luckcoder.oss-cn-beijing.aliyuncs.com</HostId>
<EC>0003-00000001</EC>
<RecommendDoc>https://api.aliyun.com/troubleshoot?q=0003-00000001</RecommendDoc>
</Error>
```

### 问题原因
这个错误表示您没有权限访问 OSS 对象，通常是因为：
1. 存储桶权限设置为私有
2. 文件权限配置不正确
3. RAM 用户权限不足

## 解决方案

### 方案一：修改存储桶权限（推荐用于头像）

#### 步骤：
1. **登录阿里云控制台**
2. **进入 OSS 管理页面**
3. **选择您的存储桶**（如：luckcoder）
4. **点击"权限管理"**
5. **修改读写权限**：
   - 将"读写权限"设置为"公共读"
   - 将"读写权限"设置为"公共读写"（如果允许上传）

#### 优点：
- 简单直接
- 适合头像等公开资源
- 无需额外代码修改

#### 缺点：
- 所有文件都可以公开访问
- 安全性相对较低

### 方案二：使用签名 URL（推荐用于私有资源）

#### 代码修改：
我已经修改了 `UploadAvatarPanel.tsx`，在上传成功后自动获取签名 URL：

```typescript
// 获取签名 URL 用于显示（如果存储桶是私有的）
let displayUrl = result.url;
try {
  const signedUrl = await getOssSignedUrl(result.objectKey, 3600); // 1小时有效期
  displayUrl = signedUrl;
} catch (error) {
  console.warn('获取签名 URL 失败，使用原始 URL:', error);
}
```

#### 优点：
- 保持存储桶私有
- 安全性更高
- 可以控制访问时间

#### 缺点：
- 需要额外的签名 URL 生成
- URL 有时效性

### 方案三：检查 RAM 用户权限

#### 步骤：
1. **登录阿里云控制台**
2. **进入 RAM 访问控制**
3. **选择用户管理**
4. **找到您的 RAM 用户**
5. **检查权限策略**

#### 推荐的权限策略：
```json
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "oss:PutObject",
        "oss:GetObject",
        "oss:DeleteObject"
      ],
      "Resource": [
        "acs:oss:*:*:your-bucket-name/uploads/avatars/*"
      ]
    }
  ]
}
```

## 测试工具

### 使用测试页面
访问 `/test/oss` 页面，使用以下功能：

1. **测试签名配置**：验证 OSS 环境变量和签名生成
2. **测试文件访问**：上传测试文件并验证访问权限

### 手动测试步骤
1. 配置环境变量
2. 访问测试页面
3. 点击"测试文件访问"
4. 查看测试结果

## 常见问题

### Q1: 为什么会出现 AccessDenied 错误？
A: 通常是因为存储桶权限设置为私有，但前端尝试直接访问文件。

### Q2: 头像文件应该设置为公开还是私有？
A: 对于头像文件，建议设置为"公共读"，因为：
- 头像通常需要公开显示
- 简化访问逻辑
- 提高加载速度

### Q3: 如何确保安全性？
A: 即使设置为公共读，也可以通过以下方式保证安全：
- 使用随机文件名
- 限制文件类型和大小
- 定期清理无用文件

### Q4: 签名 URL 的有效期如何设置？
A: 建议设置为 1-24 小时，具体根据业务需求：
- 头像显示：1-24 小时
- 临时文件：1-2 小时
- 重要文件：更短时间

## 最佳实践

### 1. 存储桶配置
- 头像存储桶：公共读
- 敏感文件存储桶：私有 + 签名 URL

### 2. 文件命名
- 使用时间戳和随机字符串
- 避免可预测的文件名

### 3. 权限管理
- 使用 RAM 用户而不是主账号
- 遵循最小权限原则
- 定期审查权限

### 4. 监控和日志
- 启用 OSS 访问日志
- 监控异常访问
- 定期检查文件使用情况

## 联系支持

如果问题仍然存在，请：
1. 检查阿里云 OSS 文档
2. 查看错误代码对应的解决方案
3. 联系阿里云技术支持 