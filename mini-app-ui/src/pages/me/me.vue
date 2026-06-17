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

function goToLogin() {
  uni.navigateTo({ url: '/pages-fg/login/login' })
}

function goToSettings() {
  uni.navigateTo({ url: '/pages/me/settings' })
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
    <AppTopbar title="听潮小筑" subtitle="账号与私藏" icon="i-lucide-user-round" variant="transparent" />

    <view class="profile-card">
      <image class="avatar" :src="userInfo.avatar || '/static/images/default-avatar.png'" mode="aspectFill" />
      <view class="profile-main">
        <text class="name">{{ displayName }}</text>
        <text class="signature">{{ signature }}</text>
      </view>
    </view>

    <view class="stats">
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

    <view class="skin-card">
      <view class="section-head">
        <text class="section-title">我的风格</text>
        <text class="change">更换</text>
      </view>
      <view class="skin-body">
        <view class="skin-preview">
          <view class="mini-bottle" />
        </view>
        <view class="skin-info">
          <text class="skin-name">海洋耳语</text>
          <text class="skin-desc">透亮的玻璃瓶，内嵌陈旧的羊皮纸，瓶口由天蓝色火漆密封。</text>
          <view class="tags">
            <text>#稀有</text>
            <text>#蔚蓝</text>
          </view>
        </view>
      </view>
    </view>

    <view class="settings-card">
      <text class="section-title">设置与隐私</text>
      <view class="row" @tap="tokenStore.hasLogin ? goToSettings() : goToLogin()">
        <text>账号设置</text>
        <text class="chevron">进入</text>
      </view>
      <view class="row">
        <text>通知提醒</text>
        <text class="chevron">已开启</text>
      </view>
      <view class="row">
        <text>清理缓存</text>
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
  min-height: 100vh;
  padding: 0 28rpx 64rpx;
  background:
    radial-gradient(circle at 80% 2%, rgba(148, 204, 255, 0.34), transparent 32%),
    linear-gradient(180deg, #ade8f4 0%, #f4fafd 50%, #f1e9db 100%);
  box-sizing: border-box;
}

.profile-card,
.stats,
.skin-card,
.settings-card {
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.58);
  box-shadow: 0 18rpx 56rpx rgba(0, 119, 182, 0.08);
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx;
}

.avatar {
  width: 118rpx;
  height: 118rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.78);
  border-radius: 999rpx;
  background: #dde4e6;
}

.profile-main {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.name {
  color: #161d1f;
  font-size: 40rpx;
  font-weight: 700;
}

.signature {
  color: #404850;
  font-size: 26rpx;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 24rpx;
  padding: 26rpx 0;
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
  font-size: 40rpx;
  font-weight: 800;
}

.label {
  margin-top: 4rpx;
  color: #404850;
  font-size: 24rpx;
}

.skin-card,
.settings-card {
  margin-top: 24rpx;
  padding: 28rpx;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  color: #161d1f;
  font-size: 30rpx;
  font-weight: 700;
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
}

.skin-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 142rpx;
  height: 172rpx;
  border-radius: 28rpx;
  background: rgba(0, 119, 182, 0.08);
}

.mini-bottle {
  width: 62rpx;
  height: 112rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 30rpx 30rpx 18rpx 18rpx;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.72), rgba(148, 204, 255, 0.3));
  transform: rotate(-8deg);
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
  font-weight: 700;
}

.skin-desc {
  margin-top: 8rpx;
  color: #404850;
  font-size: 24rpx;
  line-height: 1.55;
}

.tags {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
}

.tags text {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(241, 233, 219, 0.78);
  color: #005d90;
  font-size: 22rpx;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20rpx;
  padding: 26rpx 0;
  border-bottom: 1rpx solid rgba(0, 93, 144, 0.08);
  color: #161d1f;
  font-size: 28rpx;
}

.row:last-child {
  border-bottom: 0;
}

.actions {
  margin-top: 30rpx;
}

.actions button {
  height: 88rpx;
  border-radius: 999rpx;
  font-size: 29rpx;
  font-weight: 700;
  line-height: 88rpx;
}

.primary {
  background: linear-gradient(135deg, #0077b6, #f4a261);
  color: #fff;
}

.danger {
  background: rgba(186, 26, 26, 0.08);
  color: #93000a;
}
</style>
