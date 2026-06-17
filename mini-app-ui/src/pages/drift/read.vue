<script lang="ts" setup>
import type { DrawDriftBottleResult } from '@/api/drift'
import { computed, ref } from 'vue'
import { getDriftDiscovery } from '@/api/drift'
import AppTopbar from '@/components/AppTopbar.vue'

defineOptions({
  name: 'ReadDriftLetter',
})

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '瓶中尺素',
    navigationBarBackgroundColor: '#eef8fb',
    navigationBarTextStyle: 'black',
  },
})

const showReport = ref(false)
const isLoading = ref(false)
const loadError = ref('')
const emptyVariantKey = ref('')
const discoveryResult = ref<DrawDriftBottleResult>()
const isAudioPlaying = ref(false)
const audioPlayingSeconds = ref(0)
const audioProgress = ref(0)
let audioPlayer: UniNamespace.InnerAudioContext | undefined
let audioTimer: ReturnType<typeof setInterval> | undefined

const moodLabelMap: Record<string, string> = {
  HAPPY: '开心',
  LONELY: '孤独',
  CURIOUS: '好奇',
  CALM: '平静',
  SAD: '低落',
}

const moodTitleMap: Record<string, string> = {
  HAPPY: '一段轻快的浪花',
  LONELY: '来自远方的低语',
  CURIOUS: '一封好奇的海笺',
  CALM: '安静漂来的消息',
  SAD: '需要被听见的声音',
}

const emptyVariants = [
  {
    key: 'quiet',
    visual: 'quiet',
    title: '这片海面暂时很安静',
    copy: '潮水刚刚退去，新的漂流瓶还没有靠近。',
    action: '回到海面再试',
  },
  {
    key: 'crab',
    visual: 'crab',
    title: '捞到一只路过的螃蟹',
    copy: '它夹着海风溜走了，没有带来新的纸条。',
    action: '放它回海里',
  },
  {
    key: 'empty-bottle',
    visual: 'bottle',
    title: '捞到一个空瓶',
    copy: '瓶口只有海盐味，下一只也许就有消息。',
    action: '继续听潮',
  },
] as const

const bottle = computed(() => discoveryResult.value?.bottle)
const discovery = computed(() => discoveryResult.value?.discovery)
const displayTitle = computed(() => bottle.value?.title || moodTitleMap[bottle.value?.mood || ''] || '远方的声音')
const displayTime = computed(() => bottle.value ? formatDriftTime(bottle.value.lastDriftedAt || bottle.value.createdAt) : '')
const displayText = computed(() => bottle.value?.textContent?.trim() || '这只漂流瓶没有留下文字。')
const displayTags = computed(() => {
  const tags = bottle.value?.tags || []

  if (tags.length)
    return tags.map(tag => `#${tag.name}`)

  return bottle.value?.mood ? [`#${moodLabelMap[bottle.value.mood] || '漂流瓶'}`] : ['#漂流瓶']
})
const audioDuration = computed(() => Math.max(0, bottle.value?.mediaDurationSec || 0))
const hasAudio = computed(() => bottle.value?.contentType === 'VOICE' && !!bottle.value.mediaUrl)
const hasImage = computed(() => bottle.value?.contentType === 'IMAGE' && !!bottle.value.mediaUrl)
const emptyVariant = computed(() => {
  return emptyVariants.find(item => item.key === emptyVariantKey.value) || emptyVariants[0]
})

const safetyActions = [
  {
    key: 'return',
    icon: 'i-lucide-waves',
    title: '扔回并反馈',
    message: '已减少同类漂流瓶出现',
  },
  {
    key: 'mute',
    icon: 'i-lucide-user-x',
    title: '屏蔽投递者',
    message: '已屏蔽此投递者',
  },
  {
    key: 'less',
    icon: 'i-lucide-thumbs-down',
    title: '减少类似内容',
    message: '将减少类似内容推荐',
  },
  {
    key: 'evidence',
    icon: 'i-lucide-archive',
    title: '保留凭证',
    message: '已保存此瓶处理凭证',
  },
]

const reportReasons = ['不当内容', '骚扰', '垃圾信息', '诈骗引流']

function reply() {
  uni.showToast({ title: '回信入口待接入', icon: 'none' })
}

function returnSea() {
  const pages = getCurrentPages()

  if (pages.length > 1) {
    uni.navigateBack()
    return
  }

  uni.reLaunch({ url: '/pages/index/index' })
}

function openReport() {
  showReport.value = true
}

function closeReport() {
  showReport.value = false
}

function handleSafetyAction(message: string) {
  showReport.value = false
  uni.showToast({ title: message, icon: 'none' })
}

function submitReport(reason: string) {
  showReport.value = false
  uni.showToast({ title: `已提交：${reason}`, icon: 'none' })
}

function pickEmptyVariant() {
  const index = Math.floor(Math.random() * emptyVariants.length)
  emptyVariantKey.value = emptyVariants[index].key
}

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(safeSeconds / 60)
  const remainSeconds = safeSeconds % 60

  return `${minutes}:${remainSeconds.toString().padStart(2, '0')}`
}

function formatDriftTime(value: string) {
  const time = new Date(value).getTime()

  if (!Number.isFinite(time))
    return '刚刚漂来'

  const diffSeconds = Math.max(0, Math.floor((Date.now() - time) / 1000))

  if (diffSeconds < 60)
    return '刚刚漂来'

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60)
    return `已漂流${diffMinutes}分钟`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24)
    return `已漂流${diffHours}小时`

  return `已漂流${Math.floor(diffHours / 24)}天`
}

function clearAudioTimer() {
  if (!audioTimer)
    return

  clearInterval(audioTimer)
  audioTimer = undefined
}

function updateAudioProgress(currentTime: number) {
  const duration = audioDuration.value

  if (!duration)
    return

  const currentSeconds = Math.min(Math.max(currentTime, 0), duration)
  audioPlayingSeconds.value = Math.floor(currentSeconds)
  audioProgress.value = currentSeconds / duration
}

function startAudioTimer() {
  clearAudioTimer()
  audioTimer = setInterval(() => {
    if (!audioPlayer || audioPlayer.paused)
      return

    updateAudioProgress(audioPlayer.currentTime)
  }, 100)
}

function getAudioPlayer() {
  if (audioPlayer)
    return audioPlayer

  audioPlayer = uni.createInnerAudioContext()
  audioPlayer.onEnded(() => {
    clearAudioTimer()
    updateAudioProgress(audioDuration.value)
    isAudioPlaying.value = false
    setTimeout(() => {
      if (isAudioPlaying.value)
        return

      audioPlayingSeconds.value = 0
      audioProgress.value = 0
    }, 180)
  })
  audioPlayer.onPause(() => {
    clearAudioTimer()
    isAudioPlaying.value = false
  })
  audioPlayer.onStop(() => {
    clearAudioTimer()
    isAudioPlaying.value = false
    audioPlayingSeconds.value = 0
    audioProgress.value = 0
  })
  audioPlayer.onTimeUpdate(() => {
    if (!audioPlayer)
      return

    updateAudioProgress(audioPlayer.currentTime)
  })
  audioPlayer.onError(() => {
    clearAudioTimer()
    isAudioPlaying.value = false
    uni.showToast({ title: '语音播放失败', icon: 'none' })
  })

  return audioPlayer
}

function toggleAudio() {
  if (!bottle.value?.mediaUrl) {
    uni.showToast({ title: '语音地址不存在', icon: 'none' })
    return
  }

  const player = getAudioPlayer()

  if (isAudioPlaying.value) {
    player.pause()
    return
  }

  if (player.src !== bottle.value.mediaUrl)
    player.src = bottle.value.mediaUrl

  audioPlayingSeconds.value = 0
  audioProgress.value = 0
  player.seek(0)
  player.play()
  isAudioPlaying.value = true
  startAudioTimer()
}

function stopAudio() {
  clearAudioTimer()

  if (audioPlayer) {
    audioPlayer.stop()
    audioPlayer.src = ''
  }

  isAudioPlaying.value = false
  audioPlayingSeconds.value = 0
  audioProgress.value = 0
}

async function loadDiscovery(discoveryId?: string, emptyReason?: string) {
  if (emptyReason) {
    loadError.value = emptyReason
    pickEmptyVariant()
    return
  }

  if (!discoveryId) {
    loadError.value = '没有找到这只漂流瓶'
    pickEmptyVariant()
    return
  }

  isLoading.value = true
  loadError.value = ''

  try {
    discoveryResult.value = await getDriftDiscovery(discoveryId)
  }
  catch {
    loadError.value = '漂流瓶已经游远了，请重新捕捞'
    pickEmptyVariant()
  }
  finally {
    isLoading.value = false
  }
}

onLoad((query: Record<string, string | undefined>) => {
  loadDiscovery(query.discoveryId, query.emptyReason ? decodeURIComponent(query.emptyReason) : undefined)
})

onUnload(() => {
  stopAudio()
  audioPlayer?.destroy()
  audioPlayer = undefined
})
</script>

<template>
  <view class="read-page">
    <view class="mist mist-one" />
    <view class="mist mist-two" />

    <AppTopbar title="瓶中" subtitle="来自深海的信息" icon="i-lucide-droplet" variant="transparent" home align="center" :show-icon="false" />

    <view class="content-stage">
      <view v-if="isLoading" class="letter-card state-card">
        <view class="seal">
          <view class="i-lucide-waves seal-icon" />
        </view>
        <text class="letter-title">正在捕捞</text>
        <text class="state-copy">海面正在回传这只漂流瓶。</text>
      </view>

      <view v-else-if="loadError" class="empty-sea-card">
        <view class="empty-visual" :class="[`empty-visual-${emptyVariant.visual}`]" aria-hidden="true">
          <view class="scan-ring ring-one" />
          <view class="scan-ring ring-two" />

          <view v-if="emptyVariant.visual === 'crab'" class="empty-crab">
            <view class="crab-shell" />
            <view class="crab-eye eye-left" />
            <view class="crab-eye eye-right" />
            <view class="crab-claw claw-left" />
            <view class="crab-claw claw-right" />
            <view class="crab-leg leg-one" />
            <view class="crab-leg leg-two" />
            <view class="crab-leg leg-three" />
            <view class="crab-leg leg-four" />
          </view>

          <view v-else-if="emptyVariant.visual === 'bottle'" class="empty-bottle empty-bottle-open">
            <view class="empty-bottle-cork" />
            <view class="empty-bottle-glass">
              <view class="empty-bottle-shine" />
              <view class="empty-bottle-mouth" />
            </view>
          </view>

          <view v-else class="empty-compass">
            <view class="compass-needle" />
            <view class="compass-dot" />
          </view>

          <view v-if="emptyVariant.visual === 'quiet'" class="empty-bottle ghost-bottle">
            <view class="empty-bottle-cork" />
            <view class="empty-bottle-glass">
              <view class="empty-bottle-shine" />
            </view>
          </view>

          <view class="empty-wave wave-one" />
          <view class="empty-wave wave-two" />
          <view class="empty-bubble bubble-one" />
          <view class="empty-bubble bubble-two" />
          <view class="empty-bubble bubble-three" />
        </view>

        <text class="empty-title">{{ emptyVariant.title }}</text>
        <text class="empty-copy">{{ emptyVariant.copy }}</text>
        <text class="empty-reason">{{ loadError }}</text>
        <view class="empty-actions">
          <button class="empty-primary" @tap="returnSea">
            <view class="i-lucide-waves button-icon" />
            <text>{{ emptyVariant.action }}</text>
          </button>
        </view>
      </view>

      <view v-else-if="bottle" class="letter-card">
        <button class="card-report-btn" @tap="openReport">
          <view class="i-lucide-circle-alert report-icon" />
          <text>举报</text>
        </button>
        <view class="seal">
          <view class="i-lucide-waves seal-icon" />
        </view>
        <view class="bottle-line">
          <view class="bottle-neck" />
          <view class="bottle-body">
            <view class="bottle-paper" />
          </view>
        </view>

        <text class="letter-title">{{ displayTitle }}</text>
        <text class="letter-time">{{ displayTime }}</text>
        <text class="quote">“</text>
        <text class="body">
          {{ displayText }}
        </text>

        <view class="tags">
          <text v-for="tag in displayTags" :key="tag">{{ tag }}</text>
        </view>

        <view v-if="hasImage" class="image-card">
          <image class="bottle-image" :src="bottle.mediaUrl || ''" mode="aspectFill" />
        </view>

        <view v-if="hasAudio" class="audio-card">
          <button class="play" @tap="toggleAudio">
            <view :class="isAudioPlaying ? 'i-lucide-pause' : 'i-lucide-play'" class="play-icon" />
          </button>
          <view class="audio-main">
            <view class="bar">
              <view class="progress" :style="{ transform: `scaleX(${audioProgress})` }" />
            </view>
            <view class="audio-time">
              <text>{{ formatDuration(audioPlayingSeconds) }}</text>
              <text>{{ formatDuration(audioDuration) }}</text>
            </view>
          </view>
        </view>

        <view v-if="discovery" class="discover-meta">
          <view class="i-lucide-shell meta-icon" />
          <text>捕捞于 {{ formatDriftTime(discovery.openedAt).replace('已漂流', '') }}</text>
        </view>

        <view class="actions">
          <button class="secondary" @tap="returnSea">
            <view class="i-lucide-waves button-icon" />
            <text>扔回大海</text>
          </button>
          <button class="primary" @tap="reply">
            <view class="i-lucide-message-square button-icon" />
            <text>回信</text>
          </button>
        </view>
      </view>

      <view v-else class="empty-sea-card">
        <view class="empty-visual" aria-hidden="true">
          <view class="scan-ring ring-one" />
          <view class="scan-ring ring-two" />
          <view class="empty-bottle">
            <view class="empty-bottle-cork" />
            <view class="empty-bottle-glass">
              <view class="empty-bottle-shine" />
            </view>
          </view>
          <view class="empty-wave wave-one" />
          <view class="empty-wave wave-two" />
          <view class="empty-bubble bubble-one" />
          <view class="empty-bubble bubble-two" />
          <view class="empty-bubble bubble-three" />
        </view>

        <text class="empty-title">还没有漂流瓶靠岸</text>
        <text class="empty-copy">回到海面，等下一阵潮水送来新的消息。</text>
        <view class="empty-actions">
          <button class="empty-primary" @tap="returnSea">
            <view class="i-lucide-waves button-icon" />
            <text>回到海面</text>
          </button>
        </view>
      </view>

      <view v-if="bottle" class="discard-hint">
        <view class="i-lucide-chevrons-down chevrons" />
        <text>下滑以放弃此笺</text>
      </view>
    </view>

    <view v-if="showReport" class="report-mask" @tap="closeReport">
      <view class="report-sheet" @tap.stop>
        <text class="report-title">遇到了什么问题？</text>
        <text class="report-copy">安全是我们的首要任务。你可以先处理此瓶，也可以继续提交举报。</text>

        <view class="safety-grid">
          <button
            v-for="item in safetyActions"
            :key="item.key"
            class="safety-action"
            @tap="handleSafetyAction(item.message)"
          >
            <view :class="item.icon" class="safety-icon" />
            <text>{{ item.title }}</text>
          </button>
        </view>

        <view class="report-divider" />
        <text class="report-section-title">举报原因</text>
        <button
          v-for="reason in reportReasons"
          :key="reason"
          class="report-option"
          @tap="submitReport(reason)"
        >
          {{ reason }}
        </button>
        <button class="cancel-option" @tap="closeReport">
          取消
        </button>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.read-page {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
  padding: 28rpx 36rpx 72rpx;
  background:
    radial-gradient(circle at 48% 6%, rgba(255, 255, 255, 0.88), transparent 20%),
    radial-gradient(circle at 8% 24%, rgba(173, 232, 244, 0.46), transparent 24%),
    linear-gradient(180deg, #f5fbfd 0%, #eef8fb 46%, #e8f5f8 100%);
  box-sizing: border-box;
}

.mist {
  position: absolute;
  border-radius: 999rpx;
  pointer-events: none;
}

.mist-one {
  top: 150rpx;
  right: -130rpx;
  width: 270rpx;
  height: 270rpx;
  background: rgba(173, 232, 244, 0.3);
}

.mist-two {
  left: -140rpx;
  bottom: 260rpx;
  width: 310rpx;
  height: 310rpx;
  background: rgba(148, 204, 255, 0.2);
}

.content-stage {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: center;
  transform: translateY(-5vh);
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  margin: 0;
  padding: 0;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.72);
  color: rgba(0, 93, 144, 0.76);
  font-size: 34rpx;
  line-height: 56rpx;
  box-shadow: 0 10rpx 28rpx rgba(0, 119, 182, 0.08);
}

.nav-icon {
  width: 28rpx;
  height: 28rpx;
  font-size: 28rpx;
}

.nav-btn::after,
.card-report-btn::after,
.play::after,
.actions button::after,
.safety-action::after,
.report-option::after,
.cancel-option::after {
  border: 0;
}

.letter-card {
  position: relative;
  z-index: 2;
  margin-top: 0;
  padding: 56rpx 42rpx 34rpx;
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 24rpx 74rpx rgba(0, 119, 182, 0.08);
  box-sizing: border-box;
}

.state-card {
  min-height: 360rpx;
}

.state-copy {
  display: block;
  margin-top: 32rpx;
  color: rgba(64, 72, 80, 0.72);
  font-size: 27rpx;
  line-height: 1.55;
}

.empty-sea-card {
  position: relative;
  z-index: 2;
  overflow: hidden;
  min-height: 560rpx;
  padding: 52rpx 40rpx 42rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 34rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(237, 248, 251, 0.84) 100%);
  box-shadow: 0 24rpx 74rpx rgba(0, 119, 182, 0.1);
  box-sizing: border-box;
}

.empty-sea-card::before {
  position: absolute;
  right: -120rpx;
  bottom: -90rpx;
  width: 320rpx;
  height: 220rpx;
  border-radius: 50%;
  background: rgba(0, 119, 182, 0.08);
  content: '';
}

.empty-visual {
  position: relative;
  width: 260rpx;
  height: 230rpx;
  margin: 8rpx auto 38rpx;
}

.empty-visual-crab .scan-ring {
  border-color: rgba(210, 140, 75, 0.22);
}

.empty-visual-bottle .scan-ring {
  border-color: rgba(0, 119, 182, 0.2);
}

.scan-ring {
  position: absolute;
  inset: 50rpx 30rpx 10rpx;
  border: 2rpx solid rgba(0, 119, 182, 0.22);
  border-radius: 50%;
  animation: empty-scan 2.8s ease-out infinite;
}

.ring-two {
  animation-delay: 1.15s;
}

.empty-bottle {
  position: absolute;
  top: 52rpx;
  left: 92rpx;
  width: 82rpx;
  height: 126rpx;
  transform: rotate(-17deg);
  animation: empty-bottle-float 3.4s ease-in-out infinite;
}

.ghost-bottle {
  opacity: 0.34;
  transform: rotate(-24deg) scale(0.82);
  animation: empty-ghost-bottle 4s ease-in-out infinite;
}

.empty-bottle-open {
  top: 46rpx;
  transform: rotate(16deg);
}

.empty-bottle-cork {
  width: 26rpx;
  height: 36rpx;
  margin: 0 auto -2rpx;
  border-radius: 10rpx 10rpx 4rpx 4rpx;
  background: #9a6a3a;
  box-shadow: inset 8rpx 0 0 rgba(255, 255, 255, 0.18);
}

.empty-bottle-glass {
  position: relative;
  width: 72rpx;
  height: 86rpx;
  margin: 0 auto;
  border: 5rpx solid rgba(0, 119, 182, 0.42);
  border-radius: 18rpx 18rpx 24rpx 24rpx;
  background: linear-gradient(135deg, rgba(173, 232, 244, 0.58), rgba(255, 255, 255, 0.38));
  box-shadow: 0 18rpx 30rpx rgba(0, 119, 182, 0.12);
  box-sizing: border-box;
}

.empty-bottle-shine {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  width: 10rpx;
  height: 42rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.72);
}

.empty-bottle-mouth {
  position: absolute;
  right: 10rpx;
  bottom: 12rpx;
  width: 26rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background: rgba(0, 93, 144, 0.16);
}

.empty-compass {
  position: absolute;
  top: 72rpx;
  left: 82rpx;
  width: 98rpx;
  height: 98rpx;
  border: 4rpx solid rgba(0, 119, 182, 0.22);
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.5);
  animation: empty-compass-drift 3.6s ease-in-out infinite;
}

.compass-needle {
  position: absolute;
  top: 18rpx;
  left: 45rpx;
  width: 8rpx;
  height: 62rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #d28c4b 0%, #0077b6 100%);
  transform: rotate(32deg);
  transform-origin: center;
}

.compass-dot {
  position: absolute;
  top: 41rpx;
  left: 41rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 999rpx;
  background: #fff;
  box-shadow: 0 0 0 4rpx rgba(0, 119, 182, 0.16);
}

.empty-crab {
  position: absolute;
  top: 84rpx;
  left: 72rpx;
  width: 120rpx;
  height: 88rpx;
  animation: empty-crab-walk 2.8s ease-in-out infinite;
}

.crab-shell {
  position: absolute;
  top: 28rpx;
  left: 22rpx;
  width: 76rpx;
  height: 50rpx;
  border-radius: 46rpx 46rpx 30rpx 30rpx;
  background: #d28c4b;
  box-shadow:
    inset 0 10rpx 0 rgba(255, 255, 255, 0.2),
    0 14rpx 24rpx rgba(142, 78, 20, 0.16);
}

.crab-eye {
  position: absolute;
  top: 14rpx;
  width: 12rpx;
  height: 24rpx;
  border-radius: 999rpx;
  background: #8e4e14;
}

.crab-eye::after {
  position: absolute;
  top: -6rpx;
  left: -4rpx;
  width: 20rpx;
  height: 20rpx;
  border-radius: 999rpx;
  background: #fff;
  box-shadow: inset 5rpx -5rpx 0 #161d1f;
  content: '';
}

.eye-left {
  left: 42rpx;
}

.eye-right {
  right: 42rpx;
}

.crab-claw {
  position: absolute;
  top: 34rpx;
  width: 34rpx;
  height: 34rpx;
  border: 8rpx solid #d28c4b;
  border-bottom-color: transparent;
  border-radius: 999rpx;
}

.claw-left {
  left: -4rpx;
  transform: rotate(-34deg);
}

.claw-right {
  right: -4rpx;
  transform: rotate(34deg);
}

.crab-leg {
  position: absolute;
  bottom: 0;
  width: 34rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background: #c77c3f;
  transform-origin: right center;
  animation: empty-crab-leg 0.9s ease-in-out infinite;
}

.leg-one {
  left: 18rpx;
  transform: rotate(26deg);
}

.leg-two {
  left: 30rpx;
  animation-delay: 0.2s;
  transform: rotate(10deg);
}

.leg-three {
  right: 30rpx;
  animation-delay: 0.1s;
  transform: rotate(170deg);
}

.leg-four {
  right: 18rpx;
  animation-delay: 0.3s;
  transform: rotate(154deg);
}

.empty-wave {
  position: absolute;
  left: 44rpx;
  right: 44rpx;
  height: 16rpx;
  border: 3rpx solid rgba(0, 119, 182, 0.28);
  border-top: 0;
  border-radius: 0 0 999rpx 999rpx;
  animation: empty-wave-drift 2.6s ease-in-out infinite;
}

.wave-one {
  bottom: 44rpx;
}

.wave-two {
  right: 66rpx;
  bottom: 20rpx;
  left: 66rpx;
  opacity: 0.58;
  animation-delay: 0.6s;
}

.empty-bubble {
  position: absolute;
  border: 2rpx solid rgba(0, 119, 182, 0.26);
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.4);
  animation: empty-bubble-rise 3.2s ease-in-out infinite;
}

.bubble-one {
  right: 42rpx;
  bottom: 58rpx;
  width: 14rpx;
  height: 14rpx;
}

.bubble-two {
  bottom: 88rpx;
  left: 48rpx;
  width: 18rpx;
  height: 18rpx;
  animation-delay: 0.7s;
}

.bubble-three {
  top: 44rpx;
  right: 72rpx;
  width: 10rpx;
  height: 10rpx;
  animation-delay: 1.3s;
}

.empty-title,
.empty-copy {
  position: relative;
  display: block;
  text-align: center;
}

.empty-title {
  color: #005d90;
  font-size: 32rpx;
  font-weight: 900;
  line-height: 1.25;
}

.empty-copy {
  max-width: 500rpx;
  margin: 18rpx auto 0;
  color: rgba(64, 72, 80, 0.68);
  font-size: 25rpx;
  line-height: 1.58;
}

.empty-reason {
  position: relative;
  display: block;
  margin-top: 16rpx;
  color: rgba(0, 93, 144, 0.5);
  font-size: 21rpx;
  font-weight: 700;
  line-height: 1.4;
  text-align: center;
}

.empty-actions {
  position: relative;
  margin-top: 42rpx;
}

.empty-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  width: 100%;
  height: 88rpx;
  margin: 0;
  padding: 0 20rpx;
  border-radius: 14rpx;
  background: #0077b6;
  color: #fff;
  font-size: 24rpx;
  font-weight: 900;
  line-height: 1;
  box-shadow: 0 18rpx 38rpx rgba(0, 119, 182, 0.18);
}

.empty-primary::after {
  border: 0;
}

.card-report-btn {
  position: absolute;
  top: 34rpx;
  right: 34rpx;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 54rpx;
  margin: 0;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 246, 232, 0.92);
  color: #8e4e14;
  font-size: 22rpx;
  font-weight: 800;
  line-height: 1;
  box-shadow: 0 10rpx 24rpx rgba(142, 78, 20, 0.1);
}

.report-icon {
  width: 24rpx;
  height: 24rpx;
  font-size: 24rpx;
}

.seal {
  position: absolute;
  top: 42rpx;
  left: 42rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54rpx;
  height: 54rpx;
  border-radius: 999rpx;
  background: #ffe8d2;
  color: #8e4e14;
  font-size: 26rpx;
  font-weight: 700;
}

.seal-icon {
  width: 28rpx;
  height: 28rpx;
  font-size: 28rpx;
}

.bottle-line {
  position: absolute;
  top: 92rpx;
  right: 34rpx;
  width: 78rpx;
  height: 100rpx;
  opacity: 0.18;
  transform: rotate(-2deg);
}

.bottle-neck {
  width: 24rpx;
  height: 36rpx;
  margin: 0 auto -2rpx;
  border: 6rpx solid #5d594e;
  border-bottom: 0;
  border-radius: 8rpx 8rpx 0 0;
}

.bottle-body {
  position: relative;
  width: 66rpx;
  height: 68rpx;
  margin: 0 auto;
  border: 6rpx solid #5d594e;
  border-radius: 14rpx;
  box-sizing: border-box;
}

.bottle-paper {
  position: absolute;
  right: 10rpx;
  bottom: 10rpx;
  width: 20rpx;
  height: 30rpx;
  border: 5rpx solid #5d594e;
}

.letter-title,
.letter-time,
.quote,
.body {
  display: block;
}

.letter-title {
  margin-left: 72rpx;
  color: #8e4e14;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 1.2;
}

.letter-time {
  margin-top: 4rpx;
  margin-left: 72rpx;
  color: rgba(64, 72, 80, 0.56);
  font-size: 21rpx;
  line-height: 1.2;
}

.quote {
  margin-top: 16rpx;
  color: rgba(0, 119, 182, 0.18);
  font-size: 70rpx;
  line-height: 0.74;
}

.body {
  margin-top: -4rpx;
  color: #161d1f;
  font-size: 29rpx;
  font-style: italic;
  line-height: 1.58;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 36rpx;
}

.tags text {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(0, 119, 182, 0.08);
  color: rgba(0, 93, 144, 0.72);
  font-size: 20rpx;
  font-weight: 700;
}

.audio-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-top: 48rpx;
}

.play {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 999rpx;
  background: #0077b6;
  color: #fff;
  font-size: 24rpx;
  line-height: 1;
  box-shadow: 0 12rpx 26rpx rgba(0, 119, 182, 0.18);
}

.play-icon {
  width: 24rpx;
  height: 24rpx;
  margin-left: 4rpx;
  font-size: 24rpx;
}

.audio-main {
  flex: 1;
  min-width: 0;
}

.bar {
  height: 5rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: rgba(0, 93, 144, 0.24);
}

.progress {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: #0077b6;
  transform-origin: left center;
}

.audio-time {
  display: flex;
  justify-content: space-between;
  margin-top: 8rpx;
  color: rgba(64, 72, 80, 0.5);
  font-size: 20rpx;
}

.image-card {
  margin-top: 36rpx;
  overflow: hidden;
  border-radius: 16rpx;
  background: rgba(0, 93, 144, 0.08);
}

.bottle-image {
  display: block;
  width: 100%;
  height: 360rpx;
}

.discover-meta {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: 28rpx;
  color: rgba(64, 72, 80, 0.56);
  font-size: 21rpx;
  font-weight: 700;
}

.meta-icon {
  width: 24rpx;
  height: 24rpx;
  color: rgba(0, 119, 182, 0.52);
  font-size: 24rpx;
}

.actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22rpx;
  margin-top: 58rpx;
}

.single-action {
  grid-template-columns: minmax(0, 1fr);
}

.actions button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  height: 92rpx;
  margin: 0;
  padding: 0 18rpx;
  border-radius: 14rpx;
  font-size: 23rpx;
  font-weight: 800;
  line-height: 1;
}

.secondary {
  background: rgba(237, 248, 251, 0.92);
  color: #005d90;
}

.primary {
  background: linear-gradient(135deg, #0077b6 0%, #5f9fb3 48%, #d28c4b 100%);
  color: #fff;
  box-shadow: 0 18rpx 38rpx rgba(0, 119, 182, 0.2);
}

.button-icon {
  width: 27rpx;
  height: 27rpx;
  font-size: 27rpx;
  line-height: 1;
}

.discard-hint {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 64rpx;
  color: rgba(0, 93, 144, 0.45);
  font-size: 21rpx;
}

.chevrons {
  margin-bottom: 18rpx;
  color: rgba(0, 119, 182, 0.48);
  font-size: 30rpx;
  line-height: 1;
}

.report-mask {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: flex-end;
  padding: 0 28rpx 28rpx;
  background: rgba(0, 38, 58, 0.22);
  box-sizing: border-box;
}

.report-sheet {
  width: 100%;
  padding: 34rpx 28rpx 26rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 26rpx 74rpx rgba(0, 38, 58, 0.18);
  box-sizing: border-box;
}

.report-title,
.report-copy {
  display: block;
  text-align: center;
}

.report-title {
  color: #161d1f;
  font-size: 30rpx;
  font-weight: 800;
}

.report-copy {
  margin: 12rpx auto 26rpx;
  max-width: 560rpx;
  color: rgba(64, 72, 80, 0.72);
  font-size: 24rpx;
  line-height: 1.5;
}

.safety-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
}

.safety-action {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12rpx;
  height: 78rpx;
  margin: 0;
  padding: 0 18rpx;
  border-radius: 16rpx;
  background: rgba(237, 248, 251, 0.92);
  color: #005d90;
  font-size: 23rpx;
  font-weight: 800;
  line-height: 1;
}

.safety-icon {
  flex: 0 0 auto;
  width: 28rpx;
  height: 28rpx;
  color: #0077b6;
  font-size: 28rpx;
}

.report-divider {
  height: 1rpx;
  margin: 26rpx 0 20rpx;
  background: rgba(0, 93, 144, 0.1);
}

.report-section-title {
  display: block;
  color: rgba(64, 72, 80, 0.72);
  font-size: 23rpx;
  font-weight: 800;
}

.report-option,
.cancel-option {
  height: 78rpx;
  margin: 12rpx 0 0;
  border-radius: 16rpx;
  font-size: 27rpx;
  line-height: 78rpx;
}

.report-option {
  background: rgba(186, 26, 26, 0.06);
  color: #93000a;
}

.cancel-option {
  background: rgba(0, 119, 182, 0.08);
  color: #005d90;
  font-weight: 700;
}

@keyframes empty-scan {
  0% {
    opacity: 0;
    transform: scale(0.42);
  }

  34% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: scale(1.22);
  }
}

@keyframes empty-bottle-float {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotate(-17deg);
  }

  50% {
    transform: translate3d(0, -16rpx, 0) rotate(-10deg);
  }
}

@keyframes empty-ghost-bottle {
  0%,
  100% {
    transform: translate3d(-10rpx, 0, 0) rotate(-24deg) scale(0.82);
  }

  50% {
    transform: translate3d(8rpx, -12rpx, 0) rotate(-18deg) scale(0.82);
  }
}

@keyframes empty-compass-drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotate(-6deg);
  }

  50% {
    transform: translate3d(0, -12rpx, 0) rotate(6deg);
  }
}

@keyframes empty-crab-walk {
  0%,
  100% {
    transform: translate3d(-10rpx, 0, 0);
  }

  50% {
    transform: translate3d(12rpx, -4rpx, 0);
  }
}

@keyframes empty-crab-leg {
  0%,
  100% {
    opacity: 0.72;
  }

  50% {
    opacity: 1;
  }
}

@keyframes empty-wave-drift {
  0%,
  100% {
    transform: translateX(-10rpx);
  }

  50% {
    transform: translateX(10rpx);
  }
}

@keyframes empty-bubble-rise {
  0% {
    opacity: 0;
    transform: translate3d(0, 18rpx, 0) scale(0.72);
  }

  30% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translate3d(0, -44rpx, 0) scale(1);
  }
}
</style>
