# luckcoder 项目

> 由张浩是坐着开发维护

## 项目简介

luckcoder 是一个基于 Next.js 15、TypeScript、Prisma、shadcn/ui、Radix UI 和 Tailwind CSS 构建的现代化 Web 应用项目，集成了多种认证方式（邮箱验证码、OAuth）、用户资料管理、头像上传、响应式导航菜单等功能，适合学习和二次开发。

---

## 技术栈

- **前端框架**：Next.js 15 (App Router)
- **语言**：TypeScript、React 19
- **UI 组件**：shadcn/ui、Radix UI、Tailwind CSS
- **认证系统**：Auth.js (NextAuth.js)
- **数据库**：PostgreSQL（推荐）、Prisma ORM
- **其它依赖**：@dicebear/collection（头像生成）、邮箱/SMS 验证、Lottie 动画等

---

## 目录结构

```text
nextjs-luckcoder/
├─ app/                # 页面与路由（App Router）
│    ├─ api/           # 后端 API 路由（认证、用户、上传等）
│    ├─ login/         # 登录页面
│    ├─ user/          # 用户中心、AIGC、资料、广场等
│    ├─ admin/         # 管理后台页面
│    ├─ globals.css    # 全局样式
│    └─ layout.tsx     # 全局布局
├─ components/         # UI 组件与自定义组件
│    ├─ avatar/        # 头像相关组件
│    ├─ ui/            # 基础 UI 组件（shadcn/ui）
│    └─ providers/     # 全局 Provider
├─ lib/                # 工具库、数据库、短信等
├─ prisma/             # 数据库 schema 与迁移
├─ public/             # 静态资源与上传目录
├─ types/              # 类型定义
├─ README.md           # 项目说明文档
└─ ...
```

---

## 主要功能

### 1. 现代认证系统
- 支持邮箱验证码登录（6位数字，5分钟有效）
- 支持 GitHub、Google 等 OAuth 登录
- 账号自动合并（同邮箱）
- 完善的会话管理与安全机制
- 认证 API 路由：`/api/auth/*`

### 2. 用户资料与头像上传
- 个人资料页支持昵称、头像、第三方账号等管理
- 头像上传支持 JPG/PNG/GIF，最大 5MB，实时预览
- 头像存储于 `public/uploads/avatars/`，唯一文件名防冲突
- 头像组件：`ProfileAvatar.tsx`、`UploadAvatarPanel.tsx` 等

### 3. 响应式导航菜单
- 基于 shadcn/ui 的现代导航菜单，支持下拉、图标、分组
- 完全响应式，键盘无障碍支持
- 组件位置：`components/ui/navigation-menu.tsx`、`app/user/layout/navBar.tsx`

### 4. AIGC 与内容创作
- 用户中心下集成 AIGC 聊天、创作、知识、图片、视频等模块
- 结构清晰，便于扩展

### 5. 其它功能
- 支持短信验证码（阿里云短信集成）
- 支持 Lottie 动画、全局消息提示（sonner）
- 代码风格统一，TypeScript 类型安全

---

## 数据库设计（Prisma）

- 用户表（User）：支持邮箱、手机号、头像、第三方账号等
- 账号表（Account）：OAuth 账号信息
- 会话表（Session）：登录会话管理
- 验证码表（VerificationToken）：邮箱验证码存储

详见 `prisma/schema.prisma`：

```prisma
model User {
  id            String   @id @default(cuid())
  name          String?
  email         String?  @unique
  phone         String?  @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  avatarType    String?
  avatarStyle   String?
  avatarSeed    String?
}
// ... 其它表结构略
```

---

## 快速开始

1. **安装依赖**
   ```bash
   npm install
   # 或 yarn install / pnpm install / bun install
   ```
2. **配置环境变量**
   - 复制 `.env.example` 为 `.env.local`，配置数据库、认证、邮箱、短信等参数
3. **数据库迁移**
   ```bash
   npx prisma migrate dev
   ```
4. **启动开发服务器**
   ```bash
   npm run dev
   # 或 yarn dev / pnpm dev / bun dev
   ```
5. 访问 [http://localhost:3000](http://localhost:3000)

---

## 认证与登录说明

- 邮箱验证码登录：详见 `EMAIL_LOGIN_README.md`
- 头像上传功能：详见 `AVATAR_UPLOAD_README.md`
- 导航菜单用法：详见 `NAVIGATION_MENU_README.md`
- 认证配置与 API：详见 `auth.ts`、`app/api/auth/*`

---

## 主要依赖

- next@15.x
- react@19.x
- next-auth@5.x
- @prisma/client & prisma
- tailwindcss@4.x
- shadcn/ui
- @dicebear/collection
- sonner
- 其它见 `package.json`

---

## 部署说明

- 推荐使用 [Vercel](https://vercel.com/) 一键部署
- 也可自建服务器，需配置好数据库与环境变量
- 生产环境建议使用 PostgreSQL

---

## 作者

张浩

---

## License

本项目仅供学习与交流，禁止商业用途。
