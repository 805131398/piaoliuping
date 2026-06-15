# AGENTS.md

本指南为在此 monorepo 中工作的代理式编码助手提供必要信息。

## 项目结构

这是一个包含两个项目的 monorepo：

- `web/` - Next.js 16 Web 应用（React 19、TypeScript、Tailwind CSS、Prisma、NextAuth）
- `miniapp-ui/` - UniApp 跨平台小程序（Vue 3、TypeScript、Vite、UnoCSS、wot-design-uni）

---

## 构建、Lint 和测试命令

### Web 项目（Next.js）

运行命令前先进入 web 目录：

```bash
cd web
```

**开发：**
- `pnpm dev` - 使用 Turbopack 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm start` - 启动生产服务器

**代码质量：**
- `pnpm lint` - 运行 ESLint

**数据库（Prisma）：**
- `pnpm db:generate` - 根据 schema 生成 Prisma Client
- `pnpm db:push` - 将 schema 变更推送到数据库
- `pnpm db:migrate` - 运行数据库迁移
- `pnpm db:studio` - 打开 Prisma Studio 图形界面
- `pnpm db:seed` - 使用初始数据填充数据库

**单项测试：**
当前未配置测试框架。实现后在此补充测试命令。

### Miniapp-UI 项目（UniApp）

运行命令前先进入 miniapp 目录：

```bash
cd miniapp-ui
```

**开发：**
- `pnpm dev` - 运行 H5 开发服务器（打开在 http://localhost:9000）
- `pnpm dev:h5` - 运行 H5（与 dev 相同）
- `pnpm dev:mp` - 运行微信小程序（在微信开发者工具中导入 `dist/dev/mp-weixin`）
- `pnpm dev:app` - 运行原生 App（需要 HBuilderX）

**构建：**
- `pnpm build` - 构建 H5 生产版本
- `pnpm build:mp` - 构建微信小程序（输出到 `dist/build/mp-weixin`）
- `pnpm build:app` - 构建原生 App

**代码质量：**
- `pnpm type-check` - 运行 TypeScript 类型检查（vue-tsc）
- `pnpm lint` - 运行 ESLint
- `pnpm lint:fix` - 运行 ESLint 并自动修复

**单项测试：**
当前未配置测试框架。实现后在此补充测试命令。

---

## 代码风格指南

### 格式

**缩进：** 2 个空格（禁止使用 tab）

**换行符：** LF（Unix 风格）

**行尾空白：** 始终删除

**文件末尾换行：** 始终保留

**文件编码：** UTF-8

### 导入

**Web（Next.js）：**
- 使用 `@/*` 从 src 进行绝对导入（例如 `@/components/ui/button`）
- React 导入方式：`import * as React from "react"`
- 组件使用命名导出
- 导入分组：1）React/外部库，2）内部组件，3）hooks/工具，4）类型

**Miniapp（UniApp）：**
- 使用 `@/*` 从 src 进行绝对导入（例如 `@/http/http`）
- 在 Vue 组件中使用 `<script lang="ts" setup>` 语法
- 从 `vue`、`@dcloudio/uni-app` 导入 UniApp API
- 顺序：1）Vue 导入，2）uni-app API，3）内部模块，4）组件

### 类型

- 使用 TypeScript strict mode
- 使用数据结构前先定义 interface
- 为所有函数参数和返回值添加类型
- API 响应使用泛型：`http.get<User[]>('/api/users')`
- 联合类型和别名使用 `type`，对象结构使用 `interface`
- 适当利用类型推断（例如 `const [state, setState] = useState<string>("")`）

### 命名规范

**组件：** PascalCase（例如 `UserAvatar`、`AdminHeader`）

**函数/变量：** camelCase（例如 `getUserStats`、`handleLocationClick`）

**常量：** UPPER_SNAKE_CASE（例如 `API_BASE_URL`、`MAX_RETRY`）

**文件/目录：** kebab-case（例如 `user-avatar.tsx`、`clocking/index.vue`）

**类型：** PascalCase，并带描述性后缀（例如 `UserStats`、`BonusPool`、`ApiResponse`）

**事件处理函数：** 以 `handle` 为前缀（例如 `handleSubmit`、`handleLocationClick`）

**布尔变量：** 以 `is/has/can` 为前缀（例如 `isLoading`、`hasLogin`、`canEdit`）

### 错误处理

**Web：**
- 所有异步操作使用 try-catch
- 使用 `console.error()` 记录错误
- 通过 toast/notification 展示用户友好的错误信息
- API 路由返回合适的错误响应
- 使用 Zod 进行运行时校验

**Miniapp：**
- 使用 try-catch 包裹异步函数
- 使用 `uni.showToast({ icon: 'none', title: 'error message' })` 展示错误
- 记录错误：`console.error('操作失败:', error)`
- 在 HTTP 拦截器中处理 token 过期（401 处理）
- 使用 modal 处理确认对话框

**API Client（两个项目）：**
- HTTP 方法：`http.get()`、`http.post()`、`http.put()`、`http.delete()`
- 查询参数：第二个参数（可选对象）
- 请求体：POST/PUT 中的数据对象
- 请求头：可选对象，用于自定义 headers
- 示例：`http.get<User[]>('/api/users', { page: 1 })`
- 示例：`http.post<User>('/api/users', { name: 'John' })`

### 组件模式

**Web（Next.js）：**
- 默认使用 Server Components（不添加 "use client" 指令）
- Client Components：在文件顶部添加 `"use client";`
- 使用 `@/components/ui/` 中的 shadcn/ui 组件
- 使用 `cn()` 工具组合 Tailwind 类：`className={cn("base-classes", variant)}`

**Miniapp（UniApp）：**
- 使用 Composition API 和 `<script lang="ts" setup>`
- 使用 `defineOptions({ name: 'ComponentName' })` 定义组件选项
- 使用 `definePage({ style: { ... } })` 定义页面配置
- 使用 UniApp 生命周期：`onLoad()`、`onShow()`、`onMounted()`
- 使用 ref/reactive 管理状态：`const count = ref(0)`
- 使用 computed：`const doubled = computed(() => count.value * 2)`

### 状态管理

**Web：** 使用 Zustand stores
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}))
```

**Miniapp：** 使用 Pinia stores
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isLoggedIn = computed(() => !!user.value)
  return { user, isLoggedIn }
})
```

### 身份认证

**Web：** NextAuth v5（beta）
```typescript
import { useSession, signOut } from 'next-auth/react'
const { data: session } = useSession()
await signOut({ callbackUrl: '/login' })
```

**Miniapp：** 带刷新逻辑的 Token store
```typescript
import { useTokenStore } from '@/store/token'
const tokenStore = useTokenStore()
await tokenStore.wxLogin() // 微信登录
tokenStore.logout() // 清除 token
```

### 路由

**Web：** Next.js App Router
- 页面位于 `app/` 目录（例如 `app/dashboard/page.tsx`）
- 动态路由：`app/users/[id]/page.tsx`
- 使用 `<Link href="/path">` 进行导航
- 使用 `router.push('/path')` 进行编程式导航

**Miniapp：** UniApp 约定式路由
- 页面位于 `src/pages/` 目录
- 使用 `uni.navigateTo({ url: '/pages/clocking/index' })`
- 对 tab 页面使用 `uni.switchTab({ url: '/pages/index/index' })`

### 平台特定代码（Miniapp）

使用条件编译编写平台特定代码：

```vue
<!-- #ifdef MP-WEIXIN -->
<view>仅微信小程序</view>
<!-- #endif -->

<!-- #ifndef MP-WEIXIN -->
<view>非微信平台</view>
<!-- #endif -->
```

### 数据库（Web）

- Schema 定义在 `prisma/schema.prisma`
- 使用 Prisma Client：`import { prisma } from '@/lib/prisma'`
- 事务：`await prisma.$transaction([...])`
- 迁移：Schema 变更需要执行 `pnpm db:migrate`
- 数据库注释：所有 PostgreSQL 表和字段都必须有中文注释；schema 变更后，更新 `nextjs/src/lib/db-comments.ts` 并运行 `pnpm db:comments`

### 样式

**Web：** Tailwind CSS
- 工具类优先
- 使用语义化 variants：`bg-primary`、`text-muted-foreground`
- 响应式：`md:flex`、`lg:px-8`

**Miniapp：** UnoCSS + SCSS
- 使用 UnoCSS 工具类：`text-lg`、`ml-2`
- 复杂样式使用 scoped SCSS：`<style lang="scss" scoped>`
- 使用 rpx 作为响应式单位（在 750px 宽度下 1rpx = 0.5px）

---

## 使用此代码库

1. **运行命令前进入正确目录：**
   - `cd web` 用于 Next.js 应用
   - `cd miniapp-ui` 用于 UniApp

2. **添加新功能时遵循现有模式：**
   - 参考相似组件复制结构
   - 使用已建立的 HTTP client 模式
   - 匹配同一项目中的命名规范

3. **提交前运行 lint：**
   - Web：`cd web && pnpm lint`
   - Miniapp：`cd miniapp-ui && pnpm lint && pnpm type-check`

4. **数据库变更（仅 web）：**
   - 修改 `prisma/schema.prisma`
   - 保持 PostgreSQL 表注释和字段注释与 `nextjs/src/lib/db-comments.ts` 同步
   - 开发环境运行 `pnpm db:push`
   - 每次 schema 或字段变更后运行 `pnpm db:comments`
   - 生产迁移运行 `pnpm db:migrate`

5. **平台兼容性（仅 miniapp）：**
   - 使用条件编译处理平台特定功能
   - 同时测试 H5 和微信小程序平台

6. **语言要求：**
   - 所有回复必须使用中文

7. **代码变更工作流：**
   - 进行任何代码变更前，先创建 git commit 保存当前状态
   - 这可以防止开发过程中代码丢失
   - 使用描述性 commit message 说明即将开展的工作
