# AGENT.md

本指南面向在当前仓库中工作的代理式编码助手。所有回复优先使用中文。

## 项目概览

当前仓库包含两个实际项目：

- 根目录：Next.js 16 Web 应用，使用 React 19、TypeScript、Tailwind CSS、Prisma、NextAuth、shadcn/ui 风格组件。
- `mini-app-ui/`：UniApp 小程序壳子，使用 Vue 3、TypeScript、Vite、UnoCSS、Pinia、wot-design-uni。

注意：根目录就是 Web 项目，不存在 `web/` 子目录；小程序目录名是 `mini-app-ui/`，不是 `miniapp-ui/`。

## 主要目录

- `app/`：Next.js App Router 页面、布局和 API routes。
- `components/`：Web 组件，`components/ui/` 为基础 UI 组件，`components/admin/` 为后台管理组件。
- `lib/`：服务端工具、认证、配置、OSS、邮件、短信、Prisma 客户端和 Zustand store。
- `hooks/`：Web 侧 React hooks。
- `prisma/`：Prisma schema、迁移、seed、数据库注释 SQL。
- `scripts/`：初始化菜单、角色、配置、数据库同步/备份等脚本。
- `mini-app-ui/src/`：小程序源码，包含页面、请求层、store、tabbar、静态资源和业务组件。
- `md/`、`docs/`：项目说明文档。

## 包管理器

根目录当前同时存在 `package-lock.json` 和 `pnpm-lock.yaml`，但 README 使用 npm 命令。根目录优先使用 npm，除非用户明确要求切换。

`mini-app-ui/` 声明了 `packageManager: pnpm@10.10.0`，且有 `preinstall` 限制，必须使用 pnpm。

## 常用命令

### 根目录 Web 应用

在仓库根目录运行：

```bash
npm install
cp .env.example .env
npx prisma generate
npm run dev
npm run build
npm run start
npm run lint
npm run lint:fix
```

说明：

- `npm run dev` 会读取 `.env` 并使用 `next dev --webpack`。
- `npm run dev:turbo` 可使用 Turbopack。
- `npm run build` 构建 standalone 输出，并复制 `public/` 和 `.next/static/`。
- `npm run start` 运行 `.next/standalone/server.js`，需要先构建。

### 小程序项目

进入 `mini-app-ui/` 后运行：

```bash
pnpm install
pnpm dev
pnpm dev:h5
pnpm dev:mp
pnpm build
pnpm build:mp
pnpm type-check
pnpm lint
pnpm lint:fix
```

说明：

- `pnpm dev` / `pnpm dev:h5` 启动 H5。
- `pnpm dev:mp` / `pnpm dev:mp-weixin` 生成微信小程序开发产物。
- 微信开发者工具导入 `mini-app-ui/dist/dev/mp-weixin`。
- `pnpm build:mp` / `pnpm build:mp-weixin` 输出微信小程序生产产物。

## 数据库与初始化

数据库使用 PostgreSQL，连接串来自根目录 `.env` 的 `DATABASE_URL`。

常用命令：

```bash
npx prisma generate
npx prisma db push
npx prisma migrate dev
npx prisma studio
npx tsx prisma/seed.ts
npx tsx scripts/init-config-categories.ts
npx tsx scripts/init-configs.ts
npx tsx scripts/init-menus.ts
npx tsx scripts/init-roles.ts
npx tsx scripts/assign-menus-to-roles.ts
npx tsx scripts/add-comments.ts
```

数据库变更要求：

- 修改模型时优先更新 `prisma/schema.prisma`。
- 表和字段需要保留中文说明，Prisma schema 中使用 `///` 文档注释。
- 若数据库注释 SQL 需要同步，更新 `prisma/add-comments.sql`，再运行 `npx tsx scripts/add-comments.ts`。
- 开发环境可用 `npx prisma db push` 快速同步；需要迁移记录时使用 `npx prisma migrate dev`。
- 不要提交 `pgsql-bak/`、`prisma/export.sql` 或任何真实数据库导出。

## 代码风格

- TypeScript 开启 strict mode。
- 缩进使用 2 个空格。
- 默认 UTF-8、LF 换行、文件末尾保留换行。
- 保持现有 Prettier、ESLint、Tailwind 写法，不引入新的格式化风格。
- 新增公共逻辑优先放入现有 `lib/`、`hooks/`、`components/` 分类，不随意创建平行体系。

## Web 开发约定

- 使用 Next.js App Router，页面和 API routes 放在 `app/`。
- 默认使用 Server Components；需要浏览器状态、事件或 hooks 时再添加 `"use client"`。
- 使用 `@/*` 从仓库根目录导入，例如 `@/components/ui/button`、`@/lib/prisma`。
- UI 优先复用 `components/ui/` 和已有后台组件。
- 组合 Tailwind class 时使用 `cn()`。
- API route 需要做输入校验和权限/会话检查，错误响应保持结构化。
- Prisma Client 统一从 `@/lib/prisma` 导入。
- 认证相关逻辑优先查看根目录 `auth.ts`、`lib/auth.ts` 和 `app/api/auth/`。

## 小程序开发约定

- 小程序代码只在 `mini-app-ui/` 内修改。
- 使用 Vue 3 Composition API 和 `<script lang="ts" setup>`。
- 使用 `@/*` 从 `mini-app-ui/src/` 导入，使用 `@img/*` 引用 `src/static/`。
- 请求层优先复用 `src/http/`、`src/hooks/useRequest.ts` 和 `src/api/` 现有模式。
- 状态管理使用 Pinia，优先放在 `src/store/`。
- 页面放在 `src/pages/` 或现有 `src/pages-fg/`，并保持 `pages.config.ts` / 自动路由配置同步。
- 平台差异使用 UniApp 条件编译，例如 `#ifdef MP-WEIXIN`。
- 自定义 tabbar 页面根容器统一加全局类 `app-tabbar-page`，该类使用 `mini-app-ui/src/style/index.scss` 中的 `--app-tabbar-total-height` 计算高度；tabbar 页面不要直接写 `min-height: 100vh` 或硬编码 `calc(100vh - 50px)`，避免 `KuRootView` 内容高度和 `FgTabbar` 文档流占位叠加后产生空白滚动。非 tabbar 页面不要扣 tabbar 高度。

## 文件与安全边界

- 不要提交 `.env`、`.env.*`、证书、私钥、数据库备份、构建产物和依赖目录。
- `.env.example` 可以提交，但只能包含占位值或本地示例值。
- `node_modules/`、`.next/`、`dist/`、`build/`、`pgsql-bak/`、`data/certs/` 应保持未跟踪。
- 涉及 OSS、短信、邮件、微信支付、数据库连接等配置时，不要在代码或文档中写入真实密钥。

## 验证建议

根据改动范围运行最小必要验证：

- Web 代码改动：`npm run lint`；涉及构建/路由/服务端改动时加 `npm run build`。
- Prisma schema 改动：`npx prisma generate`，必要时运行 `npx prisma migrate dev` 或 `npx prisma db push`。
- 小程序改动：在 `mini-app-ui/` 下运行 `pnpm lint` 和 `pnpm type-check`；涉及产物时运行对应 `pnpm build:*`。

当前未配置独立测试框架；新增测试框架后在此补充单测命令。

## Git 工作流

- 修改前先检查 `git status --short`，保护用户未提交改动。
- 提交和推送只在用户明确要求时执行。
- 不要将本地环境文件、备份文件或生成产物加入 Git。
- 若需要改 `.gitignore`，保持规则贴合当前项目，不要误忽略源码、迁移或示例配置。
