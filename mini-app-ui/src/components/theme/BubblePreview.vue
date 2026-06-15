<script lang="ts" setup>
import type { Bubble, BubbleSound, BubblePreviewSize } from './types'

defineOptions({
  name: 'BubblePreview',
})

const props = withDefaults(
  defineProps<{
    bubble: Bubble
    sounds?: BubbleSound[]
    isPlaying?: boolean
    size?: BubblePreviewSize
  }>(),
  {
    sounds: () => [],
    isPlaying: false,
    size: 'sm',
  }
)

const emit = defineEmits<{
  play: [sounds: BubbleSound[]]
}>()

// 尺寸样式类
const sizeClass = computed(() => `bubble-preview-${props.size}`)

// 处理点击播放
function handlePlay(e: Event) {
  e.stopPropagation()
  if (props.sounds && props.sounds.length > 0) {
    emit('play', props.sounds)
  }
}
</script>

<template>
  <view class="bubble-preview" :class="sizeClass" @click="handlePlay">
    <!-- 图片类型 -->
    <image
      v-if="bubble.type === 'IMAGE'"
      :src="bubble.content"
      class="w-full h-full object-contain"
      mode="aspectFit"
    />

    <!-- Emoji 类型 -->
    <text v-else-if="bubble.type === 'EMOJI'" class="bubble-emoji">
      {{ bubble.content }}
    </text>

    <!-- 颜色类型 -->
    <view v-else class="w-full h-full rounded-full" :style="{ backgroundColor: bubble.content }" />

    <!-- 播放中的遮罩 -->
    <view v-if="isPlaying" class="playing-overlay">
      <view class="i-lucide-volume-2 text-white animate-pulse" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.bubble-preview {
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:active {
    transform: scale(0.95);
  }
}

// 小尺寸 (用于网格卡片)
.bubble-preview-sm {
  width: 72rpx;
  height: 72rpx;

  .bubble-emoji {
    font-size: 32rpx;
  }

  .i-lucide-volume-2 {
    font-size: 20rpx;
  }
}

// 中尺寸
.bubble-preview-md {
  width: 100rpx;
  height: 100rpx;

  .bubble-emoji {
    font-size: 40rpx;
  }

  .i-lucide-volume-2 {
    font-size: 24rpx;
  }
}

// 大尺寸 (用于弹窗预览)
.bubble-preview-lg {
  width: 120rpx;
  height: 120rpx;

  .bubble-emoji {
    font-size: 48rpx;
  }

  .i-lucide-volume-2 {
    font-size: 28rpx;
  }
}

.playing-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
