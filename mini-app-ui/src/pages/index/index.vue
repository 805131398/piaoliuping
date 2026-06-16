<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'

defineOptions({
  name: 'SeaDiscovery',
})

definePage({
  type: 'home',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '沧海拾音',
    navigationBarBackgroundColor: '#005d90',
    navigationBarTextStyle: 'white',
  },
})

const bubbles = [
  { left: 8, size: 10, delay: 0, duration: 9 },
  { left: 18, size: 7, delay: -3, duration: 11 },
  { left: 31, size: 13, delay: -6, duration: 10 },
  { left: 47, size: 8, delay: -1, duration: 12 },
  { left: 62, size: 11, delay: -5, duration: 9 },
  { left: 77, size: 6, delay: -2, duration: 10 },
  { left: 90, size: 12, delay: -7, duration: 13 },
]

interface Bottle {
  id: number
  slot: string
  state?: 'enlarging' | 'entering'
  width: number
  height: number
}

const bottleSlots = [
  { slot: 'bottle-one', width: 42, height: 72 },
  { slot: 'bottle-two', width: 34, height: 58 },
  { slot: 'bottle-three', width: 28, height: 48 },
]

const bottles = ref<Bottle[]>(bottleSlots.map((bottle, index) => ({ ...bottle, id: index + 1 })))
let bottleId = bottles.value.length
let cycleTimer: ReturnType<typeof setTimeout> | undefined
let enterTimer: ReturnType<typeof setTimeout> | undefined
let removeTimer: ReturnType<typeof setTimeout> | undefined

function clearBottleTimers() {
  ;[cycleTimer, enterTimer, removeTimer].forEach((timer) => {
    if (timer) {
      clearTimeout(timer)
    }
  })
  cycleTimer = undefined
  enterTimer = undefined
  removeTimer = undefined
}

function pickRandomBottle() {
  const candidates = bottles.value.filter(bottle => !bottle.state)
  return candidates[Math.floor(Math.random() * candidates.length)]
}

function refreshBottle() {
  const selectedBottle = pickRandomBottle()

  if (!selectedBottle) {
    scheduleBottleCycle()
    return
  }

  const nextBottle = {
    ...bottleSlots.find(slot => slot.slot === selectedBottle.slot)!,
    id: ++bottleId,
    state: 'entering' as const,
  }

  bottles.value = bottles.value.map((bottle) => {
    return bottle.id === selectedBottle.id ? { ...bottle, state: 'enlarging' } : bottle
  })

  enterTimer = setTimeout(() => {
    bottles.value = [...bottles.value, nextBottle]
  }, 3600)

  removeTimer = setTimeout(() => {
    bottles.value = bottles.value
      .filter(bottle => bottle.id !== selectedBottle.id)
      .map((bottle) => {
        return bottle.id === nextBottle.id ? { ...bottle, state: undefined } : bottle
      })
    scheduleBottleCycle()
  }, 5200)
}

function scheduleBottleCycle() {
  cycleTimer = setTimeout(refreshBottle, 1800)
}

onMounted(() => {
  scheduleBottleCycle()
})

onUnmounted(() => {
  clearBottleTimers()
})

function drawBottle() {
  uni.navigateTo({ url: '/pages/drift/read' })
}
</script>

<template>
  <view class="sea-page app-tabbar-page">
    <view class="god-rays" />
    <view class="sea-glow sea-glow-left" />
    <view class="sea-glow sea-glow-right" />

    <view
      v-for="bubble in bubbles"
      :key="bubble.left"
      class="bubble"
      :style="{
        left: `${bubble.left}%`,
        width: `${bubble.size}rpx`,
        height: `${bubble.size}rpx`,
        animationDelay: `${bubble.delay}s`,
        animationDuration: `${bubble.duration}s`,
      }"
    />

    <view class="topbar">
      <view class="brand-wrap">
        <view class="waves-icon">
          <view class="wave-line wave-line-a" />
          <view class="wave-line wave-line-b" />
          <view class="wave-line wave-line-c" />
        </view>
        <view class="brand-copy">
          <text class="title">沧海拾音</text>
          <text class="subtitle">听见今日漂来的回声</text>
        </view>
      </view>

      <view class="quota">
        <text class="sail-icon">舟</text>
        <view class="quota-copy">
          <text class="quota-label">今日拾贝</text>
          <text class="quota-count">5/5</text>
        </view>
      </view>
    </view>

    <view class="discovery-area">
      <view
        v-for="bottle in bottles"
        :key="bottle.id"
        class="drift-bottle"
        :class="[bottle.slot, bottle.state && `bottle-${bottle.state}`]"
        :style="{ width: `${bottle.width}rpx`, height: `${bottle.height}rpx` }"
        @tap="drawBottle"
      >
        <view class="bottle-figure">
          <view class="bottle-cork" />
          <view class="bottle-glass">
            <view class="bottle-shine" />
          </view>
          <view class="bottle-ripple" />
        </view>
      </view>

      <view class="center-copy">
        <text class="eyebrow">轻触漂来的瓶子</text>
        <text class="copy">有一段带着海盐味的消息正在靠近</text>
      </view>
    </view>

    <button class="net-button" @tap="drawBottle">
      <view class="net-head">
        <view class="net-mesh net-mesh-a" />
        <view class="net-mesh net-mesh-b" />
      </view>
      <view class="net-handle" />
    </button>
  </view>
</template>

<style scoped lang="scss">
.sea-page {
  position: relative;
  overflow: hidden;
  padding: 0 24rpx 148rpx;
  background:
    radial-gradient(circle at 48% 27%, rgba(148, 204, 255, 0.18), transparent 24%),
    radial-gradient(circle at 35% 58%, rgba(0, 119, 182, 0.24), transparent 34%),
    linear-gradient(180deg, #005d90 0%, #003f66 42%, #001d32 100%);
  box-sizing: border-box;
  color: #fff;
}

.god-rays {
  position: absolute;
  top: -18%;
  left: -24%;
  z-index: 1;
  width: 148%;
  height: 120%;
  pointer-events: none;
  background: repeating-linear-gradient(
    70deg,
    transparent 0%,
    transparent 10%,
    rgba(255, 255, 255, 0.03) 12%,
    rgba(255, 255, 255, 0.08) 15%,
    rgba(255, 255, 255, 0.03) 18%,
    transparent 22%
  );
  filter: blur(32rpx);
  animation: rays-rotate 20s linear infinite;
}

.sea-glow {
  position: absolute;
  z-index: 1;
  border-radius: 999rpx;
  pointer-events: none;
  filter: blur(36rpx);
}

.sea-glow-left {
  top: 14%;
  left: -120rpx;
  width: 340rpx;
  height: 340rpx;
  background: rgba(148, 204, 255, 0.14);
}

.sea-glow-right {
  right: -160rpx;
  bottom: 22%;
  width: 420rpx;
  height: 420rpx;
  background: rgba(0, 119, 182, 0.18);
}

.bubble {
  position: absolute;
  bottom: -24rpx;
  z-index: 2;
  border: 1rpx solid rgba(255, 255, 255, 0.22);
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.12);
  animation: bubble-rise 10s ease-in infinite;
}

.topbar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28rpx;
  min-height: 156rpx;
  margin: 0 -24rpx;
  padding: calc(var(--status-bar-height) + 22rpx) 218rpx 24rpx 30rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.2);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03));
  backdrop-filter: blur(20rpx);
}

.brand-wrap,
.quota {
  display: flex;
  align-items: center;
}

.brand-wrap {
  gap: 14rpx;
  flex: 1;
  min-width: 0;
}

.waves-icon {
  position: relative;
  flex: 0 0 auto;
  width: 34rpx;
  height: 28rpx;
}

.wave-line {
  position: absolute;
  left: 0;
  width: 32rpx;
  height: 7rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.9);
  border-top: 0;
  border-left-color: transparent;
  border-right-color: transparent;
  border-radius: 999rpx;
}

.wave-line-a {
  top: 0;
}

.wave-line-b {
  top: 10rpx;
  left: 4rpx;
}

.wave-line-c {
  top: 20rpx;
}

.title {
  color: #fff;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.15;
}

.brand-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8rpx;
}

.subtitle {
  color: rgba(218, 242, 255, 0.76);
  font-size: 21rpx;
  font-weight: 500;
  line-height: 1.2;
}

.quota {
  flex: 0 0 auto;
  gap: 12rpx;
  min-width: 128rpx;
  height: 58rpx;
  padding: 0 18rpx 0 16rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 18rpx;
  background: rgba(6, 35, 63, 0.24);
  color: rgba(255, 255, 255, 0.88);
  box-sizing: border-box;
  backdrop-filter: blur(20rpx);
}

.sail-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34rpx;
  height: 34rpx;
  border-radius: 999rpx;
  background: rgba(148, 204, 255, 0.18);
  color: #a9d8ff;
  font-size: 20rpx;
  font-weight: 700;
}

.quota-copy {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
  line-height: 1.1;
}

.quota-label {
  color: rgba(218, 242, 255, 0.68);
  font-size: 18rpx;
  font-weight: 500;
}

.quota-count {
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}

.discovery-area {
  position: relative;
  z-index: 5;
  min-height: calc(100vh - var(--app-tabbar-total-height) - 292rpx - var(--status-bar-height));
}

.drift-bottle {
  position: absolute;
  z-index: 12;
  animation:
    drift-ocean 20s ease-in-out infinite,
    bobbing 6s ease-in-out infinite;
}

.bottle-figure {
  position: relative;
  width: 100%;
  height: 100%;
  padding-top: 8rpx;
  box-sizing: content-box;
  transform-origin: 50% 68%;
}

.bottle-enlarging {
  z-index: 14;
}

.bottle-enlarging .bottle-figure {
  animation: bottle-enlarge-out 5.2s ease-in forwards;
}

.bottle-entering {
  z-index: 13;
}

.bottle-entering .bottle-figure {
  animation: bottle-enter 1.6s ease-out forwards;
}

.bottle-entering .bottle-glass {
  animation: bottle-glass-renew 1.6s ease-out forwards;
}

.bottle-one {
  top: 24%;
  left: 47%;
  animation-delay:
    -2s,
    -1s;
}

.bottle-two {
  top: 43%;
  left: 16%;
  opacity: 0.54;
  animation-duration: 24s, 8s;
  animation-delay:
    -12s,
    -4s;
}

.bottle-two .bottle-figure {
  transform: scale(0.82);
}

.bottle-three {
  top: 56%;
  right: 18%;
  opacity: 0.48;
  animation-duration: 28s, 7s;
  animation-delay:
    -18s,
    -3s;
}

.bottle-three .bottle-figure {
  transform: scale(0.72);
}

.bottle-cork {
  width: 30%;
  height: 14%;
  margin: 0 auto -2rpx;
  border-radius: 6rpx 6rpx 2rpx 2rpx;
  background: rgba(142, 78, 20, 0.9);
}

.bottle-glass {
  position: relative;
  width: 100%;
  height: 86%;
  overflow: hidden;
  border: 1rpx solid rgba(255, 255, 255, 0.32);
  border-radius: 44% 44% 32% 32% / 58% 58% 42% 42%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.06));
  box-shadow:
    inset 0 0 18rpx rgba(255, 255, 255, 0.18),
    0 10rpx 30rpx rgba(0, 29, 50, 0.26);
  backdrop-filter: blur(12rpx);
}

.bottle-shine {
  position: absolute;
  top: 12%;
  left: 24%;
  width: 10rpx;
  height: 52%;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.26);
  filter: blur(1rpx);
}

.bottle-ripple {
  position: absolute;
  bottom: -12rpx;
  left: 50%;
  width: 124%;
  height: 14rpx;
  border-radius: 999rpx;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.26), transparent 70%);
  filter: blur(3rpx);
  transform: translateX(-50%);
  animation: ripple-pulse 4s ease-in-out infinite;
}

.center-copy {
  position: absolute;
  left: 50%;
  top: 67%;
  z-index: 9;
  display: flex;
  width: 520rpx;
  max-width: 84vw;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  opacity: 0.72;
  text-align: center;
  transform: translateX(-50%);
}

.eyebrow {
  color: rgba(255, 255, 255, 0.9);
  font-size: 26rpx;
  font-weight: 700;
}

.copy {
  color: rgba(235, 242, 244, 0.7);
  font-size: 24rpx;
  line-height: 1.5;
}

.net-button {
  position: fixed;
  right: 38rpx;
  bottom: 248rpx;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 104rpx;
  height: 104rpx;
  padding: 0;
  border: 1rpx solid rgba(255, 255, 255, 0.16);
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 16rpx 40rpx rgba(0, 29, 50, 0.24);
  animation: net-float 7s ease-in-out infinite;
}

.net-button::after {
  border: 0;
}

.net-button:active {
  transform: scale(0.94);
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
  width: 8rpx;
  height: 58rpx;
  margin-left: -10rpx;
  margin-top: 36rpx;
  border-radius: 999rpx;
  background: #8e4e14;
  transform: rotate(41deg);
  transform-origin: top center;
}

@keyframes rays-rotate {
  0% {
    transform: rotate(0deg) scale(1);
  }

  50% {
    transform: rotate(5deg) scale(1.08);
  }

  100% {
    transform: rotate(0deg) scale(1);
  }
}

@keyframes bubble-rise {
  0% {
    opacity: 0;
    transform: translate3d(0, 0, 0);
  }

  20% {
    opacity: 0.62;
  }

  100% {
    opacity: 0;
    transform: translate3d(22rpx, -118vh, 0);
  }
}

@keyframes drift-ocean {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }

  25% {
    transform: translate(54rpx, -26rpx) rotate(5deg);
  }

  50% {
    transform: translate(100rpx, 0) rotate(-3deg);
  }

  75% {
    transform: translate(48rpx, 24rpx) rotate(4deg);
  }

  100% {
    transform: translate(0, 0) rotate(0deg);
  }
}

@keyframes bobbing {
  0%,
  100% {
    margin-top: 0;
  }

  50% {
    margin-top: -22rpx;
  }
}

@keyframes bottle-enlarge-out {
  0%,
  12% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }

  76% {
    opacity: 1;
    transform: translate3d(0, -18rpx, 0) scale(1.82);
  }

  100% {
    opacity: 0;
    transform: translate3d(0, -34rpx, 0) scale(2.22);
  }
}

@keyframes bottle-enter {
  0% {
    opacity: 0;
    transform: translate3d(18rpx, 22rpx, 0) scale(0.62);
  }

  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes bottle-glass-renew {
  0% {
    background: linear-gradient(135deg, rgba(189, 241, 255, 0.34), rgba(255, 255, 255, 0.08));
  }

  100% {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.06));
  }
}

@keyframes ripple-pulse {
  0%,
  100% {
    opacity: 0.2;
    transform: translateX(-50%) scale(1);
  }

  50% {
    opacity: 0.42;
    transform: translateX(-50%) scale(1.28);
  }
}

@keyframes net-float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-14rpx) rotate(3deg);
  }
}

@media (min-width: 600px) {
  .sea-page {
    max-width: 780rpx;
    margin: 0 auto;
  }

  .topbar {
    max-width: 780rpx;
    margin: 0 auto;
  }
}
</style>
