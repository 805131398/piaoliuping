<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import AppTopbar from '@/components/AppTopbar.vue'
import { useBottleLoginGuard } from '@/hooks/useBottleLoginGuard'

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
  left: number
  top: number
}

const bottleSlots = [
  { slot: 'bottle-one', width: 42, height: 72, left: 47, top: 24 },
  { slot: 'bottle-two', width: 34, height: 58, left: 16, top: 43 },
  { slot: 'bottle-three', width: 28, height: 48, left: 74, top: 56 },
]

const bottleArea = {
  minLeft: 10,
  maxLeft: 82,
  minTop: 18,
  maxTop: 62,
}
const minDistanceFromRemovedBottle = 28
const minDistanceFromVisibleBottle = 18
const maxPositionAttempts = 24

const bottles = ref<Bottle[]>(bottleSlots.map((bottle, index) => ({ ...bottle, id: index + 1 })))
const { showLoginPrompt, closeLoginPrompt, drawBottle } = useBottleLoginGuard()
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

function getBottleDistance(first: Pick<Bottle, 'left' | 'top'>, second: Pick<Bottle, 'left' | 'top'>) {
  const leftDistance = first.left - second.left
  const topDistance = first.top - second.top
  return Math.sqrt(leftDistance * leftDistance + topDistance * topDistance)
}

function getRandomBottlePosition() {
  return {
    left: bottleArea.minLeft + Math.random() * (bottleArea.maxLeft - bottleArea.minLeft),
    top: bottleArea.minTop + Math.random() * (bottleArea.maxTop - bottleArea.minTop),
  }
}

function pickNextBottlePosition(removedBottle: Bottle) {
  const visibleBottles = bottles.value.filter(bottle => bottle.id !== removedBottle.id)

  for (let attempt = 0; attempt < maxPositionAttempts; attempt++) {
    const position = getRandomBottlePosition()
    const isFarFromRemoved = getBottleDistance(position, removedBottle) >= minDistanceFromRemovedBottle
    const isFarFromVisible = visibleBottles.every((bottle) => {
      return getBottleDistance(position, bottle) >= minDistanceFromVisibleBottle
    })

    if (isFarFromRemoved && isFarFromVisible) {
      return position
    }
  }

  return getRandomBottlePosition()
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
    ...pickNextBottlePosition(selectedBottle),
  }

  bottles.value = [...bottles.value, nextBottle]

  enterTimer = setTimeout(() => {
    bottles.value = bottles.value.map((bottle) => {
      if (bottle.id === nextBottle.id) {
        return { ...bottle, state: undefined }
      }

      return bottle.id === selectedBottle.id ? { ...bottle, state: 'enlarging' } : bottle
    })

    removeTimer = setTimeout(() => {
      bottles.value = bottles.value.filter(bottle => bottle.id !== selectedBottle.id)
      scheduleBottleCycle()
    }, 5200)
  }, 1600)
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

</script>

<template>
  <view class="sea-page">
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

    <AppTopbar title="沧海拾音" subtitle="听见今日漂来的回声" variant="dark" bleed="home" />

    <view class="discovery-area">
      <view
        v-for="bottle in bottles"
        :key="bottle.id"
        class="drift-bottle"
        :class="[bottle.slot, bottle.state && `bottle-${bottle.state}`]"
        :style="{
          width: `${bottle.width}rpx`,
          height: `${bottle.height}rpx`,
          left: `${bottle.left}%`,
          top: `${bottle.top}%`,
        }"
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

.discovery-area {
  position: relative;
  z-index: 5;
  min-height: calc(100vh - 292rpx - var(--status-bar-height));
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
  --bottle-scale: 1;
  --bottle-enter-scale: 0.62;
  width: 100%;
  height: 100%;
  padding-top: 8rpx;
  box-sizing: content-box;
  transform-origin: 50% 68%;
  transform: scale(var(--bottle-scale));
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
  animation-delay:
    -2s,
    -1s;
}

.bottle-two {
  opacity: 0.54;
  animation-duration: 24s, 8s;
  animation-delay:
    -12s,
    -4s;
}

.bottle-two .bottle-figure {
  --bottle-scale: 0.82;
  --bottle-enter-scale: 0.51;
}

.bottle-three {
  opacity: 0.48;
  animation-duration: 28s, 7s;
  animation-delay:
    -18s,
    -3s;
}

.bottle-three .bottle-figure {
  --bottle-scale: 0.72;
  --bottle-enter-scale: 0.45;
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

.login-prompt-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
  background: rgba(0, 20, 36, 0.58);
  backdrop-filter: blur(14rpx);
  box-sizing: border-box;
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
    transform: translate3d(18rpx, 22rpx, 0) scale(var(--bottle-enter-scale));
  }

  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(var(--bottle-scale));
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
