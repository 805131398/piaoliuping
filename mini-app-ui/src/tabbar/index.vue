<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { useBottleLoginGuard } from '@/hooks/useBottleLoginGuard'
import { useTokenStore } from '@/store/token'
import { currRoute } from '@/utils'
import { customTabbarList } from './config'

// #ifdef MP-WEIXIN
defineOptions({
  virtualHost: true,
})
// #endif

const currentPath = ref('/pages/index/index')
const {
  showLoginPrompt,
  closeLoginPrompt,
  drawBottle: guardedDrawBottle,
} = useBottleLoginGuard()
const tokenStore = useTokenStore()

const navItems = computed(() => {
  return customTabbarList.map(item => ({
    ...item,
    pagePath: item.pagePath.startsWith('/') ? item.pagePath : `/${item.pagePath}`,
    icon: item.icon || 'i-lucide-circle',
  }))
})

onShow(() => {
  const { path } = currRoute()
  currentPath.value = path === '/' ? '/pages/index/index' : path
})

function drawBottle() {
  guardedDrawBottle()
}

async function loginBeforeMe() {
  // #ifdef MP-WEIXIN
  await tokenStore.wxLogin()
  return true
  // #endif

  // #ifndef MP-WEIXIN
  uni.navigateTo({
    url: `/pages-fg/login/login?redirect=${encodeURIComponent('/pages/me/me')}`,
  })
  return false
  // #endif
}

async function goMe() {
  if (currentPath.value === '/pages/me/me') {
    return
  }

  if (tokenStore.hasLogin) {
    uni.reLaunch({ url: '/pages/me/me' })
    return
  }

  try {
    const loggedIn = await loginBeforeMe()
    if (loggedIn) {
      uni.reLaunch({ url: '/pages/me/me' })
    }
  }
  catch (error) {
    console.error('进入我的页面前登录失败:', error)
  }
}

function goPage(url?: string) {
  if (!url) {
    return
  }

  if (currentPath.value === url) {
    return
  }

  uni.reLaunch({ url })
}
</script>

<template>
  <view class="floating-nav" @touchmove.stop.prevent>
    <view class="action-row">
      <button
        v-for="item in navItems"
        :key="item.pagePath"
        class="float-card nav-card"
        :class="[currentPath === item.pagePath && 'active']"
        @tap="goPage(item.pagePath)"
      >
        <view :class="item.icon" class="nav-icon" />
        <text class="nav-label">{{ item.text }}</text>
      </button>

      <button class="float-card catch-button" @tap="drawBottle">
        <view class="net-head">
          <view class="net-mesh net-mesh-a" />
          <view class="net-mesh net-mesh-b" />
        </view>
        <view class="net-handle" />
        <text class="catch-label">捕捞</text>
      </button>

      <button v-if="tokenStore.hasLogin" class="float-card mine-button" :class="[currentPath === '/pages/me/me' && 'active']" @tap="goMe">
        <view class="mine-avatar">
          <view class="mine-head" />
          <view class="mine-shoulders" />
        </view>
        <text class="catch-label">我的</text>
      </button>
    </view>

    <view v-if="showLoginPrompt" class="login-prompt-overlay" @tap="closeLoginPrompt(false)">
      <view class="login-prompt" @tap.stop>
        <view class="prompt-visual">
          <view class="prompt-bottle">
            <view class="prompt-cork" />
            <view class="prompt-glass">
              <view class="prompt-shine" />
              <view class="prompt-letter" />
            </view>
          </view>
          <view class="prompt-ripple" />
        </view>

        <view class="prompt-copy">
          <text class="prompt-title">登录后捕捞</text>
          <text class="prompt-desc">漂来的消息会存进你的听潮小筑，也能继续回信和收藏。</text>
        </view>

        <view class="prompt-actions">
          <button class="prompt-btn prompt-btn-ghost" @tap="closeLoginPrompt(false)">
            暂不登录
          </button>
          <button class="prompt-btn prompt-btn-primary" @tap="closeLoginPrompt(true)">
            立即登录
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.floating-nav {
  position: fixed;
  right: 28rpx;
  bottom: var(--app-floating-nav-bottom);
  z-index: 80;
  display: flex;
  align-items: flex-end;
  pointer-events: none;
}

.action-row {
  pointer-events: auto;
}

.action-row {
  display: flex;
  align-items: flex-end;
  gap: 14rpx;
}

.float-card::after {
  border: 0;
}

.float-card.active {
  border-color: rgba(0, 119, 182, 0.32);
  background: #e8f7fb;
  color: #005d90;
  font-weight: 700;
}

.nav-icon {
  width: 44rpx;
  height: 44rpx;
  font-size: 44rpx;
}

.nav-label {
  color: #005d90;
  font-size: 20rpx;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.float-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 4rpx;
  width: 116rpx;
  height: 116rpx;
  margin: 0;
  padding: 0;
  border: 1rpx solid rgba(255, 255, 255, 0.24);
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.92);
  color: #005d90;
  box-shadow: 0 18rpx 42rpx rgba(0, 29, 50, 0.24);
  animation: net-float 7s ease-in-out infinite;
}

.nav-card {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.96), rgba(232, 247, 251, 0.9));
}

.nav-card:nth-child(1) {
  animation-delay: -0.8s;
}

.nav-card:nth-child(2) {
  animation-delay: -1.9s;
}

.nav-card:nth-child(3) {
  animation-delay: -2.8s;
}

.mine-button {
  border-color: rgba(255, 255, 255, 0.32);
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.96), rgba(232, 247, 251, 0.92));
  animation-delay: -1.6s;
}

.mine-button.active {
  border-color: rgba(0, 119, 182, 0.34);
  background: #e8f7fb;
}

.float-card:active {
  transform: scale(0.96);
}

.catch-label {
  color: #005d90;
  font-size: 20rpx;
  font-weight: 700;
  line-height: 1;
}

.mine-avatar {
  position: relative;
  width: 48rpx;
  height: 48rpx;
}

.mine-head {
  position: absolute;
  top: 4rpx;
  left: 50%;
  width: 22rpx;
  height: 22rpx;
  border: 4rpx solid #005d90;
  border-radius: 999rpx;
  background: rgba(148, 204, 255, 0.2);
  transform: translateX(-50%);
  box-sizing: border-box;
}

.mine-shoulders {
  position: absolute;
  left: 50%;
  bottom: 4rpx;
  width: 40rpx;
  height: 24rpx;
  border: 4rpx solid #005d90;
  border-bottom: 0;
  border-radius: 24rpx 24rpx 8rpx 8rpx;
  transform: translateX(-50%);
  box-sizing: border-box;
}

.net-head {
  position: relative;
  width: 48rpx;
  height: 40rpx;
  border: 4rpx solid #005d90;
  border-radius: 50% 50% 44% 44%;
  transform: rotate(-38deg);
}

.net-head::after {
  position: absolute;
  inset: 7rpx;
  content: '';
  border-radius: inherit;
  background: rgba(148, 204, 255, 0.28);
}

.net-mesh {
  position: absolute;
  left: 6rpx;
  right: 6rpx;
  z-index: 1;
  height: 2rpx;
  background: rgba(0, 93, 144, 0.38);
}

.net-mesh-a {
  top: 13rpx;
}

.net-mesh-b {
  top: 23rpx;
}

.net-handle {
  position: absolute;
  top: 48rpx;
  left: 66rpx;
  width: 8rpx;
  height: 42rpx;
  border-radius: 999rpx;
  background: #8e4e14;
  transform: rotate(41deg);
  transform-origin: top center;
}

.login-prompt-overlay {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
  background: rgba(0, 20, 36, 0.58);
  backdrop-filter: blur(14rpx);
  box-sizing: border-box;
  pointer-events: auto;
  animation: prompt-fade-in 0.18s ease-out;
}

.login-prompt {
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 620rpx;
  padding: 44rpx 38rpx 34rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.28);
  border-radius: 32rpx;
  background:
    radial-gradient(circle at 18% 0%, rgba(173, 232, 244, 0.42), transparent 36%),
    radial-gradient(circle at 90% 100%, rgba(0, 119, 182, 0.24), transparent 40%),
    linear-gradient(160deg, rgba(238, 248, 251, 0.94), rgba(244, 250, 253, 0.88));
  box-shadow:
    0 28rpx 72rpx rgba(0, 29, 50, 0.34),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.68);
  box-sizing: border-box;
  animation: prompt-rise 0.24s ease-out;
}

.login-prompt::before {
  position: absolute;
  top: -120rpx;
  left: -40rpx;
  width: 220rpx;
  height: 220rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.28);
  content: '';
  filter: blur(18rpx);
}

.prompt-visual {
  position: relative;
  display: flex;
  justify-content: center;
  height: 154rpx;
}

.prompt-bottle {
  position: relative;
  width: 76rpx;
  height: 128rpx;
  transform: rotate(-9deg);
}

.prompt-cork {
  width: 24rpx;
  height: 18rpx;
  margin: 0 auto -2rpx;
  border-radius: 6rpx 6rpx 2rpx 2rpx;
  background: #8e4e14;
}

.prompt-glass {
  position: relative;
  width: 100%;
  height: 112rpx;
  overflow: hidden;
  border: 2rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 38rpx 38rpx 24rpx 24rpx;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.72), rgba(148, 204, 255, 0.3));
  box-shadow:
    inset 0 0 22rpx rgba(255, 255, 255, 0.38),
    0 12rpx 28rpx rgba(0, 93, 144, 0.18);
}

.prompt-shine {
  position: absolute;
  top: 18rpx;
  left: 22rpx;
  width: 8rpx;
  height: 56rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.58);
}

.prompt-letter {
  position: absolute;
  left: 18rpx;
  bottom: 24rpx;
  width: 38rpx;
  height: 24rpx;
  border-radius: 4rpx;
  background: rgba(241, 233, 219, 0.88);
  transform: rotate(8deg);
}

.prompt-ripple {
  position: absolute;
  left: 50%;
  bottom: 12rpx;
  width: 190rpx;
  height: 18rpx;
  border-radius: 999rpx;
  background: radial-gradient(ellipse at center, rgba(0, 119, 182, 0.24), transparent 72%);
  transform: translateX(-50%);
}

.prompt-copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14rpx;
  text-align: center;
}

.prompt-title {
  color: #161d1f;
  font-size: 38rpx;
  font-weight: 800;
  line-height: 1.2;
}

.prompt-desc {
  max-width: 470rpx;
  color: #404850;
  font-size: 26rpx;
  line-height: 1.55;
}

.prompt-actions {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18rpx;
  margin-top: 34rpx;
}

.prompt-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 78rpx;
  margin: 0;
  padding: 0 18rpx;
  border-radius: 18rpx;
  font-size: 27rpx;
  font-weight: 700;
  line-height: 1;
  box-sizing: border-box;
}

.prompt-btn::after {
  border: 0;
}

.prompt-btn:active {
  transform: scale(0.97);
}

.prompt-btn-ghost {
  border: 1rpx solid rgba(0, 93, 144, 0.14);
  background: rgba(255, 255, 255, 0.58);
  color: #005d90;
}

.prompt-btn-primary {
  border: 1rpx solid rgba(0, 93, 144, 0.16);
  background: linear-gradient(135deg, #0077b6, #005d90);
  color: #fff;
  box-shadow: 0 12rpx 26rpx rgba(0, 93, 144, 0.22);
}

@keyframes net-float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-10rpx) rotate(2deg);
  }
}

@keyframes prompt-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes prompt-rise {
  from {
    opacity: 0;
    transform: translateY(24rpx) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
