<script lang="ts" setup>
import type { Theme } from './types'

defineOptions({
  name: 'ThemeCard',
})

const props = withDefaults(
  defineProps<{
    theme: Theme
    active?: boolean
  }>(),
  {
    active: false,
  }
)

const emit = defineEmits<{
  select: []
}>()
</script>

<template>
  <view class="theme-item" :class="{ active }" @click="emit('select')">
    <view class="theme-preview-wrapper">
      <!-- 主题预览图 -->
      <image
        v-if="theme.previewUrl"
        :src="theme.previewUrl"
        mode="aspectFill"
        class="theme-preview"
      />
      <view v-else class="theme-preview-placeholder" :style="{ background: theme.bgColor || '#eee' }" />

      <!-- 主题名称遮罩 -->
      <view class="theme-name-overlay">
        <text class="theme-name">{{ theme.name }}</text>
      </view>

      <!-- 选中指示器 -->
      <view v-if="active" class="active-indicator">
        <view class="i-lucide-check text-xs text-white" />
      </view>

      <!-- 自定义主题标识 -->
      <view v-if="theme.isCustom" class="custom-badge">
        <view class="i-lucide-star text-xs" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.theme-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 0;
  border-radius: 24rpx;
  background: transparent;
  border: 4rpx solid transparent;
  transition: all 0.2s;
  margin-top: 4rpx;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent; // 移除移动端点击高亮

  &.active {
    background: transparent;
    border-color: #8FB7FF;
    box-shadow: 0 8rpx 24rpx rgba(143, 183, 255, 0.2);
    transform: translateY(-4rpx);
  }

  &:active {
    transform: translateY(-2rpx) scale(0.98);
  }
}

.theme-preview-wrapper {
  position: relative;
  width: 160rpx;
  height: 120rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.theme-preview, .theme-preview-placeholder {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
}

.theme-preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-name-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8rpx;
  background: rgba(0, 0, 0, 0.1);
}

.theme-name {
  font-size: 24rpx;
  color: #fff;
  font-weight: 600;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
  text-align: center;
  white-space: normal;
  line-height: 1.2;
}

.active-indicator {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: #8FB7FF;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #fff;
  z-index: 2;
}

.custom-badge {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: #FFD700;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  z-index: 2;
}
</style>
