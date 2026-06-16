<script lang="ts" setup>
import { ref } from 'vue'

defineOptions({
  name: 'WriteDriftLetter',
})

definePage({
  style: {
    navigationBarTitleText: '寄海笺',
    navigationBarBackgroundColor: '#eef8fb',
    navigationBarTextStyle: 'black',
  },
})

const contentType = ref<'text' | 'voice' | 'image'>('text')
const mood = ref('开心')
const moods = ['开心', '孤独', '好奇']

function submitBottle() {
  uni.showToast({ title: '已寄向沧海', icon: 'success' })
}
</script>

<template>
  <view class="write-page app-tabbar-page">
    <view class="header">
      <text class="eyebrow">漂流瓶</text>
      <text class="title">寄海笺</text>
      <text class="copy">把一段心事折进纸里，交给潮声慢慢带走。</text>
    </view>

    <view class="mode-card">
      <view class="tabs">
        <view class="tab" :class="[contentType === 'text' && 'active']" @tap="contentType = 'text'">
          文字
        </view>
        <view class="tab" :class="[contentType === 'voice' && 'active']" @tap="contentType = 'voice'">
          语音
        </view>
        <view class="tab" :class="[contentType === 'image' && 'active']" @tap="contentType = 'image'">
          图片
        </view>
      </view>

      <textarea
        v-if="contentType === 'text'"
        class="letter-input"
        :maxlength="500"
        placeholder="写下此刻想寄出的心情..."
      />

      <view v-else-if="contentType === 'voice'" class="upload-zone">
        <view class="round-icon">
          声
        </view>
        <text class="upload-title">点击开始录制</text>
        <text class="upload-copy">最多 60 秒，适合留下一段潮汐般的声音。</text>
      </view>

      <view v-else class="upload-zone">
        <view class="round-icon">
          影
        </view>
        <text class="upload-title">从相册上传一段回忆</text>
        <text class="upload-copy">让一张图片替你抵达远方。</text>
      </view>
    </view>

    <view class="section">
      <text class="section-title">此刻心情</text>
      <view class="moods">
        <view
          v-for="item in moods"
          :key="item"
          class="mood" :class="[mood === item && 'selected']"
          @tap="mood = item"
        >
          {{ item }}
        </view>
      </view>
    </view>

    <view class="location-card">
      <view>
        <text class="card-title">附带位置信息</text>
        <text class="card-copy">仅展示大致距离，不暴露精确位置。</text>
      </view>
      <switch color="#0077b6" />
    </view>

    <button class="send-btn" @tap="submitBottle">
      寄向沧海
    </button>
  </view>
</template>

<style scoped lang="scss">
.write-page {
  padding: 30rpx 28rpx 128rpx;
  background:
    radial-gradient(circle at 88% 4%, rgba(244, 162, 97, 0.2), transparent 30%),
    linear-gradient(180deg, #ade8f4 0%, #f4fafd 54%, #f1e9db 100%);
  box-sizing: border-box;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  padding: 10rpx 4rpx 28rpx;
}

.eyebrow {
  color: rgba(0, 93, 144, 0.62);
  font-size: 24rpx;
  letter-spacing: 6rpx;
}

.title {
  color: #005d90;
  font-size: 52rpx;
  font-weight: 700;
  line-height: 1.12;
}

.copy {
  color: #404850;
  font-size: 27rpx;
  line-height: 1.6;
}

.mode-card,
.section,
.location-card {
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.58);
  box-shadow: 0 18rpx 56rpx rgba(0, 119, 182, 0.08);
}

.mode-card {
  padding: 24rpx;
}

.tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  padding: 8rpx;
  border-radius: 999rpx;
  background: rgba(0, 119, 182, 0.08);
}

.tab {
  height: 64rpx;
  border-radius: 999rpx;
  color: #005d90;
  font-size: 27rpx;
  font-weight: 700;
  line-height: 64rpx;
  text-align: center;
}

.tab.active {
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 8rpx 26rpx rgba(0, 93, 144, 0.1);
}

.letter-input {
  width: 100%;
  height: 320rpx;
  margin-top: 24rpx;
  padding: 26rpx;
  border-radius: 24rpx;
  background: rgba(241, 233, 219, 0.62);
  color: #161d1f;
  font-size: 29rpx;
  line-height: 1.65;
  box-sizing: border-box;
}

.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  margin-top: 24rpx;
  padding: 62rpx 28rpx;
  border: 2rpx dashed rgba(0, 119, 182, 0.26);
  border-radius: 28rpx;
  background: rgba(244, 250, 253, 0.56);
}

.round-icon {
  width: 92rpx;
  height: 92rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #0077b6, #94ccff);
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 92rpx;
  text-align: center;
}

.upload-title {
  color: #161d1f;
  font-size: 31rpx;
  font-weight: 700;
}

.upload-copy {
  color: #404850;
  font-size: 25rpx;
  line-height: 1.55;
  text-align: center;
}

.section {
  margin-top: 26rpx;
  padding: 28rpx;
}

.section-title {
  display: block;
  color: #161d1f;
  font-size: 30rpx;
  font-weight: 700;
}

.moods {
  display: flex;
  gap: 16rpx;
  margin-top: 22rpx;
}

.mood {
  flex: 1;
  height: 72rpx;
  border-radius: 999rpx;
  background: rgba(241, 233, 219, 0.72);
  color: #005d90;
  font-size: 27rpx;
  font-weight: 700;
  line-height: 72rpx;
  text-align: center;
}

.mood.selected {
  background: linear-gradient(135deg, #0077b6, #94ccff);
  color: #fff;
}

.location-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  margin-top: 26rpx;
  padding: 28rpx;
}

.card-title,
.card-copy {
  display: block;
}

.card-title {
  color: #161d1f;
  font-size: 29rpx;
  font-weight: 700;
}

.card-copy {
  margin-top: 8rpx;
  color: #404850;
  font-size: 24rpx;
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
</style>
