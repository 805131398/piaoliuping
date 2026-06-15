<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store'
import { useTokenStore } from '@/store/token'
import { getEnvBaseUrl } from '@/utils'

definePage({
  style: {
    navigationBarTitleText: '个人设置',
  },
})

const userStore = useUserStore()
const tokenStore = useTokenStore()
const { userInfo } = storeToRefs(userStore)

// 表单数据
const formData = ref({
  avatar: '',
  nickname: '',
  phonenumber: '',
})

// 是否有修改
const hasChanges = computed(() => {
  return (
    formData.value.avatar !== (userInfo.value.avatar || '') ||
    formData.value.nickname !== (userInfo.value.nickname || '')
  )
})

// 初始化表单
function initForm() {
  formData.value = {
    avatar: userInfo.value.avatar || '',
    nickname: userInfo.value.nickname || '',
    phonenumber: userInfo.value.phonenumber || '',
  }
}

// 页面加载时初始化
onMounted(() => {
  initForm()
})

// 选择头像回调（微信小程序）
function onChooseAvatar(e: any) {
  const { avatarUrl } = e.detail
  if (!avatarUrl) return
  
  // 上传头像到服务器
  uploadAvatar(avatarUrl)
}

// 上传头像
async function uploadAvatar(filePath: string) {
  const token = (tokenStore.tokenInfo as any).accessToken || (tokenStore.tokenInfo as any).token
  
  uni.showLoading({ title: '上传中...' })
  
  uni.uploadFile({
    url: getEnvBaseUrl() + '/api/system/file/upload',
    filePath: filePath,
    name: 'file',
    header: {
      Authorization: `Bearer ${token}`,
    },
    success: (res) => {
      uni.hideLoading()
      if (res.statusCode === 200) {
        const data = JSON.parse(res.data)
        if (data.url) {
          formData.value.avatar = data.url
          uni.showToast({ title: '头像已更新', icon: 'success' })
        }
      } else {
        uni.showToast({ title: '上传失败', icon: 'none' })
      }
    },
    fail: () => {
      uni.hideLoading()
      uni.showToast({ title: '上传失败', icon: 'none' })
    }
  })
}

// 昵称输入回调（微信小程序）
function onNicknameInput(e: any) {
  formData.value.nickname = e.detail.value
}

// 获取微信手机号回调
async function onGetPhoneNumber(e: any) {
  // #ifdef MP-WEIXIN
  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    if (e.detail.errMsg.includes('deny') || e.detail.errMsg.includes('refuse')) {
      uni.showToast({ title: '您拒绝了授权', icon: 'none' })
    }
    return
  }
  
  const code = e.detail.code
  if (!code) {
    uni.showToast({ title: '获取手机号失败', icon: 'none' })
    return
  }
  
  try {
    uni.showLoading({ title: '获取中...' })
    const res = await userStore.updatePhoneByWechat(code)
    uni.hideLoading()
    
    if (res?.phonenumber) {
      formData.value.phonenumber = res.phonenumber
      uni.showToast({ title: '绑定成功', icon: 'success' })
    } else {
      uni.showToast({ title: '获取手机号失败', icon: 'none' })
    }
  } catch (err) {
    uni.hideLoading()
    console.error('获取手机号失败:', err)
    uni.showToast({ title: '获取手机号失败', icon: 'none' })
  }
  // #endif
}

// 手动输入手机号
function manualInputPhone() {
  uni.showModal({
    title: '绑定手机号',
    editable: true,
    placeholderText: '请输入手机号',
    success: async (res) => {
      if (res.confirm && res.content) {
        const phone = res.content.replace(/\D/g, '')
        if (!/^1[3-9]\d{9}$/.test(phone)) {
          uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
          return
        }
        
        try {
          await userStore.updateUserProfile({ phonenumber: phone })
          formData.value.phonenumber = phone
          uni.showToast({ title: '绑定成功', icon: 'success' })
        } catch {
          uni.showToast({ title: '绑定失败', icon: 'none' })
        }
      }
    }
  })
}

// 保存设置
async function handleSave() {
  if (!formData.value.nickname) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }
  
  try {
    uni.showLoading({ title: '保存中...' })
    await userStore.updateUserProfile({
      nickname: formData.value.nickname,
      avatar: formData.value.avatar,
    })
    uni.hideLoading()
    uni.showToast({ title: '保存成功', icon: 'success' })
    
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch {
    uni.hideLoading()
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}

// 格式化手机号显示
function formatPhone(phone: string) {
  if (!phone || phone.length !== 11) return phone || '未绑定'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}
</script>

<template>
  <view class="settings-page">
    <!-- 头像设置 -->
    <view class="settings-section">
      <view class="section-title">头像</view>
      <view class="avatar-setting">
        <!-- #ifdef MP-WEIXIN -->
        <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
          <image
            v-if="formData.avatar"
            class="avatar-image"
            :src="formData.avatar"
            mode="aspectFill"
          />
          <view v-else class="avatar-placeholder">
            <text class="placeholder-icon">📷</text>
          </view>
          <text class="avatar-tip">点击更换</text>
        </button>
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <view class="avatar-wrapper" @click="uploadAvatar('')">
          <image
            v-if="formData.avatar"
            class="avatar-image"
            :src="formData.avatar"
            mode="aspectFill"
          />
          <view v-else class="avatar-placeholder">
            <text class="placeholder-icon">📷</text>
          </view>
          <text class="avatar-tip">点击更换</text>
        </view>
        <!-- #endif -->
      </view>
    </view>

    <!-- 昵称设置 -->
    <view class="settings-section">
      <view class="section-title">昵称</view>
      <view class="input-wrapper">
        <!-- #ifdef MP-WEIXIN -->
        <input
          type="nickname"
          class="nickname-input"
          :value="formData.nickname"
          placeholder="请输入昵称"
          @input="onNicknameInput"
        />
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <input
          class="nickname-input"
          :value="formData.nickname"
          placeholder="请输入昵称"
          @input="onNicknameInput"
        />
        <!-- #endif -->
      </view>
    </view>

    <!-- 手机号设置 -->
    <view class="settings-section">
      <view class="section-title">手机号</view>
      <view class="phone-setting">
        <text class="phone-text">{{ formatPhone(formData.phonenumber) }}</text>
        <view class="phone-actions">
          <!-- #ifdef MP-WEIXIN -->
          <button
            class="phone-btn wechat-btn"
            open-type="getPhoneNumber"
            @getphonenumber="onGetPhoneNumber"
          >
            微信授权
          </button>
          <!-- #endif -->
          <button class="phone-btn manual-btn" @click="manualInputPhone">
            手动输入
          </button>
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-section">
      <button class="save-btn" :disabled="!hasChanges" @click="handleSave">
        保存修改
      </button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.settings-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx;
}

.settings-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  
  .section-title {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 24rpx;
  }
}

.avatar-setting {
  display: flex;
  justify-content: center;
  
  .avatar-btn,
  .avatar-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: transparent;
    border: none;
    padding: 0;
    
    &::after {
      display: none;
    }
  }
  
  .avatar-image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    border: 4rpx solid #eee;
  }
  
  .avatar-placeholder {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .placeholder-icon {
      font-size: 64rpx;
    }
  }
  
  .avatar-tip {
    font-size: 24rpx;
    color: #999;
    margin-top: 16rpx;
  }
}

.input-wrapper {
  .nickname-input {
    width: 100%;
    height: 88rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 32rpx;
  }
}

.phone-setting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .phone-text {
    font-size: 32rpx;
    color: #333;
  }
  
  .phone-actions {
    display: flex;
    gap: 16rpx;
  }
  
  .phone-btn {
    font-size: 24rpx;
    padding: 12rpx 24rpx;
    border-radius: 8rpx;
    border: none;
    line-height: 1.5;
    
    &::after {
      display: none;
    }
  }
  
  .wechat-btn {
    background: #07c160;
    color: #fff;
  }
  
  .manual-btn {
    background: #f0f0f0;
    color: #666;
  }
}

.save-section {
  margin-top: 48rpx;
  padding: 0 24rpx;
  
  .save-btn {
    width: 100%;
    height: 96rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 32rpx;
    font-weight: 500;
    border-radius: 48rpx;
    border: none;
    
    &::after {
      display: none;
    }
    
    &[disabled] {
      background: #ccc;
      color: #fff;
    }
  }
}
</style>
