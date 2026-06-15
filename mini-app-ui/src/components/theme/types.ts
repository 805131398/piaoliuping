/**
 * 主题管理相关的 TypeScript 类型定义
 */

// 泡泡音效
export interface BubbleSound {
  id: string
  url: string
}

// 泡泡基础信息
export interface Bubble {
  id: string
  name: string
  type: 'IMAGE' | 'EMOJI' | 'COLOR'
  content: string
  visualProps?: any
  physicsProps?: any
}

// 主题中的泡泡（包含音效）
export interface ThemeBubble {
  id: string
  order: number
  bubble: Bubble
  sounds: BubbleSound[]
}

// 游戏主题
export interface Theme {
  id: string
  name: string
  code?: string
  description?: string
  previewUrl?: string
  bgImageUrl?: string
  bgColor?: string
  isDefault: boolean
  isCustom?: boolean
  bubbles: ThemeBubble[]
}

// 主题配置（用户个性化设置）
export interface ThemeConfig {
  disabledBubbles: string[]  // 禁用的泡泡ID列表
  bubbleWeights: Record<string, number>  // 泡泡出现频率权重
}

// 泡泡预览尺寸
export type BubblePreviewSize = 'sm' | 'md' | 'lg'
