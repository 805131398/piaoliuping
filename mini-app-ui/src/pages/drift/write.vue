<script lang="ts" setup>
import { ref } from 'vue'
import AppTopbar from '@/components/AppTopbar.vue'

defineOptions({
  name: 'WriteDriftLetter',
})

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '写漂流瓶',
    navigationBarBackgroundColor: '#eef8fb',
    navigationBarTextStyle: 'black',
  },
})

const letterContent = ref('')
const mood = ref('开心')
const moods = ['开心', '孤独', '好奇']
const showDistance = ref(false)
const maxVoiceDuration = 60
const recorderManager = uni.getRecorderManager()
const isRecording = ref(false)
const recordingSeconds = ref(0)
const voiceFilePath = ref('')
const voiceDuration = ref(0)
const isVoicePlaying = ref(false)
const voicePlayingSeconds = ref(0)
const voicePlayingProgress = ref(0)
const imageFilePath = ref('')
let recordingTimer: ReturnType<typeof setInterval> | undefined
let voicePlayer: UniNamespace.InnerAudioContext | undefined
let voicePlayingTimer: ReturnType<typeof setInterval> | undefined

interface VoiceRecordResult {
  tempFilePath?: string
  duration?: number
}

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(safeSeconds / 60)
  const remainSeconds = safeSeconds % 60

  return `${minutes}:${remainSeconds.toString().padStart(2, '0')}`
}

function resetVoiceRecord() {
  stopVoicePreview()
  voiceFilePath.value = ''
  voiceDuration.value = 0
  recordingSeconds.value = 0
  voicePlayingSeconds.value = 0
  voicePlayingProgress.value = 0
}

function clearRecordingTimer() {
  if (!recordingTimer)
    return

  clearInterval(recordingTimer)
  recordingTimer = undefined
}

function startRecordingTimer() {
  clearRecordingTimer()
  recordingSeconds.value = 0
  recordingTimer = setInterval(() => {
    recordingSeconds.value = Math.min(recordingSeconds.value + 1, maxVoiceDuration)
  }, 1000)
}

function startVoiceRecord() {
  resetVoiceRecord()

  recorderManager.start({
    duration: maxVoiceDuration * 1000,
    sampleRate: 16000,
    numberOfChannels: 1,
    encodeBitRate: 48000,
    format: 'mp3',
  })
}

function stopVoiceRecord() {
  recorderManager.stop()
}

function toggleVoiceRecord() {
  if (isRecording.value) {
    stopVoiceRecord()
    return
  }

  startVoiceRecord()
}

function clearVoicePlayingTimer() {
  if (!voicePlayingTimer)
    return

  clearInterval(voicePlayingTimer)
  voicePlayingTimer = undefined
}

function getVoicePlayer() {
  if (voicePlayer)
    return voicePlayer

  voicePlayer = uni.createInnerAudioContext()
  voicePlayer.onEnded(() => {
    clearVoicePlayingTimer()
    updateVoicePlayingProgress(voiceDuration.value)
    isVoicePlaying.value = false
    setTimeout(() => {
      if (isVoicePlaying.value)
        return

      voicePlayingSeconds.value = 0
      voicePlayingProgress.value = 0
    }, 180)
  })
  voicePlayer.onStop(() => {
    clearVoicePlayingTimer()
    isVoicePlaying.value = false
    voicePlayingSeconds.value = 0
    voicePlayingProgress.value = 0
  })
  voicePlayer.onPause(() => {
    clearVoicePlayingTimer()
    isVoicePlaying.value = false
  })
  voicePlayer.onTimeUpdate(() => {
    if (!voicePlayer)
      return

    updateVoicePlayingProgress(voicePlayer.currentTime)
  })
  voicePlayer.onError(() => {
    clearVoicePlayingTimer()
    isVoicePlaying.value = false
    voicePlayingSeconds.value = 0
    voicePlayingProgress.value = 0
    uni.showToast({ title: '试听播放失败', icon: 'none' })
  })

  return voicePlayer
}

function updateVoicePlayingProgress(currentTime: number) {
  const duration = voiceDuration.value

  if (!duration)
    return

  const currentSeconds = Math.min(Math.max(currentTime, 0), duration)
  voicePlayingSeconds.value = Math.floor(currentSeconds)
  voicePlayingProgress.value = currentSeconds / duration
}

function startVoicePlayingTimer() {
  clearVoicePlayingTimer()
  voicePlayingTimer = setInterval(() => {
    if (!voicePlayer || voicePlayer.paused)
      return

    updateVoicePlayingProgress(voicePlayer.currentTime)
  }, 100)
}

function stopVoicePreview() {
  clearVoicePlayingTimer()

  if (voicePlayer) {
    voicePlayer.stop()
    voicePlayer.src = ''
  }

  isVoicePlaying.value = false
  voicePlayingSeconds.value = 0
  voicePlayingProgress.value = 0
}

function toggleVoicePreview() {
  if (!voiceFilePath.value) {
    uni.showToast({ title: '请先录制语音', icon: 'none' })
    return
  }

  const player = getVoicePlayer()

  if (isVoicePlaying.value) {
    player.pause()
    return
  }

  voicePlayingSeconds.value = 0
  voicePlayingProgress.value = 0
  if (player.src !== voiceFilePath.value)
    player.src = voiceFilePath.value

  player.seek(0)
  player.play()
  isVoicePlaying.value = true
  startVoicePlayingTimer()
}

function chooseBottleImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      imageFilePath.value = res.tempFilePaths[0] || ''
    },
    fail: () => {
      uni.showToast({ title: '图片添加失败', icon: 'none' })
    },
  })
}

function removeBottleImage() {
  imageFilePath.value = ''
}

function handleMoodChange(event: { detail: { value: number | string } }) {
  mood.value = moods[Number(event.detail.value)] || mood.value
}

function toggleDistance() {
  showDistance.value = !showDistance.value
}

recorderManager.onStart(() => {
  isRecording.value = true
  startRecordingTimer()
})

recorderManager.onStop((result: VoiceRecordResult) => {
  clearRecordingTimer()
  isRecording.value = false

  if (!result.tempFilePath) {
    uni.showToast({ title: '录音文件生成失败', icon: 'none' })
    return
  }

  voiceFilePath.value = result.tempFilePath
  voiceDuration.value = result.duration ? Math.ceil(result.duration / 1000) : recordingSeconds.value
})

recorderManager.onError(() => {
  clearRecordingTimer()
  isRecording.value = false
  uni.showToast({ title: '录音失败，请检查麦克风权限', icon: 'none' })
})

onUnload(() => {
  clearRecordingTimer()
  stopVoicePreview()
  voicePlayer?.destroy()
  voicePlayer = undefined

  if (isRecording.value)
    recorderManager.stop()
})

function submitBottle() {
  if (!letterContent.value.trim() && !voiceFilePath.value && !imageFilePath.value) {
    uni.showToast({ title: '请至少留下一段内容', icon: 'none' })
    return
  }

  uni.showToast({ title: '已投递', icon: 'success' })
}
</script>

<template>
  <view class="write-page">
    <AppTopbar title="写漂流瓶" subtitle="留下些什么，让远方的人遇见" home align="center" :show-icon="false" />

    <view class="mode-card">
      <view class="rich-editor" :class="[isRecording && 'recording']">
        <scroll-view class="editor-body" scroll-y>
          <textarea
            v-model="letterContent"
            class="letter-input"
            :maxlength="500"
            auto-height
            placeholder="写下想被看见的内容，也可以添加语音或图片。"
          />

          <view v-if="isRecording" class="voice-recording-inline">
            <view class="recording-dot" />
            <text>{{ formatDuration(recordingSeconds) }} / {{ formatDuration(maxVoiceDuration) }}</text>
            <view class="recording-wave inline-wave">
              <view v-for="item in 5" :key="item" class="wave-bar" />
            </view>
          </view>

          <view v-if="voiceFilePath" class="voice-preview">
            <button class="preview-play" @tap.stop="toggleVoicePreview">
              <view :class="isVoicePlaying ? 'i-lucide-pause' : 'i-lucide-play'" class="preview-play-icon" />
            </button>
            <view class="preview-main">
              <view class="preview-header">
                <text class="preview-title">试听录音</text>
                <text class="preview-time">
                  {{ formatDuration(voicePlayingSeconds) }} / {{ formatDuration(voiceDuration) }}
                </text>
              </view>
              <view class="preview-progress">
                <view
                  class="preview-progress-bar"
                  :style="{ transform: `scaleX(${voicePlayingProgress})` }"
                />
              </view>
            </view>
          </view>

          <view v-if="imageFilePath" class="image-preview">
            <image class="image-preview-media" :src="imageFilePath" mode="aspectFill" />
            <view class="image-actions">
              <button class="image-action" @tap="chooseBottleImage">
                更换图片
              </button>
              <button class="image-delete" @tap="removeBottleImage">
                <view class="i-lucide-trash-2 image-delete-icon" />
              </button>
            </view>
          </view>
        </scroll-view>

        <view class="editor-toolbar">
          <button
            class="tool-btn"
            :class="[isRecording && 'active']"
            @tap="toggleVoiceRecord"
          >
            <view class="i-lucide-mic tool-icon" />
          </button>
          <button class="tool-btn" @tap="chooseBottleImage">
            <view class="i-lucide-image tool-icon" />
          </button>
          <picker :range="moods" :value="moods.indexOf(mood)" @change="handleMoodChange">
            <view class="tool-chip">
              <view class="i-lucide-smile tool-icon" />
              <text>{{ mood }}</text>
            </view>
          </picker>
          <button
            class="tool-chip distance-chip"
            :class="[showDistance && 'active']"
            @tap="toggleDistance"
          >
            <view class="i-lucide-map-pin tool-icon" />
            <text>距离</text>
          </button>
        </view>
      </view>
    </view>

    <button class="send-btn" @tap="submitBottle">
      投递漂流瓶
    </button>
  </view>
</template>

<style scoped lang="scss">
.write-page {
  min-height: 100vh;
  padding: 0 28rpx 128rpx;
  background:
    radial-gradient(circle at 88% 4%, rgba(244, 162, 97, 0.2), transparent 30%),
    linear-gradient(180deg, #ade8f4 0%, #f4fafd 54%, #f1e9db 100%);
  box-sizing: border-box;
}

.mode-card {
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 32rpx;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.58);
  box-shadow: 0 18rpx 56rpx rgba(0, 119, 182, 0.08);
}

.rich-editor {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - var(--status-bar-height) - 430rpx);
  overflow: hidden;
  border: 1rpx solid rgba(188, 154, 102, 0.28);
  border-radius: 28rpx;
  background:
    linear-gradient(90deg, transparent 0 40rpx, rgba(231, 101, 75, 0.28) 40rpx 42rpx, transparent 42rpx),
    repeating-linear-gradient(180deg, transparent 0 50rpx, rgba(0, 119, 182, 0.16) 51rpx 53rpx),
    linear-gradient(180deg, rgba(255, 252, 240, 0.96), rgba(250, 244, 226, 0.9));
  box-shadow:
    inset 0 0 0 1rpx rgba(255, 255, 255, 0.58),
    0 12rpx 30rpx rgba(120, 91, 46, 0.08);
}

.rich-editor.recording {
  border-color: rgba(231, 101, 75, 0.5);
}

.editor-body {
  flex: 1 1 auto;
  min-height: 300rpx;
  max-height: calc(100vh - var(--status-bar-height) - 534rpx);
  box-sizing: border-box;
}

/* #ifdef MP-WEIXIN */
.rich-editor {
  max-height: calc(100vh - var(--status-bar-height) - 480rpx);
}

.editor-body {
  max-height: calc(100vh - var(--status-bar-height) - 584rpx);
}
/* #endif */

.letter-input {
  width: 100%;
  min-height: 300rpx;
  padding: 26rpx;
  padding-left: 54rpx;
  background: transparent;
  color: #161d1f;
  font-size: 29rpx;
  line-height: 1.65;
  box-sizing: border-box;
}

.editor-toolbar {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 14rpx;
  flex-wrap: wrap;
  padding: 18rpx 24rpx 22rpx;
  border-top: 1rpx solid rgba(0, 119, 182, 0.1);
  background: rgba(255, 255, 255, 0.38);
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  margin: 0;
  padding: 0;
  border-radius: 999rpx;
  background: rgba(0, 119, 182, 0.1);
  color: #005d90;
  line-height: 1;
}

.tool-btn.active {
  background: linear-gradient(135deg, #e7654b, #f4a261);
  color: #fff;
}

.tool-chip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  height: 64rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: rgba(0, 119, 182, 0.1);
  color: #005d90;
  font-size: 24rpx;
  font-weight: 800;
  line-height: 1;
  box-sizing: border-box;
}

.tool-chip.active {
  background: rgba(0, 119, 182, 0.16);
  color: #003f63;
}

.distance-chip {
  margin: 0;
}

.tool-btn::after,
.distance-chip::after {
  border: 0;
}

.tool-icon {
  width: 32rpx;
  height: 32rpx;
}

.recording-wave {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 42rpx;
  margin-top: 4rpx;
}

.voice-recording-inline {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin: 0 24rpx 18rpx 54rpx;
  padding: 14rpx 18rpx;
  border-radius: 18rpx;
  background: rgba(231, 101, 75, 0.1);
  color: #a43f2d;
  font-size: 24rpx;
  font-weight: 800;
}

.recording-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 999rpx;
  background: #e7654b;
  box-shadow: 0 0 0 8rpx rgba(231, 101, 75, 0.1);
}

.inline-wave {
  height: 32rpx;
  margin-top: 0;
  margin-left: auto;
}

.wave-bar {
  width: 8rpx;
  height: 18rpx;
  border-radius: 999rpx;
  background: #e7654b;
  animation: voice-wave 1s ease-in-out infinite;
}

.wave-bar:nth-child(2) {
  animation-delay: 0.12s;
}

.wave-bar:nth-child(3) {
  animation-delay: 0.24s;
}

.wave-bar:nth-child(4) {
  animation-delay: 0.36s;
}

.wave-bar:nth-child(5) {
  animation-delay: 0.48s;
}

.voice-preview {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin: 0 24rpx 18rpx 54rpx;
  padding: 20rpx;
  border: 1rpx solid rgba(0, 119, 182, 0.16);
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 10rpx 28rpx rgba(0, 119, 182, 0.08);
}

.preview-play {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 64rpx;
  width: 64rpx;
  height: 64rpx;
  margin: 0;
  padding: 0;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #0077b6, #94ccff);
  color: #fff;
  line-height: 1;
}

.preview-play::after {
  border: 0;
}

.preview-play-icon {
  width: 32rpx;
  height: 32rpx;
}

.preview-main {
  flex: 1;
  min-width: 0;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.preview-title {
  color: #161d1f;
  font-size: 27rpx;
  font-weight: 700;
}

.preview-time {
  flex: 0 0 auto;
  color: #404850;
  font-size: 23rpx;
  font-weight: 600;
}

.preview-progress {
  height: 10rpx;
  margin-top: 14rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: rgba(0, 119, 182, 0.12);
}

.preview-progress-bar {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0077b6, #4cc9a6);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.1s linear;
  will-change: transform;
}

.image-preview {
  position: relative;
  min-height: 280rpx;
  margin: 0 24rpx 18rpx 54rpx;
  overflow: hidden;
  border-radius: 28rpx;
  background: rgba(244, 250, 253, 0.56);
  box-shadow: 0 12rpx 30rpx rgba(0, 119, 182, 0.1);
}

.image-preview-media {
  display: block;
  width: 100%;
  height: 320rpx;
}

.image-actions {
  position: absolute;
  right: 18rpx;
  bottom: 18rpx;
  display: flex;
  gap: 12rpx;
  align-items: center;
}

.image-action {
  height: 56rpx;
  margin: 0;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.9);
  color: #005d90;
  font-size: 24rpx;
  font-weight: 800;
  line-height: 56rpx;
}

.image-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  margin: 0;
  padding: 0;
  border-radius: 999rpx;
  background: rgba(231, 101, 75, 0.94);
  color: #fff;
  line-height: 1;
}

.image-action::after,
.image-delete::after {
  border: 0;
}

.image-delete-icon {
  width: 28rpx;
  height: 28rpx;
}

.send-btn {
  height: 96rpx;
  margin-top: 34rpx;
  border-radius: 26rpx;
  background: linear-gradient(135deg, #0077b6, #f4a261);
  color: #fff;
  font-size: 33rpx;
  font-weight: 700;
  line-height: 96rpx;
  box-shadow: 0 18rpx 44rpx rgba(0, 119, 182, 0.22);
}

@keyframes voice-wave {
  0%,
  100% {
    height: 16rpx;
  }

  50% {
    height: 40rpx;
  }
}
</style>
