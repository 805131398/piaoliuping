<script lang="ts" setup>
import type { ThemeBubble, ThemeConfig, BubbleSound } from './types'
import BubbleCard from './BubbleCard.vue'

defineOptions({
  name: 'BubbleGrid',
})

const props = withDefaults(
  defineProps<{
    themeBubbles: ThemeBubble[]
    bubbleStats: Record<string, number>
    config: ThemeConfig
    themeId: string
    playingSoundId?: string | null
  }>(),
  {
    playingSoundId: null,
  }
)

const emit = defineEmits<{
  'play-sound': [sound: BubbleSound]
  'sync-config': [config: ThemeConfig]  // 预留：未来用于同步到服务器
}>()

// 虚拟列表配置
const COLS = 5
const ROW_HEIGHT = 160  // rpx
const BUFFER_ROWS = 2

// 滚动相关状态
const scrollTop = ref(0)
const viewportHeight = ref(800)  // 默认可视区域高度

// 总行数
const totalRows = computed(() => Math.ceil(props.themeBubbles.length / COLS))

// 总高度
const totalHeight = computed(() => totalRows.value * ROW_HEIGHT)

// 可视区域的起始和结束行
const startRow = computed(() => {
  const row = Math.floor(scrollTop.value / ROW_HEIGHT)
  return Math.max(0, row - BUFFER_ROWS)
})

const endRow = computed(() => {
  const row = Math.ceil((scrollTop.value + viewportHeight.value) / ROW_HEIGHT)
  return Math.min(totalRows.value, row + BUFFER_ROWS)
})

// 可视区域的泡泡
const visibleBubbles = computed(() => {
  const start = startRow.value * COLS
  const end = endRow.value * COLS
  return props.themeBubbles.slice(start, end)
})

// 偏移量
const offsetY = computed(() => startRow.value * ROW_HEIGHT)

// 滚动事件处理
function handleScroll(e: any) {
  scrollTop.value = e.detail.scrollTop
}

// 判断泡泡是否启用
function isBubbleEnabled(bubbleId: string): boolean {
  return !props.config.disabledBubbles.includes(bubbleId)
}

// 获取泡泡点击次数
function getBubblePopCount(bubbleId: string): number {
  return props.bubbleStats[bubbleId] || 0
}

// 跳转到泡泡详情页
function goToBubbleDetail(bubble: ThemeBubble) {
  const bubbleData = encodeURIComponent(JSON.stringify(bubble))
  const popCount = getBubblePopCount(bubble.id)

  uni.navigateTo({
    url: `/pages/theme/bubble-detail?themeId=${props.themeId}&bubbleData=${bubbleData}&popCount=${popCount}`
  })
}

// 初始化时获取可视区域高度
onMounted(() => {
  const info = uni.getSystemInfoSync() as any
  // 减去头部和其他区域的高度,大约留 500rpx 给泡泡网格
  viewportHeight.value = Math.max(500, info.windowHeight * 0.6)
})
</script>

<template>
  <view class="bubbles-section">
    <view class="section-header">
      <text class="section-title">泡泡配置</text>
      <text class="section-subtitle">点击卡片修改设置</text>
    </view>

    <scroll-view
      scroll-y
      class="bubble-scroll"
      :scroll-top="scrollTop"
      @scroll="handleScroll"
    >
      <view class="bubble-grid-container" :style="{ height: totalHeight + 'rpx' }">
        <view class="bubble-grid" :style="{ transform: `translateY(${offsetY}rpx)` }">
          <BubbleCard
            v-for="tb in visibleBubbles"
            :key="tb.id"
            :theme-bubble="tb"
            :pop-count="getBubblePopCount(tb.id)"
            :enabled="isBubbleEnabled(tb.id)"
            :playing-sound-id="playingSoundId"
            @click="goToBubbleDetail(tb)"
            @play-sound="emit('play-sound', $event)"
          />
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.bubbles-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header {
  margin-bottom: 24rpx;
  flex-shrink: 0;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #444;
  margin-right: 16rpx;
}

.section-subtitle {
  font-size: 22rpx;
  color: #999;
}

.bubble-scroll {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

.bubble-grid-container {
  position: relative;
  width: 100%;
}

.bubble-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20rpx;
  padding-bottom: 40rpx;
  transition: transform 0.1s ease-out;
}
</style>
