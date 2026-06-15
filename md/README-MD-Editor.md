# Markdown 编辑器

一个功能强大的在线 Markdown 编辑器，支持 Git 集成和全屏编辑体验。

## 主要功能

### 🎯 核心功能
- **实时预览**：编辑时实时查看渲染效果
- **语法高亮**：支持代码语法高亮显示
- **Git 集成**：直接编辑远程 Git 仓库文件
- **文件管理**：树形文件浏览器，支持创建、搜索文件
- **自动保存**：文件修改时自动暂存并提交

### 🖥️ 全屏布局
- **充分利用屏幕空间**：采用全屏高度布局，最大化编辑区域
- **可折叠侧边栏**：文件浏览器可以折叠，专注写作
- **可折叠Git面板**：Git操作面板可以隐藏，减少干扰
- **响应式设计**：适配各种屏幕尺寸
- **现代化UI**：毛玻璃效果，流畅动画过渡

### ⌨️ 快捷键支持
| 快捷键 | 功能 | 说明 |
|--------|------|------|
| `Ctrl+S` | 保存文件 | 快速保存当前文件 |
| `Ctrl+B` | 切换侧边栏 | 隐藏/显示文件浏览器 |
| `Ctrl+G` | 切换Git面板 | 隐藏/显示Git操作面板 |
| `F11` | 全屏模式 | 进入/退出全屏编辑 |

### 🔧 Git 功能
- **自动提交**：文件保存时自动暂存并提交
- **推送/拉取**：一键同步远程仓库
- **状态监控**：实时显示Git状态和分支信息
- **提交历史**：查看最后提交信息

## 技术栈

- **前端框架**：Next.js 15 + React 19
- **UI组件**：Shadcn UI + Radix UI
- **样式**：Tailwind CSS
- **编辑器**：@uiw/react-md-editor
- **状态管理**：Zustand
- **数据库**：Prisma + SQLite

## 项目结构

```
app/md-editor/
├── page.tsx              # 主编辑器页面
├── demo/
│   └── page.tsx         # 演示页面
└── components/
    ├── FileExplorer.tsx  # 文件浏览器组件
    ├── GitManager.tsx    # Git操作组件
    └── RepositoryManager.tsx # 仓库管理组件
```

## 布局优化

### 全屏布局设计
- **顶部工具栏**：显示仓库信息、连接状态、操作按钮
- **左侧文件浏览器**：可折叠的树形文件浏览器
- **中央编辑区域**：全屏高度的Markdown编辑器
- **右侧Git面板**：可折叠的Git操作面板

### 响应式特性
- **桌面端**：三栏布局，充分利用宽屏空间
- **平板端**：自适应布局，智能隐藏次要面板
- **移动端**：单栏布局，优先显示编辑器

## 使用指南

### 1. 连接仓库
1. 访问 `/md-editor` 页面
2. 选择或添加 Git 仓库
3. 配置仓库认证信息（用户名和访问令牌）

### 2. 编辑文件
1. 在左侧文件浏览器中选择文件
2. 在中央编辑区域进行编辑
3. 使用 `Ctrl+S` 保存文件

### 3. Git 操作
1. 在右侧 Git 面板查看状态
2. 点击"推送"按钮同步到远程仓库
3. 点击"拉取"按钮获取最新更新

### 4. 布局调整
- 使用 `Ctrl+B` 切换文件浏览器
- 使用 `Ctrl+G` 切换Git面板
- 使用 `F11` 进入全屏模式

## 开发说明

### 环境要求
- Node.js 18+
- pnpm 8+

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm dev
```

### 构建生产版本
```bash
pnpm build
```

## 配置说明

### 环境变量
```env
# 数据库
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# 短信服务（可选）
SMS_ACCESS_KEY_ID="your-access-key"
SMS_ACCESS_KEY_SECRET="your-secret"
SMS_SIGN_NAME="your-sign-name"
SMS_TEMPLATE_CODE="your-template-code"
```

### 数据库迁移
```bash
# 生成迁移文件
pnpm prisma migrate dev

# 应用迁移
pnpm prisma migrate deploy
```

## 更新日志

### v2.0.0 (最新)
- ✨ 新增全屏布局设计
- ⌨️ 新增键盘快捷键支持
- 🎨 优化UI界面和交互体验
- 📱 改进响应式设计
- 🔧 优化Git操作流程

### v1.0.0
- 🎉 初始版本发布
- 📝 基础Markdown编辑功能
- 🔗 Git仓库集成
- 📁 文件管理功能

## 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发规范
- 使用 TypeScript 进行开发
- 遵循 ESLint 和 Prettier 规范
- 提交信息使用中文描述
- 新功能需要添加相应的测试

## 许可证

MIT License 