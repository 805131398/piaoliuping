<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  icon?: string
  showIcon?: boolean
  back?: boolean
  home?: boolean
  homeUrl?: string
  align?: 'default' | 'right' | 'center'
  variant?: 'light' | 'transparent' | 'dark'
  bleed?: 'default' | 'home'
}>(), {
  subtitle: '',
  icon: 'i-lucide-waves',
  showIcon: true,
  back: false,
  home: false,
  homeUrl: '/pages/index/index',
  align: 'default',
  variant: 'light',
  bleed: 'default',
})

function goBack() {
  const pages = getCurrentPages()

  if (pages.length > 1) {
    uni.navigateBack()
    return
  }

  uni.reLaunch({ url: props.homeUrl })
}

function goHome() {
  uni.reLaunch({ url: props.homeUrl })
}
</script>

<template>
  <view
    class="app-topbar"
    :class="[`app-topbar-${variant}`, `app-topbar-${bleed}`, `app-topbar-align-${align}`]"
  >
    <button v-if="home" class="topbar-home-btn" @tap="goHome">
      <view class="i-lucide-house topbar-home-icon" />
    </button>

    <view class="topbar-brand">
      <button v-if="back" class="topbar-action" @tap="goBack">
        <view class="i-lucide-chevron-left topbar-action-icon" />
      </button>
      <view v-else-if="showIcon" class="topbar-mark">
        <view :class="icon" class="topbar-mark-icon" />
      </view>

      <view class="topbar-copy">
        <text class="topbar-title">{{ title }}</text>
        <text v-if="subtitle" class="topbar-subtitle">{{ subtitle }}</text>
      </view>
    </view>

    <view v-if="$slots.right" class="topbar-right">
      <slot name="right" />
    </view>
  </view>
</template>

<style scoped lang="scss">
.app-topbar {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28rpx;
  width: 100vw;
  min-height: 156rpx;
  padding: calc(var(--status-bar-height) + 34rpx) 218rpx 24rpx 30rpx;
  box-sizing: border-box;
}

.app-topbar-default {
  margin-left: -28rpx;
}

.app-topbar-home {
  margin-left: -24rpx;
}

.app-topbar-align-right {
  padding-right: 30rpx;
}

.app-topbar-align-center {
  justify-content: center;
  padding-right: 30rpx;
}

/* #ifdef MP-WEIXIN */
.app-topbar {
  min-height: 206rpx;
  padding-top: calc(var(--status-bar-height) + 104rpx);
}
/* #endif */

.app-topbar-light {
  background: transparent;
}

.app-topbar-transparent {
  background: transparent;
}

.app-topbar-dark {
  color: #fff;
}

.topbar-brand {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 14rpx;
  min-width: 0;
}

.app-topbar-align-right .topbar-brand {
  flex-direction: row-reverse;
  justify-content: flex-end;
  text-align: right;
}

.app-topbar-align-right .topbar-copy {
  align-items: flex-end;
}

.app-topbar-align-center .topbar-home-btn {
  position: absolute;
  left: 30rpx;
  bottom: 24rpx;
}

.app-topbar-align-center .topbar-brand {
  flex: 0 1 auto;
  justify-content: center;
  text-align: center;
}

.app-topbar-align-center .topbar-copy {
  align-items: center;
}

.topbar-home-btn {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  margin: 0;
  padding: 0;
  border: 1rpx solid rgba(0, 93, 144, 0.14);
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.68);
  color: #005d90;
  line-height: 1;
}

.topbar-home-btn::after {
  border: 0;
}

.topbar-home-btn:active {
  transform: scale(0.96);
}

.topbar-action,
.topbar-mark {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 52rpx;
  height: 52rpx;
  margin: 0;
  padding: 0;
  border-radius: 999rpx;
}

.topbar-action {
  border: 1rpx solid rgba(0, 93, 144, 0.12);
  background: rgba(255, 255, 255, 0.64);
  color: #005d90;
}

.topbar-action::after {
  border: 0;
}

.topbar-action:active {
  transform: scale(0.96);
}

.topbar-mark {
  background: rgba(0, 119, 182, 0.1);
  color: #005d90;
}

.app-topbar-dark .topbar-action,
.app-topbar-dark .topbar-home-btn,
.app-topbar-dark .topbar-mark {
  border-color: rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.92);
}

.topbar-action-icon,
.topbar-home-icon,
.topbar-mark-icon {
  width: 130rpx;
  height: 130rpx;
  font-size: 130rpx;
}

.topbar-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8rpx;
}

.topbar-title {
  overflow: hidden;
  color: #005d90;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar-subtitle {
  overflow: hidden;
  color: rgba(64, 72, 80, 0.68);
  font-size: 21rpx;
  font-weight: 500;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-topbar-dark .topbar-title {
  color: #fff;
}

.app-topbar-dark .topbar-subtitle {
  color: rgba(218, 242, 255, 0.76);
}

.topbar-right {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-end;
  min-width: 52rpx;
}
</style>
