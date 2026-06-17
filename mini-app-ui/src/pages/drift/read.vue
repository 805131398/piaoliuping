<script lang="ts" setup>
import { ref } from 'vue'
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
</script>

<template>
  <view class="read-page">
    <view class="mist mist-one" />
    <view class="mist mist-two" />

    <AppTopbar title="瓶中" subtitle="来自深海的信息" icon="i-lucide-droplet" variant="transparent" home align="center" :show-icon="false"/>

    <view class="content-stage">
      <view class="letter-card">
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

        <text class="letter-title">远方的声音</text>
        <text class="letter-time">已漂流4天</text>
        <text class="quote">“</text>
        <text class="body">
          Sometimes the hardest part of the journey is not the mountain itself, but the pebbles in your shoes. I hope whoever finds this remembers to take a breath today. You're doing better than you think.
        </text>

        <view class="tags">
          <text>#Dreams</text>
          <text>#Reflection</text>
        </view>

        <view class="audio-card">
          <view class="play">
            <view class="i-lucide-play play-icon" />
          </view>
          <view class="audio-main">
            <view class="bar">
              <view class="progress" />
            </view>
            <view class="audio-time">
              <text>0:14</text>
              <text>0:42</text>
            </view>
          </view>
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

      <view class="discard-hint">
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
  width: 34%;
  height: 100%;
  border-radius: inherit;
  background: #0077b6;
}

.audio-time {
  display: flex;
  justify-content: space-between;
  margin-top: 8rpx;
  color: rgba(64, 72, 80, 0.5);
  font-size: 20rpx;
}

.actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22rpx;
  margin-top: 58rpx;
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
</style>
