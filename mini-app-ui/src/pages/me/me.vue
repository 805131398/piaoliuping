<script lang="ts" setup>
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store'
import { useTokenStore } from '@/store/token'

definePage({
  style: {
    navigationBarTitleText: '我的',
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

const displayName = computed(() => {
  return userInfo.value.nickname || userInfo.value.username || '未登录用户'
})

const contactText = computed(() => {
  return userInfo.value.phonenumber || userInfo.value.email || '未绑定联系方式'
})

function goToLogin() {
  uni.navigateTo({ url: '/pages-fg/login/login' })
}

function goToSettings() {
  uni.navigateTo({ url: '/pages/me/settings' })
}

async function handleLogout() {
  try {
    await tokenStore.logout()
    uni.showToast({ title: '已退出登录', icon: 'success' })
  }
  catch (error) {
    console.error('退出登录失败:', error)
    uni.showToast({ title: '退出失败', icon: 'none' })
  }
}
</script>

<template>
  <view class="page">
    <view class="profile-card">
      <image class="avatar" :src="userInfo.avatar || '/static/images/default-avatar.png'" mode="aspectFill" />
      <view class="profile-meta">
        <text class="name">{{ displayName }}</text>
        <text class="sub">{{ contactText }}</text>
      </view>
    </view>

    <view class="panel">
      <text class="panel-title">基础账户能力</text>
      <view class="row">
        <text class="label">登录状态</text>
        <text class="value">{{ tokenStore.hasLogin ? '已登录' : '未登录' }}</text>
      </view>
      <view class="row">
        <text class="label">用户资料</text>
        <text class="value">已保留头像、昵称、手机号编辑能力</text>
      </view>
      <view class="row">
        <text class="label">扩展字段</text>
        <text class="value">积分/VIP 字段仍保留在后端模型中</text>
      </view>
    </view>

    <view class="panel">
      <text class="panel-title">后续开发提示</text>
      <text class="hint">
        当前小程序已移除历史打卡业务，只保留通用壳子。你可以在此基础上接入课程、单词、学习计划和会员体系等语言学习模块。
      </text>
    </view>

    <view class="actions">
      <button v-if="tokenStore.hasLogin" class="action-btn primary" @tap="goToSettings">编辑资料</button>
      <button v-if="tokenStore.hasLogin" class="action-btn ghost" @tap="handleLogout">退出登录</button>
      <button v-else class="action-btn primary" @tap="goToLogin">立即登录</button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 32rpx;
  background:
    linear-gradient(180deg, #f4f8fb 0%, #edf2f6 100%);
  box-sizing: border-box;
}

.profile-card,
.panel {
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.92);
  border: 1rpx solid rgba(24, 33, 43, 0.08);
  box-shadow: 0 18rpx 48rpx rgba(48, 72, 97, 0.08);
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 999rpx;
  background: #dde6ef;
}

.profile-meta {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.name {
  font-size: 36rpx;
  font-weight: 700;
  color: #18212b;
}

.sub {
  font-size: 26rpx;
  color: #627181;
}

.panel {
  margin-top: 24rpx;
  padding: 30rpx;
}

.panel-title {
  display: block;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #18212b;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding: 18rpx 0;
  border-bottom: 1rpx solid rgba(24, 33, 43, 0.06);
}

.row:last-child {
  border-bottom: 0;
}

.label,
.value,
.hint {
  font-size: 26rpx;
  line-height: 1.7;
}

.label {
  color: #5e6d7b;
}

.value,
.hint {
  color: #23313d;
  text-align: right;
}

.hint {
  text-align: left;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 32rpx;
}

.action-btn {
  height: 88rpx;
  border-radius: 999rpx;
  line-height: 88rpx;
  font-size: 30rpx;
  font-weight: 600;
}

.action-btn.primary {
  background: #14532d;
  color: #fff;
}

.action-btn.ghost {
  background: rgba(20, 83, 45, 0.08);
  color: #14532d;
}
</style>
