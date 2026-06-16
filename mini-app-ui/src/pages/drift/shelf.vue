<script lang="ts" setup>
import { ref } from 'vue'

defineOptions({
  name: 'DriftShelf',
})

definePage({
  style: {
    navigationBarTitleText: '漂流瓶',
    navigationBarBackgroundColor: '#f4fafd',
    navigationBarTextStyle: 'black',
  },
})

const tab = ref<'shelf' | 'replies'>('shelf')

const bottles = [
  { title: '太平洋蓝', meta: '3天前', icon: 'doc', tone: 'blue' },
  { title: '落日余晖', meta: '昨天', icon: 'music', tone: 'orange' },
  { title: '海沫迷雾', meta: '刚刚', icon: 'palette', tone: 'blue' },
]

const replies = [
  { name: '马可波罗', distance: '500km', preview: '关于地平线的想法很美...', time: '2小时前', mark: '人' },
  { name: '神秘园丁', distance: '2,100km', preview: '我的窗台花盒里也有同样的花！', time: '1天前', mark: '花' },
  { name: '蓝鲸', distance: '120km', preview: '今天也在跟着你的旋律歌唱。', time: '4天前', mark: '鲸' },
]
</script>

<template>
  <view class="treasure-page app-tabbar-page">
    <view class="decor decor-one" />
    <view class="decor decor-two" />
    <view class="shell-badge" />

    <view class="header">
      <view class="wave-icon">
        ≋
      </view>
      <text class="header-title">漂流瓶</text>
      <view class="avatar">
        <view class="horizon" />
      </view>
    </view>

    <view class="tabs">
      <view class="active tab" :class="[tab === 'shelf' && 'selected']" @tap="tab = 'shelf'">
        我的瓶子
      </view>
      <view class="tab" :class="[tab === 'replies' && 'selected']" @tap="tab = 'replies'">
        最近对话
      </view>
    </view>

    <view v-if="tab === 'shelf'" class="bottle-grid">
      <view v-for="item in bottles" :key="item.title" class="bottle-card">
        <view class="bottle-art" :class="item.tone">
          <view class="bottle-left" />
          <view class="bottle-right">
            <view class="paper-line short" />
            <view class="paper-line" />
            <view class="paper-line" />
          </view>
          <view v-if="item.icon === 'music'" class="inner-symbol">
            ♪
          </view>
          <view v-else-if="item.icon === 'palette'" class="inner-symbol">
            ◉
          </view>
        </view>
        <text class="card-title">{{ item.title }}</text>
        <text class="card-meta">{{ item.meta }}</text>
      </view>

      <view class="add-card">
        <view class="add-circle">
          ＋
        </view>
        <text>待投递</text>
      </view>
    </view>

    <view v-else class="reply-list">
      <view v-for="item in replies" :key="item.name" class="reply-card">
        <view class="reply-avatar">
          {{ item.mark }}
        </view>
        <view class="reply-main">
          <view class="reply-head">
            <text class="reply-name">{{ item.name }}</text>
            <text class="reply-distance">{{ item.distance }}</text>
          </view>
          <text class="reply-preview">{{ item.preview }}</text>
          <text class="reply-time">最后回复于 {{ item.time }}</text>
        </view>
      </view>
    </view>

    <view class="wave-panel">
      <text>大海已为你珍藏了12个瓶子。</text>
      <view class="wave wave-a" />
      <view class="wave wave-b" />
    </view>
  </view>
</template>

<style scoped lang="scss">
.treasure-page {
  position: relative;
  padding: 28rpx 28rpx 108rpx;
  overflow: hidden;
  background:
    radial-gradient(circle at 86% 12%, rgba(255, 255, 255, 0.7), transparent 18%),
    linear-gradient(180deg, #f6fbfd 0%, #eef7fa 44%, #eaf4f7 100%);
  box-sizing: border-box;
}

.decor {
  position: absolute;
  border-radius: 999rpx;
  pointer-events: none;
}

.decor-one {
  top: 140rpx;
  right: -110rpx;
  width: 250rpx;
  height: 250rpx;
  background: rgba(173, 232, 244, 0.38);
}

.decor-two {
  left: -120rpx;
  bottom: 200rpx;
  width: 280rpx;
  height: 280rpx;
  background: rgba(148, 204, 255, 0.22);
}

.shell-badge {
  position: absolute;
  top: 14rpx;
  right: 28rpx;
  width: 48rpx;
  height: 48rpx;
  border: 1rpx solid rgba(0, 93, 144, 0.16);
  border-radius: 999rpx;
  background:
    radial-gradient(circle at 50% 70%, #8e4e14 0 8rpx, transparent 9rpx),
    linear-gradient(180deg, #ade8f4 0 45%, #f1e9db 46% 100%);
  box-shadow: 0 8rpx 22rpx rgba(0, 119, 182, 0.12);
}

.header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10rpx;
  height: 44rpx;
}

.wave-icon {
  color: #005d90;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 1;
}

.header-title {
  color: #005d90;
  font-size: 34rpx;
  font-weight: 800;
  letter-spacing: 1rpx;
}

.avatar {
  margin-left: auto;
  width: 48rpx;
  height: 48rpx;
  overflow: hidden;
  border: 1rpx solid rgba(0, 93, 144, 0.12);
  border-radius: 999rpx;
  background: linear-gradient(180deg, #ade8f4 0 50%, #f1e9db 51%);
  box-shadow: 0 8rpx 22rpx rgba(0, 119, 182, 0.12);
}

.horizon {
  width: 18rpx;
  height: 18rpx;
  margin: 15rpx auto 0;
  border-radius: 999rpx;
  background: #5d594e;
}

.tabs {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-top: 42rpx;
  margin-bottom: 38rpx;
}

.tab {
  height: 48rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  color: #404850;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 48rpx;
}

.tab.selected {
  border: 1rpx solid rgba(0, 119, 182, 0.18);
  background: rgba(255, 255, 255, 0.72);
  color: #005d90;
  box-shadow: 0 10rpx 28rpx rgba(0, 119, 182, 0.08);
}

.bottle-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
}

.bottle-card,
.add-card {
  height: 240rpx;
  border-radius: 14rpx;
  background: rgba(255, 255, 255, 0.64);
  box-shadow: 0 18rpx 46rpx rgba(0, 119, 182, 0.045);
}

.bottle-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 38rpx;
  box-sizing: border-box;
}

.bottle-art {
  position: relative;
  width: 72rpx;
  height: 82rpx;
  margin-bottom: 28rpx;
}

.bottle-left {
  position: absolute;
  left: 4rpx;
  bottom: 8rpx;
  width: 20rpx;
  height: 48rpx;
  border: 6rpx solid currentColor;
  border-radius: 4rpx 4rpx 10rpx 10rpx;
  box-sizing: border-box;
}

.bottle-left::before {
  position: absolute;
  top: -22rpx;
  left: 3rpx;
  width: 8rpx;
  height: 20rpx;
  border: 5rpx solid currentColor;
  border-bottom: 0;
  border-radius: 4rpx 4rpx 0 0;
  content: '';
}

.bottle-right {
  position: absolute;
  right: 2rpx;
  bottom: 0;
  width: 44rpx;
  height: 62rpx;
  border: 6rpx solid currentColor;
  border-radius: 8rpx 8rpx 12rpx 12rpx;
  box-sizing: border-box;
}

.bottle-right::before {
  position: absolute;
  top: -26rpx;
  left: 11rpx;
  width: 12rpx;
  height: 24rpx;
  border: 5rpx solid currentColor;
  border-bottom: 0;
  border-radius: 6rpx 6rpx 0 0;
  content: '';
}

.paper-line {
  width: 22rpx;
  height: 4rpx;
  margin: 7rpx auto 0;
  border-radius: 999rpx;
  background: currentColor;
  opacity: 0.62;
}

.paper-line.short {
  width: 14rpx;
  margin-top: 14rpx;
}

.blue {
  color: #80b6cf;
}

.orange {
  color: #f2be98;
}

.inner-symbol {
  position: absolute;
  left: 25rpx;
  top: 36rpx;
  width: 23rpx;
  height: 23rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.86);
  color: #f4a261;
  font-size: 18rpx;
  font-weight: 800;
  line-height: 23rpx;
  text-align: center;
}

.card-title,
.card-meta {
  display: block;
  text-align: center;
}

.card-title {
  color: #005d90;
  font-size: 22rpx;
  font-weight: 800;
}

.card-meta {
  margin-top: 4rpx;
  color: rgba(64, 72, 80, 0.78);
  font-size: 19rpx;
}

.add-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed rgba(112, 120, 129, 0.18);
  color: rgba(64, 72, 80, 0.7);
  font-size: 22rpx;
  box-shadow: none;
}

.add-circle {
  width: 38rpx;
  height: 38rpx;
  margin-bottom: 18rpx;
  border: 3rpx solid rgba(128, 182, 207, 0.46);
  border-radius: 999rpx;
  color: rgba(128, 182, 207, 0.68);
  font-size: 30rpx;
  line-height: 31rpx;
  text-align: center;
}

.reply-list {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.reply-card {
  display: flex;
  gap: 18rpx;
  padding: 22rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.68);
}

.reply-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 999rpx;
  background: rgba(173, 232, 244, 0.8);
  color: #005d90;
  font-size: 22rpx;
  font-weight: 800;
  line-height: 56rpx;
  text-align: center;
}

.reply-main {
  flex: 1;
  min-width: 0;
}

.reply-head {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
}

.reply-name {
  color: #161d1f;
  font-size: 25rpx;
  font-weight: 800;
}

.reply-distance,
.reply-preview,
.reply-time {
  color: rgba(64, 72, 80, 0.72);
  font-size: 20rpx;
}

.reply-preview,
.reply-time {
  display: block;
  margin-top: 6rpx;
}

.wave-panel {
  position: relative;
  z-index: 1;
  height: 132rpx;
  margin-top: 34rpx;
  overflow: hidden;
  border-radius: 0 0 14rpx 14rpx;
  background: rgba(255, 255, 255, 0.44);
}

.wave-panel text {
  position: relative;
  z-index: 2;
  display: block;
  padding-top: 50rpx;
  color: rgba(0, 93, 144, 0.56);
  font-size: 22rpx;
  font-style: italic;
  text-align: center;
}

.wave {
  position: absolute;
  left: -30rpx;
  right: -30rpx;
  bottom: -28rpx;
  height: 72rpx;
  border-radius: 50% 50% 0 0;
}

.wave-a {
  background: rgba(128, 182, 207, 0.52);
  transform: rotate(-2deg);
}

.wave-b {
  bottom: -42rpx;
  background: rgba(128, 182, 207, 0.32);
  transform: rotate(4deg);
}
</style>
