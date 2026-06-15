<script lang="ts" setup>
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { useTokenStore } from '@/store/token'
import { useUserStore } from '@/store'

defineOptions({
  name: 'Index',
})

definePage({
  type: 'home',
  style: {
    navigationBarTitleText: 'Piaoliuping',
  },
})

const tokenStore = useTokenStore()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

onShow(() => {
  if (tokenStore.hasLogin) {
    userStore.fetchUserInfo().catch((error) => {
      console.error('获取用户信息失败', error)
    })
  }
})

const welcomeText = computed(() => {
  return tokenStore.hasLogin
    ? `欢迎回来，${userInfo.value.nickname || userInfo.value.username || '开发者'}`
    : '这是保留后的基础小程序壳子，可继续承接新的业务模块。'
})

function goToProfile() {
  uni.switchTab({ url: '/pages/me/me' })
}

function goToLogin() {
  uni.navigateTo({ url: '/pages-fg/login/login' })
}
</script>

<template>
  <view class="page">
    <view class="hero">
      <text class="eyebrow">Piaoliuping</text>
      <text class="title">语言学习基础壳子已就位</text>
      <text class="desc">{{ welcomeText }}</text>
    </view>

    <view class="card-list">
      <view class="info-card">
        <text class="card-title">当前状态</text>
        <text class="card-text">历史打卡、题库、排行榜、优惠券、订单等业务代码已从当前工程剥离。</text>
      </view>

      <view class="info-card">
        <text class="card-title">继续可用</text>
        <text class="card-text">登录流、小程序框架、基础页面结构、用户资料编辑、微信登录能力仍可直接复用。</text>
      </view>

      <view class="info-card">
        <text class="card-title">预留能力</text>
        <text class="card-text">用户积分字段、VIP 字段和微信支付底层代码已保留，便于后续语言学习业务接入。</text>
      </view>
    </view>

    <view class="actions">
      <button v-if="tokenStore.hasLogin" class="primary-btn" @tap="goToProfile">进入我的</button>
      <button v-else class="primary-btn" @tap="goToLogin">去登录</button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 40rpx 32rpx 48rpx;
  background:
    radial-gradient(circle at top left, rgba(78, 151, 255, 0.18), transparent 32%),
    linear-gradient(180deg, #f8fbff 0%, #eef3f8 100%);
  box-sizing: border-box;
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 24rpx 8rpx 40rpx;
}

.eyebrow {
  font-size: 24rpx;
  letter-spacing: 4rpx;
  text-transform: uppercase;
  color: #5d7692;
}

.title {
  font-size: 60rpx;
  line-height: 1.1;
  font-weight: 700;
  color: #18212b;
}

.desc {
  font-size: 28rpx;
  line-height: 1.7;
  color: #4c5b6b;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.info-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 30rpx;
  border: 1rpx solid rgba(24, 33, 43, 0.08);
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 18rpx 50rpx rgba(47, 80, 120, 0.08);
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #18212b;
}

.card-text {
  font-size: 27rpx;
  line-height: 1.7;
  color: #5c6b79;
}

.actions {
  margin-top: 40rpx;
}

.primary-btn {
  height: 88rpx;
  border-radius: 999rpx;
  background: #1c7ed6;
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 88rpx;
}
</style>
