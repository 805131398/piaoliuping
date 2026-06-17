<script lang="ts" setup>
import { onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import AppTopbar from '@/components/AppTopbar.vue'
import { useUserStore } from '@/store'
import { useTokenStore } from '@/store/token'

defineOptions({
  name: 'TideHouse',
})

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '听潮小筑',
    navigationBarBackgroundColor: '#eef8fb',
    navigationBarTextStyle: 'black',
  },
})

const userStore = useUserStore()
const tokenStore = useTokenStore()
const { userInfo } = storeToRefs(userStore)

onShow(() => {
  if (tokenStore.hasLogin) {
    userStore.fetchUserInfo().catch((error) => {
      console.error('获取用户信息失败:', error)
    })
  }
})

const displayName = computed(() => userInfo.value.nickname || userInfo.value.username || '云深')
const signature = computed(() => tokenStore.hasLogin ? '聆听潮汐的声音' : '登录后收藏你的海笺与回音')
const accountId = computed(() => {
  if (!tokenStore.hasLogin) {
    return '未登录'
  }

  return userInfo.value.username || `ID ${userInfo.value.userId || '--'}`
})

function goToLogin() {
  uni.navigateTo({ url: '/pages-fg/login/login' })
}

function goToSettings() {
  uni.navigateTo({ url: '/pages/me/settings' })
}

function goToShelf() {
  uni.navigateTo({ url: '/pages/drift/shelf' })
}

function goToWrite() {
  uni.navigateTo({ url: '/pages/drift/write' })
}

async function handleLogout() {
  try {
    await tokenStore.logout()
    uni.showToast({ title: '已离开小筑', icon: 'success' })
  }
  catch (error) {
    console.error('退出登录失败:', error)
    uni.showToast({ title: '退出失败', icon: 'none' })
  }
}
</script>

<template>
  <view class="me-page">
    <view class="watermark watermark-a" />
    <view class="watermark watermark-b" />

    <AppTopbar title="听潮小筑" subtitle="账号与私藏" icon="i-lucide-user-round" variant="transparent" />

    <view class="hero">
      <view class="profile-card">
        <view class="avatar-wrap">
          <image class="avatar" :src="userInfo.avatar || '/static/images/default-avatar.png'" mode="aspectFill" />
          <view class="avatar-ring" />
        </view>
        <view class="profile-main">
          <view class="profile-head">
            <text class="name">{{ displayName }}</text>
            <text class="status-pill">{{ tokenStore.hasLogin ? '已登录' : '访客' }}</text>
          </view>
          <text class="signature">{{ signature }}</text>
          <text class="account">{{ accountId }}</text>
        </view>
      </view>

      <view class="quick-actions">
        <button class="quick primary-quick" @tap="tokenStore.hasLogin ? goToWrite() : goToLogin()">
          <view class="quick-icon bottle-icon" />
          <text>寄笺</text>
        </button>
        <button class="quick" @tap="tokenStore.hasLogin ? goToShelf() : goToLogin()">
          <view class="quick-icon shell-icon" />
          <text>拾贝</text>
        </button>
      </view>
    </view>

    <view class="stats-card">
      <view class="stat">
        <text class="num">24</text>
        <text class="label">投递</text>
      </view>
      <view class="stat">
        <text class="num">12</text>
        <text class="label">捞起</text>
      </view>
      <view class="stat">
        <text class="num">156</text>
        <text class="label">陪伴</text>
      </view>
    </view>

    <view class="section-card tide-card">
      <view class="section-head">
        <view>
          <text class="section-title">我的风格</text>
          <text class="section-subtitle">漂流瓶外观与身份印记</text>
        </view>
        <text class="change">更换</text>
      </view>
      <view class="skin-body">
        <view class="skin-preview">
          <view class="preview-water" />
          <view class="mini-bottle">
            <view class="mini-cork" />
            <view class="mini-glass" />
          </view>
        </view>
        <view class="skin-info">
          <text class="skin-name">海洋耳语</text>
          <text class="skin-desc">透亮玻璃瓶搭配旧纸笺，适合温柔、安静的回信语气。</text>
          <view class="tags">
            <text>稀有</text>
            <text>蔚蓝</text>
            <text>默认</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section-card">
      <view class="section-head">
        <view>
          <text class="section-title">小筑入口</text>
          <text class="section-subtitle">管理账号、提醒与本地空间</text>
        </view>
      </view>

      <view class="row" @tap="tokenStore.hasLogin ? goToSettings() : goToLogin()">
        <view class="row-left">
          <view class="row-icon user-icon" />
          <text>账号设置</text>
        </view>
        <text class="chevron">进入</text>
      </view>
      <view class="row">
        <view class="row-left">
          <view class="row-icon bell-icon" />
          <text>通知提醒</text>
        </view>
        <text class="chevron">已开启</text>
      </view>
      <view class="row">
        <view class="row-left">
          <view class="row-icon cache-icon" />
          <text>清理缓存</text>
        </view>
        <text class="chevron">124 MB</text>
      </view>
    </view>

    <view class="actions">
      <button v-if="tokenStore.hasLogin" class="danger" @tap="handleLogout">
        离开听潮小筑
      </button>
      <button v-else class="primary" @tap="goToLogin">
        进入听潮小筑
      </button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.me-page {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  padding: 0 28rpx 168rpx;
  background:
    radial-gradient(circle at 82% 4%, rgba(255, 255, 255, 0.52), transparent 20%),
    radial-gradient(circle at 12% 22%, rgba(244, 162, 97, 0.16), transparent 24%),
    linear-gradient(180deg, #bdeaf3 0%, #eef8fb 38%, #f6efe3 100%);
  box-sizing: border-box;
}

.watermark {
  position: absolute;
  z-index: 1;
  border-radius: 999rpx;
  pointer-events: none;
  filter: blur(24rpx);
}

.watermark-a {
  top: 198rpx;
  right: -156rpx;
  width: 340rpx;
  height: 340rpx;
  background: rgba(0, 119, 182, 0.16);
}

.watermark-b {
  left: -130rpx;
  bottom: 220rpx;
  width: 300rpx;
  height: 300rpx;
  background: rgba(244, 162, 97, 0.14);
}

.hero,
.stats-card,
.section-card,
.actions {
  position: relative;
  z-index: 2;
}

.hero {
  overflow: hidden;
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 30rpx;
  background:
    radial-gradient(circle at 12% 0%, rgba(255, 255, 255, 0.62), transparent 30%),
    linear-gradient(160deg, rgba(255, 255, 255, 0.74), rgba(232, 247, 251, 0.68));
  box-shadow: 0 22rpx 58rpx rgba(0, 93, 144, 0.12);
  backdrop-filter: blur(18rpx);
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 34rpx 30rpx 24rpx;
}

.avatar-wrap {
  position: relative;
  width: 132rpx;
  height: 132rpx;
  flex: 0 0 132rpx;
}

.avatar {
  position: relative;
  z-index: 2;
  width: 132rpx;
  height: 132rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.86);
  border-radius: 999rpx;
  background: #d9edf3;
  box-shadow: 0 14rpx 30rpx rgba(0, 93, 144, 0.16);
  box-sizing: border-box;
}

.avatar-ring {
  position: absolute;
  inset: -10rpx;
  z-index: 1;
  border: 2rpx solid rgba(0, 119, 182, 0.2);
  border-radius: 999rpx;
  border-right-color: rgba(244, 162, 97, 0.42);
}

.profile-main {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  min-width: 0;
}

.profile-head {
  display: flex;
  align-items: center;
  gap: 14rpx;
  min-width: 0;
}

.name {
  overflow: hidden;
  color: #161d1f;
  font-size: 42rpx;
  font-weight: 800;
  line-height: 1.18;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-pill {
  flex: 0 0 auto;
  padding: 8rpx 14rpx;
  border: 1rpx solid rgba(0, 119, 182, 0.12);
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.62);
  color: #005d90;
  font-size: 21rpx;
  font-weight: 700;
}

.signature,
.account {
  display: block;
  color: #404850;
  font-size: 26rpx;
  line-height: 1.35;
}

.account {
  color: #6b757c;
  font-size: 23rpx;
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18rpx;
  padding: 0 30rpx 30rpx;
}

.quick {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  height: 80rpx;
  margin: 0;
  border: 1rpx solid rgba(0, 93, 144, 0.1);
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.66);
  color: #005d90;
  font-size: 27rpx;
  font-weight: 800;
  line-height: 1;
  box-sizing: border-box;
}

.quick::after,
.actions button::after {
  border: 0;
}

.quick:active,
.row:active,
.actions button:active {
  transform: scale(0.98);
}

.primary-quick {
  background: linear-gradient(135deg, #0077b6, #005d90);
  color: #fff;
  box-shadow: 0 12rpx 26rpx rgba(0, 93, 144, 0.2);
}

.quick-icon {
  position: relative;
  width: 34rpx;
  height: 34rpx;
  flex: 0 0 34rpx;
}

.bottle-icon {
  border: 3rpx solid currentColor;
  border-radius: 16rpx 16rpx 10rpx 10rpx;
  transform: rotate(-10deg);
}

.bottle-icon::before {
  position: absolute;
  top: -10rpx;
  left: 10rpx;
  width: 12rpx;
  height: 9rpx;
  border-radius: 4rpx 4rpx 1rpx 1rpx;
  background: currentColor;
  content: '';
}

.shell-icon {
  border: 3rpx solid currentColor;
  border-radius: 6rpx 24rpx 24rpx 24rpx;
  transform: rotate(45deg);
}

.shell-icon::before {
  position: absolute;
  top: 6rpx;
  left: 6rpx;
  width: 16rpx;
  height: 3rpx;
  border-radius: 999rpx;
  background: currentColor;
  box-shadow: 0 8rpx 0 currentColor;
  content: '';
}

.stats-card {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 24rpx;
  padding: 28rpx 0;
  border: 1rpx solid rgba(255, 255, 255, 0.7);
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.58);
  box-shadow: 0 18rpx 42rpx rgba(0, 119, 182, 0.08);
}

.stat {
  text-align: center;
}

.num,
.label {
  display: block;
}

.num {
  color: #005d90;
  font-size: 41rpx;
  font-weight: 800;
  line-height: 1.15;
}

.label {
  margin-top: 6rpx;
  color: #404850;
  font-size: 24rpx;
}

.section-card {
  margin-top: 24rpx;
  padding: 28rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.62);
  box-shadow: 0 18rpx 48rpx rgba(0, 119, 182, 0.08);
  backdrop-filter: blur(16rpx);
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20rpx;
}

.section-title,
.section-subtitle {
  display: block;
}

.section-title {
  color: #161d1f;
  font-size: 31rpx;
  font-weight: 800;
  line-height: 1.25;
}

.section-subtitle {
  margin-top: 6rpx;
  color: #6b757c;
  font-size: 23rpx;
  line-height: 1.35;
}

.change,
.chevron {
  color: #005d90;
  font-size: 25rpx;
  font-weight: 700;
}

.skin-body {
  display: flex;
  gap: 24rpx;
  margin-top: 24rpx;
  align-items: center;
}

.skin-preview {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 150rpx;
  height: 180rpx;
  overflow: hidden;
  border: 1rpx solid rgba(255, 255, 255, 0.7);
  border-radius: 24rpx;
  background:
    radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.54), transparent 34%),
    linear-gradient(180deg, rgba(173, 232, 244, 0.48), rgba(0, 119, 182, 0.1));
}

.preview-water {
  position: absolute;
  left: -20rpx;
  right: -20rpx;
  bottom: 22rpx;
  height: 42rpx;
  border-radius: 999rpx;
  background: rgba(0, 119, 182, 0.16);
  filter: blur(2rpx);
}

.mini-bottle {
  position: relative;
  z-index: 1;
  width: 64rpx;
  height: 124rpx;
  transform: rotate(-8deg);
}

.mini-cork {
  width: 22rpx;
  height: 18rpx;
  margin: 0 auto -2rpx;
  border-radius: 6rpx 6rpx 2rpx 2rpx;
  background: #8e4e14;
}

.mini-glass {
  width: 100%;
  height: 108rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 31rpx 31rpx 18rpx 18rpx;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.72), rgba(148, 204, 255, 0.3));
  box-shadow: inset 0 0 18rpx rgba(255, 255, 255, 0.32);
  box-sizing: border-box;
}

.skin-info {
  flex: 1;
  min-width: 0;
}

.skin-name,
.skin-desc {
  display: block;
}

.skin-name {
  color: #161d1f;
  font-size: 31rpx;
  font-weight: 800;
}

.skin-desc {
  margin-top: 8rpx;
  color: #404850;
  font-size: 24rpx;
  line-height: 1.55;
}

.tags {
  flex-wrap: wrap;
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
}

.tags text {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(241, 233, 219, 0.82);
  color: #005d90;
  font-size: 22rpx;
  font-weight: 700;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20rpx;
  min-height: 92rpx;
  padding: 10rpx 0;
  border-bottom: 1rpx solid rgba(0, 93, 144, 0.08);
  color: #161d1f;
  font-size: 28rpx;
  box-sizing: border-box;
}

.row-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-width: 0;
}

.row:last-child {
  border-bottom: 0;
}

.row-icon {
  position: relative;
  width: 52rpx;
  height: 52rpx;
  flex: 0 0 52rpx;
  border-radius: 16rpx;
  background: rgba(0, 119, 182, 0.1);
}

.user-icon::before,
.user-icon::after {
  position: absolute;
  left: 50%;
  border: 3rpx solid #005d90;
  content: '';
  transform: translateX(-50%);
  box-sizing: border-box;
}

.user-icon::before {
  top: 10rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 999rpx;
}

.user-icon::after {
  bottom: 9rpx;
  width: 28rpx;
  height: 16rpx;
  border-bottom: 0;
  border-radius: 18rpx 18rpx 0 0;
}

.bell-icon::before {
  position: absolute;
  top: 11rpx;
  left: 14rpx;
  width: 24rpx;
  height: 25rpx;
  border: 3rpx solid #005d90;
  border-bottom: 0;
  border-radius: 16rpx 16rpx 6rpx 6rpx;
  content: '';
  box-sizing: border-box;
}

.bell-icon::after {
  position: absolute;
  left: 22rpx;
  bottom: 10rpx;
  width: 8rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background: #005d90;
  content: '';
}

.cache-icon::before {
  position: absolute;
  inset: 12rpx 10rpx;
  border: 3rpx solid #005d90;
  border-radius: 8rpx;
  content: '';
}

.cache-icon::after {
  position: absolute;
  top: 24rpx;
  left: 17rpx;
  width: 18rpx;
  height: 3rpx;
  border-radius: 999rpx;
  background: #005d90;
  box-shadow: 0 8rpx 0 #005d90;
  content: '';
}

.actions {
  margin-top: 30rpx;
}

.actions button {
  height: 88rpx;
  margin: 0;
  border-radius: 999rpx;
  font-size: 29rpx;
  font-weight: 700;
  line-height: 88rpx;
  box-sizing: border-box;
}

.primary {
  background: linear-gradient(135deg, #0077b6, #005d90);
  color: #fff;
  box-shadow: 0 14rpx 28rpx rgba(0, 93, 144, 0.2);
}

.danger {
  border: 1rpx solid rgba(147, 0, 10, 0.1);
  background: rgba(255, 255, 255, 0.54);
  color: #93000a;
}
</style>
