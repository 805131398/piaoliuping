# Language Learning

`language-learning` 是一个面向“语言学习”项目的基础工程，当前保留了认证、用户中心、角色权限、菜单管理、系统配置、文件上传、微信登录与小程序壳子等通用能力，历史打卡业务已从当前工程中剥离。

## 包含能力

- Web 管理后台：用户、角色、菜单、配置、文件管理
- 用户中心：资料维护、头像上传、基础账户能力
- 数据层：Prisma + PostgreSQL
- 对象存储：阿里云 OSS
- 通知能力：邮件、短信
- 小程序壳子：登录、首页、我的页、通用请求层
- 预留字段与底层能力：用户积分、VIP 字段、微信支付入口

## 快速开始

```bash
npm install
cp .env.example .env
npx prisma generate
npm run build
```

启动 Web：

```bash
npm run dev
```

启动小程序壳子：

```bash
cd mini-app-ui
pnpm install
pnpm dev:mp
```

## 初始化建议

数据库准备好后，建议至少执行一次：

```bash
npx tsx prisma/seed.ts
npx tsx scripts/init-menus.ts
npx tsx scripts/init-roles.ts
npx tsx scripts/assign-menus-to-roles.ts
```

如果数据库中还残留旧业务菜单，可额外执行：

```bash
npx tsx scripts/cleanup-legacy-menus.ts
```

## 文档

- [2026-04-24-文档索引.md](/Users/zhanghao/SoftwareDevelopmentWork/clocking-remove-clocking-business/docs/项目资料/2026-04-24-文档索引.md)
- [2026-04-24-项目概览.md](/Users/zhanghao/SoftwareDevelopmentWork/clocking-remove-clocking-business/docs/项目资料/2026-04-24-项目概览.md)
- [2026-04-24-项目进度.md](/Users/zhanghao/SoftwareDevelopmentWork/clocking-remove-clocking-business/docs/项目资料/2026-04-24-项目进度.md)
