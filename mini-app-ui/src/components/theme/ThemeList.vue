<script lang="ts" setup>
import type { Theme } from './types'
import ThemeCard from './ThemeCard.vue'

defineOptions({
  name: 'ThemeList',
})

const props = defineProps<{
  themes: Theme[]
  currentThemeId: string
}>()

const emit = defineEmits<{
  'select-theme': [id: string]
  'create-theme': []
}>()
</script>

<template>
  <scroll-view scroll-x class="theme-scroll" :show-scrollbar="false">
    <view class="theme-list">
      <!-- 添加主题按钮 -->
      <view class="theme-item add-btn" @click="emit('create-theme')">
        <view class="theme-preview-wrapper add-wrapper">
          <view class="i-lucide-plus text-2xl text-gray-400" />
        </view>
      </view>

      <!-- 主题卡片 -->
      <ThemeCard
        v-for="theme in themes"
        :key="theme.id"
        :theme="theme"
        :active="currentThemeId === theme.id"
        @select="emit('select-theme', theme.id)"
      />
    </view>
  </scroll-view>
</template>

<style lang="scss" scoped>
.theme-scroll {
  width: 100%;
  white-space: nowrap;
  flex-shrink: 0;
}

.theme-list {
  padding: 45rpx 24rpx 25rpx 24rpx;
  display: flex;
  gap: 24rpx;
}

.theme-item.add-btn {
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

  &:active {
    transform: scale(0.95);
  }

  .add-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.6) !important;
    border: 2rpx dashed #ccc;
    position: relative;
    width: 160rpx;
    height: 120rpx;
    border-radius: 20rpx;
    overflow: hidden;
  }
}
</style>
