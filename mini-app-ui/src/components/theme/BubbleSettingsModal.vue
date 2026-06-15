<script lang="ts" setup>
import type { ThemeBubble, ThemeConfig, BubbleSound } from './types'
import BubblePreview from './BubblePreview.vue'

defineOptions({
  name: 'BubbleSettingsModal',
})

const props = withDefaults(
  defineProps<{
    show: boolean
    bubble: ThemeBubble | null
    config: ThemeConfig
    popCount?: number
    playingSoundId?: string | null
  }>(),
  {
    popCount: 0,
    playingSoundId: null,
  }
)

const emit = defineEmits<{
  close: []
  'toggle-enable': [bubbleId: string]
  'update-frequency': [bubbleId: string, value: number]
  'play-sound': [sound: BubbleSound]
  'sync-config': [config: ThemeConfig]  // 预留：未来用于同步到服务器
}>()

// 判断泡泡是否启用
const enabled = computed(() => {
  if (!props.bubble) return false
  return !props.config.disabledBubbles.includes(props.bubble.id)
})

// 获取泡泡频率
const frequency = computed(() => {
  if (!props.bubble) return 50
  return props.config.bubbleWeights[props.bubble.id] || 50
})

// 判断是否正在播放
const isPlaying = computed(() => {
  if (!props.playingSoundId || !props.bubble) return false
  return props.bubble.sounds.some(s => s.id === props.playingSoundId)
})

// 切换启用状态
function handleToggle(e: any) {
  if (!props.bubble) return
  emit('toggle-enable', props.bubble.id)
}

// 更新频率
function handleFrequencyChange(e: any) {
  if (!props.bubble) return
  emit('update-frequency', props.bubble.id, e.detail.value)
}

// 播放音效
function handlePlaySound(sounds: BubbleSound[]) {
  if (sounds.length > 0) {
    emit('play-sound', sounds[0])
  }
}
</script>

<template>
  <view v-if="show" class="settings-overlay" @click="emit('close')">
    <view class="settings-modal" @click.stop>
      <view class="modal-header">
        <text class="modal-title">泡泡设置</text>
        <view class="close-btn" @click="emit('close')">
          <view class="i-lucide-x text-lg" />
        </view>
      </view>

      <view v-if="bubble" class="modal-content">
        <!-- 泡泡预览 -->
        <view class="modal-preview">
          <BubblePreview
            :bubble="bubble.bubble"
            :sounds="bubble.sounds"
            :is-playing="isPlaying"
            size="lg"
            @play="handlePlaySound"
          />
          <text class="preview-name">{{ bubble.bubble.name }}</text>
          <text class="preview-count">累计消灭: {{ popCount }} 次</text>
        </view>

        <!-- 启用开关 -->
        <view class="setting-item">
          <text class="setting-label">启用此泡泡</text>
          <switch
            :checked="enabled"
            color="#5CD6A0"
            style="transform: scale(0.8)"
            @change="handleToggle"
          />
        </view>

        <!-- 出现频率 -->
        <view class="setting-item column">
          <view class="flex justify-between items-center w-full">
            <text class="setting-label">出现频率</text>
            <text class="setting-value">{{ frequency }}%</text>
          </view>
          <slider
            :value="frequency"
            :min="0"
            :max="100"
            :step="10"
            :block-size="16"
            activeColor="#8FB7FF"
            backgroundColor="#E5F0FF"
            class="w-full mt-2"
            @change="handleFrequencyChange"
          />
        </view>

        <!-- 试听音效 -->
        <view v-if="bubble.sounds && bubble.sounds.length > 0" class="setting-item">
          <text class="setting-label">试听音效</text>
          <view
            class="sound-btn"
            @click="handlePlaySound(bubble.sounds)"
          >
            <view
              :class="isPlaying ? 'i-lucide-volume-2 animate-pulse' : 'i-lucide-play'"
              class="text-sm"
            />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
// 设置弹窗
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

.settings-modal {
  width: 620rpx;
  background: linear-gradient(160deg, #FFF5F8 0%, #F0F7FF 100%);
  border-radius: 32rpx;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 2rpx solid rgba(200, 180, 220, 0.1);
}

.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #5C5C7B;
}

.close-btn {
  width: 56rpx;
  height: 56rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:active {
    transform: scale(0.9);
  }
}

.modal-content {
  padding: 24rpx 32rpx 32rpx;
}

.modal-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32rpx;
}

.preview-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-top: 16rpx;
}

.preview-count {
  font-size: 24rpx;
  color: #8FB7FF;
  margin-top: 8rpx;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
  margin-bottom: 16rpx;

  &.column {
    flex-direction: column;
    align-items: flex-start;
  }
}

.setting-label {
  font-size: 28rpx;
  color: #555;
  font-weight: 500;
}

.setting-value {
  font-size: 28rpx;
  color: #8FB7FF;
  font-weight: 600;
}

.sound-btn {
  width: 64rpx;
  height: 64rpx;
  background: linear-gradient(135deg, #8FB7FF 0%, #B08FFF 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;

  &:active {
    transform: scale(0.9);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
