# 阿里云 OSS 配置说明

## 环境变量配置

在您的 `.env.local` 文件中添加以下配置：

```bash
# 阿里云 OSS 配置
OSS_REGION=oss-cn-hangzhou  # 替换为您的 OSS 区域
OSS_BUCKET=your-bucket-name  # 替换为您的存储桶名称
OSS_ACCESS_KEY_ID=your-access-key-id  # 替换为您的 AccessKey ID
OSS_ACCESS_KEY_SECRET=your-access-key-secret  # 替换为您的 AccessKey Secret
OSS_HOST=https://your-bucket-name.oss-cn-hangzhou.aliyuncs.com  # 替换为您的 OSS 访问域名
```

## 配置说明

1. **OSS_REGION**: OSS 存储桶所在的地域，如 `oss-cn-hangzhou`、`oss-cn-beijing` 等
2. **OSS_BUCKET**: OSS 存储桶名称
3. **OSS_ACCESS_KEY_ID**: 阿里云账号的 AccessKey ID
4. **OSS_ACCESS_KEY_SECRET**: 阿里云账号的 AccessKey Secret
5. **OSS_HOST**: OSS 存储桶的访问域名，格式为 `https://bucket-name.region.aliyuncs.com`

## 安全建议

1. 建议使用 RAM 用户的 AccessKey，而不是主账号的 AccessKey
2. 为 RAM 用户分配最小权限原则，只授予 OSS 上传权限
3. 定期轮换 AccessKey
4. 在生产环境中使用环境变量或密钥管理服务存储敏感信息

## 权限配置

为 RAM 用户配置以下权限：

```json
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "oss:PutObject",
        "oss:GetObject"
      ],
      "Resource": [
        "acs:oss:*:*:your-bucket-name/uploads/avatars/*"
      ]
    }
  ]
}
```

## 测试配置

配置完成后，可以通过以下方式测试：

1. 访问 `/test/oss` 页面测试 OSS 连接
2. 在用户资料页面尝试上传头像
3. 检查控制台日志确认上传成功 