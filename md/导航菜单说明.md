# shadcn/ui 导航菜单组件使用指南

## 概述

本项目已成功集成了 [shadcn/ui](https://ui.shadcn.com/docs/components/navigation-menu) 的导航菜单组件，提供了现代化、响应式和无障碍的导航体验。

## 已安装的组件

### 1. 导航菜单组件
- **文件位置**: `components/ui/navigation-menu.tsx`
- **功能**: 提供完整的导航菜单功能，包括下拉菜单、链接等

### 2. 更新的导航栏
- **文件位置**: `app/user/layout/navBar.tsx`
- **功能**: 使用新的导航菜单组件重新设计的导航栏

### 3. 演示组件
- **文件位置**: `components/navigation-menu-demo.tsx`
- **功能**: 展示导航菜单的各种用法和功能

### 4. 演示页面
- **文件位置**: `app/navigation-demo/page.tsx`
- **访问地址**: `/navigation-demo`
- **功能**: 完整的导航菜单使用示例和文档

## 主要特性

### ✅ 响应式设计
- 自动适应不同屏幕尺寸
- 移动设备友好的交互体验
- 流畅的布局切换

### ✅ 无障碍支持
- 完整的键盘导航支持
- 屏幕阅读器兼容
- ARIA 属性自动管理

### ✅ 现代化 UI
- 流畅的动画效果
- 支持浅色/深色主题
- 现代化的视觉设计

### ✅ 类型安全
- 完整的 TypeScript 支持
- 类型安全的组件 API
- 开发时错误检查

## 使用方法

### 基本用法

```tsx
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Link from "next/link"

export function BasicNavigation() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/" className={navigationMenuTriggerStyle()}>
              首页
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>功能</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4">
              <li>
                <NavigationMenuLink asChild>
                  <Link href="/feature1">功能一</Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link href="/feature2">功能二</Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
```

### 带图标的导航菜单

```tsx
import { HomeIcon, SparklesIcon } from "lucide-react"

export function IconNavigation() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/" className={navigationMenuTriggerStyle()}>
              <HomeIcon className="w-4 h-4 mr-2" />
              首页
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <SparklesIcon className="w-4 h-4 mr-2" />
            AI 功能
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            {/* 下拉内容 */}
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
```

### 复杂下拉菜单

```tsx
const features = [
  {
    title: "AI 创作",
    href: "/ai-creation",
    description: "使用人工智能进行内容创作",
    icon: SparklesIcon,
  },
  // ... 更多功能
]

export function ComplexNavigation() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>功能特性</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
              {features.map((feature) => (
                <ListItem
                  key={feature.title}
                  title={feature.title}
                  href={feature.href}
                  icon={feature.icon}
                >
                  {feature.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function ListItem({ title, children, href, icon: Icon }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="flex items-center">
            {Icon && <Icon className="w-4 h-4 mr-2" />}
            <div>
              <div className="text-sm font-medium">{title}</div>
              <p className="text-sm text-muted-foreground">{children}</p>
            </div>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}
```

## 组件 API

### NavigationMenu
主要的导航菜单容器组件。

**Props:**
- `className`: 自定义 CSS 类名
- `children`: 子组件
- `viewport`: 是否显示视口（默认: true）

### NavigationMenuList
包含所有导航菜单项的列表容器。

**Props:**
- `className`: 自定义 CSS 类名
- `children`: 子组件

### NavigationMenuItem
单个导航菜单项。

**Props:**
- `className`: 自定义 CSS 类名
- `children`: 子组件

### NavigationMenuTrigger
触发下拉菜单的按钮。

**Props:**
- `className`: 自定义 CSS 类名
- `children`: 子组件

### NavigationMenuContent
下拉菜单的内容区域。

**Props:**
- `className`: 自定义 CSS 类名
- `children`: 子组件

### NavigationMenuLink
导航链接组件。

**Props:**
- `className`: 自定义 CSS 类名
- `asChild`: 是否作为子组件渲染
- `children`: 子组件

### navigationMenuTriggerStyle
导航菜单触发器的样式函数。

## 样式定制

### 自定义主题颜色

```css
/* 在 globals.css 中 */
:root {
  --navigation-menu-background: hsl(0 0% 100%);
  --navigation-menu-foreground: hsl(222.2 84% 4.9%);
  --navigation-menu-accent: hsl(210 40% 96%);
  --navigation-menu-accent-foreground: hsl(222.2 84% 4.9%);
}

.dark {
  --navigation-menu-background: hsl(222.2 84% 4.9%);
  --navigation-menu-foreground: hsl(210 40% 98%);
  --navigation-menu-accent: hsl(217.2 32.6% 17.5%);
  --navigation-menu-accent-foreground: hsl(210 40% 98%);
}
```

### 自定义动画

```css
/* 自定义进入/退出动画 */
.navigation-menu-content {
  animation-duration: 200ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

.navigation-menu-content[data-state="open"] {
  animation-name: slideDownAndFade;
}

.navigation-menu-content[data-state="closed"] {
  animation-name: slideUpAndFade;
}
```

## 最佳实践

### 1. 性能优化
- 使用 `React.memo` 包装自定义组件
- 避免在渲染函数中创建新对象
- 合理使用 `useMemo` 和 `useCallback`

### 2. 无障碍性
- 确保所有链接都有有意义的文本
- 使用适当的 ARIA 标签
- 测试键盘导航功能

### 3. 响应式设计
- 在移动设备上测试下拉菜单
- 确保触摸目标足够大
- 考虑在小屏幕上的布局调整

### 4. 用户体验
- 提供清晰的视觉反馈
- 使用一致的图标和样式
- 保持导航结构简单明了

## 故障排除

### 常见问题

1. **下拉菜单不显示**
   - 检查 `NavigationMenuContent` 是否正确嵌套
   - 确保没有 CSS 冲突

2. **样式不正确**
   - 检查 Tailwind CSS 是否正确配置
   - 确保 CSS 变量已定义

3. **TypeScript 错误**
   - 检查导入语句是否正确
   - 确保类型定义完整

### 调试技巧

1. 使用浏览器开发者工具检查 DOM 结构
2. 查看控制台是否有错误信息
3. 检查 CSS 类名是否正确应用

## 相关资源

- [shadcn/ui 官方文档](https://ui.shadcn.com/docs/components/navigation-menu)
- [Radix UI Navigation Menu](https://www.radix-ui.com/primitives/docs/components/navigation-menu)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

## 更新日志

- **v1.0.0**: 初始集成，包含基本导航菜单功能
- **v1.1.0**: 添加图标支持和复杂下拉菜单
- **v1.2.0**: 改进响应式设计和无障碍支持

---

如有问题或建议，请查看演示页面 `/navigation-demo` 或参考官方文档。 