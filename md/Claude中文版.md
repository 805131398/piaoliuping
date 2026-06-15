# CLAUDE.cn.md

此文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 开发命令

### 核心命令
```bash
# 开发服务器（禁用 TLS 并启用 Turbopack）
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

### 数据库命令
```bash
# 运行数据库迁移
npx prisma migrate dev

# 生成 Prisma 客户端
npx prisma generate

# 重置数据库
npx prisma migrate reset

# 在浏览器中查看数据库
npx prisma studio
```

## 架构概览

### 技术栈
- **Next.js 15** 使用 App Router 架构
- **React 19** 优先使用服务器组件 (RSC)
- **TypeScript** 严格类型安全
- **Prisma ORM** 配合 PostgreSQL
- **NextAuth.js v5** 认证系统
- **shadcn/ui + Radix UI** 组件库配合 Tailwind CSS
- **Zustand** 客户端状态管理

### 认证系统
应用在 `auth.ts` 中实现了多提供商认证系统：

**认证提供商：**
- **GitHub & Google OAuth** - 标准社交登录
- **邮箱验证码** - 6位数字验证码，5分钟有效期
- **手机验证码** - 基于阿里云短信的认证

**核心功能：**
- 基于邮箱地址的账号合并
- 自动用户创建和默认头像分配
- JWT 会话策略配合数据库同步
- 自定义登录页面 `/login`

**数据库设计：**
- `User` - 核心用户信息，包含头像字段（`avatarType`、`avatarStyle`、`avatarSeed`）
- `Account` - OAuth 和凭据提供商关联
- `Session` - JWT 会话管理
- `VerificationToken` - 邮箱/手机验证的临时验证码

### 文件上传与存储
**OSS 集成** (`lib/oss.ts`)：
- 阿里云 OSS 封装类 `AliyunOssClient`
- 支持服务端直传和前端策略生成
- 通过 `/api/profile/avatar` 用于头像上传

**本地存储：**
- 头像文件存储在 `public/uploads/avatars/`，使用 UUID 命名
- 文件验证：JPG/PNG/GIF，最大 5MB

### 状态管理架构
**服务端状态：**
- NextAuth 会话处理
- Prisma 数据库操作
- RSC 数据获取

**客户端状态：**
- **用户档案存储** (`lib/store/profile-store.ts`) - Zustand 存储用于用户档案缓存
- 遵循 Next.js 15 最佳实践的最小客户端状态
- 使用 `useActionState` 替代已弃用的 `useFormState`

### 组件架构
**布局结构：**
- 根布局 `app/layout.tsx` 包含 `AuthProvider`
- 用户区域布局 `app/user/layout.tsx` 包含导航
- 响应式导航组件在 `app/user/layout/`

**核心组件：**
- **头像系统** - `ProfileAvatar.tsx`、`AvatarDialog.tsx`、`DiceBearAvatarPanel.tsx`
- **导航系统** - `navBar.tsx`、`user-menu.tsx`、`mobile-menu.tsx`
- **UI 组件** - `components/ui/` 中的 shadcn/ui 组件

### API 路由结构
```
app/api/
├── auth/
│   ├── [...nextauth]/route.ts    # NextAuth 处理器
│   └── send-code/route.ts        # 邮箱验证码
├── profile/
│   ├── route.ts                  # 用户档案 CRUD
│   ├── avatar/route.ts           # 头像上传
│   └── sync/route.ts             # 档案同步
└── oss/
    ├── policy/route.ts           # OSS 上传策略
    └── sign-url/route.ts         # OSS 签名 URL
```

### 路由与中间件
**中间件** (`middleware.ts`)：
- 将根路径 `/` 重写到 `/user`
- 将 `/aigc` 重写到 `/user/aigc`

**受保护路由：**
- 所有 `/user/*` 页面需要认证
- `/admin` 管理员功能区域
- `/login` 页面处理所有认证流程

## 开发指南

### 代码风格（来自 .cursor/rules/）
- **React 组件**：优先使用 RSC，最小化 'use client' 指令
- **TypeScript**：使用 interfaces 而非 types，避免枚举，使用 const 映射
- **命名规范**：使用描述性名称配合辅助动词（isLoading、hasError）
- **函数**：事件处理器以 "handle" 开头，目录使用小写连字符
- **状态管理**：表单使用 `useActionState`，需要时使用 nuqs 实现 URL 状态

### 整洁代码原则
- 单一职责函数
- 解释目的的有意义命名
- 注释解释"为什么"而非"是什么"
- DRY 原则配合适当抽象
- 使用早期返回提高可读性

### Next.js 15 模式
- 始终使用运行时 API 的异步版本：
  ```typescript
  const cookieStore = await cookies()
  const headersList = await headers()
  const params = await props.params
  ```
- 组件结构：导出、子组件、辅助函数、类型
- 针对 Web Vitals 和性能进行优化

### 环境配置
必需的环境变量：
```bash
# 数据库
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# OAuth 提供商
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# 邮件服务 (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# 阿里云（可选）
ALIBABA_CLOUD_ACCESS_KEY_ID="..."
ALIBABA_CLOUD_ACCESS_KEY_SECRET="..."
ALI_OSS_REGION="..."
ALI_OSS_BUCKET="..."
```

## 核心功能实现

### AIGC 模块
位于 `app/user/aigc/`，包含子模块：
- 聊天界面（`chat/page.tsx`）
- AI 智能体（`agent/page.tsx`）
- 创作工具（`creative/page.tsx`）
- 知识库（`knowledge/page.tsx`）
- 图像生成（`image/page.tsx`）
- 视频处理（`video/page.tsx`）

### 用户档案管理
- 头像上传与实时预览
- DiceBear 头像生成，可自定义风格
- 跨提供商档案同步
- 提供商徽章显示系统

### 导航系统
- 使用 shadcn/ui 组件的响应式导航
- 移动优先设计配合可折叠菜单
- 根据认证状态的上下文感知用户菜单

## 测试与质量保证

### ESLint 配置
- 宽松规则（警告 > 错误）提高开发效率
- TypeScript 特定规则确保类型安全
- API 路由和测试文件有专门的规则集
- API 路由和测试目录允许控制台日志