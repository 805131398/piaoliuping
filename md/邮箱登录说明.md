# 邮箱验证码登录功能

本项目已集成邮箱验证码登录功能，支持与 GitHub、Google 登录的账号合并。

## 功能特性

- ✅ 邮箱验证码登录（6位数字验证码）
- ✅ 验证码5分钟有效期
- ✅ 与 GitHub、Google 登录账号合并（基于邮箱）
- ✅ 美观的登录界面
- ✅ 防重复发送验证码

## 环境变量配置

在 `.env.local` 文件中添加以下配置：

```bash
# 邮件服务配置
SMTP_HOST="smtp.gmail.com"  # 邮件服务器地址
SMTP_PORT="587"             # 邮件服务器端口
SMTP_USER="your-email@gmail.com"  # 发件人邮箱
SMTP_PASS="your-app-password"     # 邮箱授权码
```

### 常用邮件服务配置

#### Gmail
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"  # 需要在 Gmail 设置中生成应用专用密码
```

#### QQ 邮箱
```bash
SMTP_HOST="smtp.qq.com"
SMTP_PORT="587"
SMTP_USER="your-email@qq.com"
SMTP_PASS="your-authorization-code"  # 需要在 QQ 邮箱设置中开启 SMTP 并获取授权码
```

#### 163 邮箱
```bash
SMTP_HOST="smtp.163.com"
SMTP_PORT="587"
SMTP_USER="your-email@163.com"
SMTP_PASS="your-authorization-code"  # 需要在 163 邮箱设置中开启 SMTP 并获取授权码
```

## 使用流程

1. 用户访问 `/login` 页面
2. 输入邮箱地址，点击"获取验证码"
3. 系统发送验证码到邮箱
4. 用户输入验证码，点击"登录"
5. 系统验证码校验，完成登录

## 账号合并逻辑

- 如果用户之前用 GitHub 登录过，且 GitHub 邮箱与当前输入的邮箱相同，则视为同一账号
- 如果用户之前用 Google 登录过，且 Google 邮箱与当前输入的邮箱相同，则视为同一账号
- 如果邮箱不存在，则创建新账号

## API 接口

### 发送验证码
- **路径**: `POST /api/auth/send-code`
- **参数**: `{ email: string }`
- **返回**: `{ message: string }` 或 `{ error: string }`

### 邮箱验证码登录
- **路径**: `POST /api/auth/callback/credentials`
- **参数**: `{ email: string, code: string }`
- **返回**: 登录成功或失败

## 数据库表

使用现有的 `VerificationToken` 表存储验证码：
- `identifier`: 邮箱地址
- `token`: 验证码
- `expires`: 过期时间

## 安全特性

- 验证码5分钟自动过期
- 验证码使用后立即删除
- 同一邮箱短时间内只能发送一个验证码
- 邮箱格式验证

## 故障排除

### 邮件发送失败
1. 检查 SMTP 配置是否正确
2. 确认邮箱授权码是否有效
3. 检查网络连接

### 验证码登录失败
1. 确认验证码是否正确
2. 检查验证码是否已过期
3. 查看服务器日志

## 开发说明

- 登录页面：`app/login/page.tsx`
- 发送验证码 API：`app/api/auth/send-code/route.ts`
- Auth.js 配置：`auth.ts`
- 数据库操作：使用 Prisma 