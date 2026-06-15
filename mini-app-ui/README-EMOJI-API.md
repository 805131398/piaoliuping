# 🎮 Emoji 游戏模式 - 接口对接说明

## 概述

Emoji 游戏模式已从硬编码数据切换为从后端 API 动态获取，实现了数据的集中管理。

---

## 📡 API 端点

### 获取 Emoji 集合数据

**接口**: `GET /api/game/emoji-sets`

**返回格式**:
```json
{
  "emojiSets": {
    "all": ["😀", "😃", ...],
    "animals": ["🐶", "🐱", ...],
    "food": ["🍎", "🍊", ...],
    "hearts": ["❤️", "🧡", ...],
    "nature": ["🌿", "☘️", ...],
    "sports": ["⚽", "🏀", ...],
    "travel": ["🚗", "🚕", ...],
    "objects": ["⌚", "📱", ...]
  },
  "emojiSetOptions": [
    {
      "id": "all",
      "name": "表情",
      "preview": ["😀", "😍", "🤩"]
    },
    ...
  ],
  "total": 320,
  "updatedAt": "2025-12-04T07:15:00.000Z"
}
```

---

## 🔧 前端实现

### 数据获取流程

1. **页面加载时**: `onLoad` 钩子调用 `fetchEmojiSets()`
2. **数据获取**: 发送请求到 API 端点
3. **数据更新**: 更新 `emojiSets` 和 `emojiSetOptions` 响应式数据
4. **UI 渲染**: Vue 自动重新渲染组件

### 关键代码

```typescript
// 响应式数据
const emojiSets = ref<Record<string, string[]>>({...})
const emojiSetOptions = ref<Array<{ id: string; name: string; preview: string[] }>>([])
const isLoadingEmojis = ref(false)

// 获取数据
const fetchEmojiSets = async () => {
  isLoadingEmojis.value = true
  try {
    const response = await uni.request({
      url: `${import.meta.env.VITE_API_BASE_URL}/api/game/emoji-sets`,
      method: 'GET',
    })
    
    if (response.statusCode === 200) {
      emojiSets.value = response.data.emojiSets
      emojiSetOptions.value = response.data.emojiSetOptions
    }
  } catch (error) {
    console.error('获取失败:', error)
  } finally {
    isLoadingEmojis.value = false
  }
}
```

---

## 🎯 功能特性

### ✅ 已实现

- **动态加载**: 从数据库动态获取最新 emoji 数据
- **加载状态**: 显示加载中提示，提升用户体验
- **错误处理**: 加载失败时显示提示消息
- **响应式更新**: 数据变化自动更新 UI
- **性能优化**: 使用 computed 计算当前集合

### 🎨 UI 改进

- 加载中显示脉动动画效果
- 设置面板实时展示最新的 emoji 选项
- 预览图标自动从实际数据中提取

---

## 🧪 测试步骤

### 1. 启动后端服务

```bash
cd /path/to/nextjs-base
npm run dev
```

确保服务运行在 `http://localhost:3000`

### 2. 测试 API

```bash
# 测试 API 是否正常返回
curl http://localhost:3000/api/game/emoji-sets
```

应返回包含 320 个 emoji 的 JSON 数据。

### 3. 配置小程序环境变量

确保 `mini-app-ui/.env` 中配置了正确的 API 地址：

```env
VITE_API_BASE_URL=http://localhost:3000
```

### 4. 启动小程序

```bash
cd mini-app-ui
pnpm dev:h5
```

### 5. 测试游戏功能

1. 进入 Emoji 游戏模式
2. 查看是否显示"加载中..."状态
3. 确认 emoji 正常显示在画面中
4. 打开设置面板，查看是否显示 8 个集合选项
5. 切换不同集合，验证 emoji 是否正确切换

---

## 🔍 调试技巧

### 查看 API 请求

在浏览器控制台查看网络请求：

```
Network → XHR → emoji-sets
```

### 查看数据状态

在 Vue DevTools 中检查组件状态：

```
emojiSets.value
emojiSetOptions.value
isLoadingEmojis.value
```

### 控制台日志

成功加载时会输出：
```
✅ Emoji 数据加载成功 320 个
```

---

## 🐛 常见问题

### Q1: 显示"加载失败，使用默认数据"

**原因**: 
- 后端服务未启动
- API 地址配置错误
- 数据库中没有 emoji 数据

**解决**:
```bash
# 1. 确认后端服务运行
npm run dev

# 2. 检查环境变量
echo $VITE_API_BASE_URL

# 3. 重新导入 emoji
npm run import:emoji
```

### Q2: 游戏中看不到 emoji

**原因**: 
- 当前选择的集合为空
- `currentEmojiSet` 计算错误

**解决**:
- 打开开发者工具查看 `emojiSets.value` 是否有数据
- 检查 `emojiSet.value` 的值是否正确

### Q3: 设置面板没有显示集合选项

**原因**: 
- `emojiSetOptions` 为空数组
- API 返回数据格式错误

**解决**:
- 检查 API 返回的 `emojiSetOptions` 字段
- 确认后端 API 实现正确

---

## 📈 后续优化

### 缓存优化
- 实现本地缓存，减少 API 请求
- 使用 `uni.setStorageSync` 缓存数据
- 设置缓存过期时间（如 24 小时）

### 增量更新
- 记录数据版本号
- 仅在版本更新时重新获取

### 离线支持
- 首次加载后保存到本地
- 离线时使用本地数据
- 在线时异步更新

---

## 🎨 扩展建议

### 1. 自定义 Emoji 集合

管理员可以在后台泡泡库中：
- 创建新的 emoji
- 设置不同的标签分类
- 调整集合顺序

### 2. 用户收藏

- 允许用户收藏喜欢的 emoji
- 创建"我的收藏"集合
- 同步到用户设置

### 3. 主题联动

- 将 emoji 集合与游戏主题关联
- 不同主题使用不同的 emoji 风格
- 支持动态主题切换

---

## 📞 技术支持

如有问题，请检查：
1. 后端服务是否正常运行
2. 数据库中是否有 emoji 数据
3. API 地址配置是否正确
4. 网络请求是否成功

开发文档: `/scripts/README-EMOJI-IMPORT.md`
