<script lang="ts" setup>
import type { ThemeBubble, BubbleSound } from './types'
import BubblePreview from './BubblePreview.vue'

defineOptions({
  name: 'BubbleCard',
})

const props = withDefaults(
  defineProps<{
    themeBubble: ThemeBubble
    popCount?: number
    enabled?: boolean
    playingSoundId?: string | null
  }>(),
  {
    popCount: 0,
    enabled: true,
    playingSoundId: null,
  }
)

const emit = defineEmits<{
  click: []
  'play-sound': [sound: BubbleSound]
}>()

// 判断当前泡泡的音效是否正在播放
const isPlaying = computed(() => {
  if (!props.playingSoundId || !props.themeBubble.sounds) return false
  return props.themeBubble.sounds.some(s => s.id === props.playingSoundId)
})

// 处理播放音效
function handlePlaySound(sounds: BubbleSound[]) {
  if (sounds.length > 0) {
    emit('play-sound', sounds[0])
  }
}
</script>

<template>
  <view
    class="bubble-card"
    :class="{
      'bubble-enabled': enabled,
      'bubble-disabled': !enabled
    }"
    hover-class="none"
    @click="emit('click')"
  >
    <BubblePreview
      :bubble="themeBubble.bubble"
      :sounds="themeBubble.sounds"
      :is-playing="isPlaying"
      size="sm"
      @play="handlePlaySound"
    />

    <view class="bubble-count">
      <text class="count-value">{{ popCount }}</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.bubble-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx;
  border-radius: 24rpx;
  transition: all 0.2s;
  aspect-ratio: 1;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;

  &.bubble-enabled {
    background: rgba(255, 255, 255, 0.7);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

    &:active {
      transform: scale(0.92);
      background: rgba(255, 255, 255, 0.7);
    }
  }

  &.bubble-disabled {
    background: #f5f5f5;
    opacity: 0.6;
    filter: grayscale(100%);

    &:active {
      transform: scale(0.95);
    }
  }
}

.bubble-count {
  margin-top: 8rpx;
}

.count-value {
  font-size: 20rpx;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.5);
}
</style>
