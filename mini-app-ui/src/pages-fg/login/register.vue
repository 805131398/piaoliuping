<script lang="ts" setup>
import AppTopbar from '@/components/AppTopbar.vue'
import { LOGIN_PAGE } from '@/router/config'

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '注册',
  },
})

function doRegister() {
  uni.showToast({
    title: '注册成功',
  })
  // 注册成功后跳转到登录页
  uni.navigateTo({
    url: LOGIN_PAGE,
  })
}
</script>

<template>
  <view class="login">
    <AppTopbar title="注册" subtitle="创建新的漂流身份" icon="i-lucide-user-plus" back />

    <view class="text-center">
      注册页
    </view>
    <button class="mt-4 w-40 text-center" @click="doRegister">
      点击模拟注册
    </button>
  </view>
</template>

<style lang="scss" scoped>
.login {
  min-height: 100vh;
  background: linear-gradient(180deg, #eef8fb 0%, #f8fbfc 100%);
}
</style>
