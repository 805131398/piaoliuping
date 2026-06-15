# 后台管理系统

## 快速导航

### 访问地址
- 仪表盘: `/admin`
- 用户管理: `/admin/users`
- 角色管理: `/admin/roles`
- 菜单管理: `/admin/menus`
- 配置管理: `/admin/configs`
- 文件管理: `/admin/files`

### 页面说明

| 页面 | 文件 | 功能 |
|------|------|------|
| 仪表盘 | `page.tsx` | 系统概览和统计 |
| 用户管理 | `users/page.tsx` | 用户CRUD操作 |
| 角色管理 | `roles/page.tsx` | 角色和权限管理 |
| 菜单管理 | `menus/page.tsx` | 后台菜单配置 |
| 配置管理 | `configs/page.tsx` | 系统参数设置 |
| 文件管理 | `files/page.tsx` | OSS文件管理 |

### 布局组件
- `layout.tsx` - Admin主布局
- `components/admin/AdminSidebar.tsx` - 侧边栏
- `components/admin/AdminHeader.tsx` - 顶部导航

### 类型定义
- `types/admin.ts` - 所有Admin相关类型

## 开发指南

### 添加新页面

1. 在 `app/admin/` 下创建新目录
2. 添加 `page.tsx` 文件
3. 在 `AdminSidebar.tsx` 中添加菜单项

### 修改侧边栏菜单

编辑 `components/admin/AdminSidebar.tsx` 中的 `menuItems` 数组：

```typescript
const menuItems: MenuItem[] = [
  {
    id: "new-menu",
    label: "新菜单",
    icon: YourIcon,
    href: "/admin/new-page",
  },
];
```

### 添加权限控制

在 `layout.tsx` 中添加权限检查逻辑：

```typescript
// 检查用户是否有admin权限
if (!session.user.isAdmin) {
  redirect("/");
}
```

## 完整文档

查看详细文档：
- [系统文档](../../docs/admin-system.md)
- [快速开始](../../docs/admin-quick-start.md)
- [实现总结](../../docs/ADMIN_SUMMARY.md)

## 技术栈

- Next.js 15 (App Router)
- TypeScript
- shadcn/ui
- TailwindCSS
- NextAuth.js
- Lucide Icons
