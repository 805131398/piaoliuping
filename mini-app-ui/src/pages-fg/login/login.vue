<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import AppTopbar from '@/components/AppTopbar.vue'
import { useTokenStore } from '@/store/token'

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '登录',
  },
})

const tokenStore = useTokenStore()
const redirectUrl = ref('')

onLoad((options = {}) => {
  const redirect = typeof options.redirect === 'string' ? options.redirect : ''
  redirectUrl.value = redirect ? decodeURIComponent(redirect) : ''
})

function goBackAfterLogin() {
  if (redirectUrl.value) {
    uni.redirectTo({ url: redirectUrl.value })
    return
  }

  uni.navigateBack()
}

async function doLogin() {
  if (tokenStore.hasLogin) {
    goBackAfterLogin()
    return
  }
  try {
    // 调用登录接口
    await tokenStore.login({
      username: '菲鸽',
      password: '123456',
    })
    goBackAfterLogin()
  }
  catch (error) {
    console.log('登录失败', error)
  }
}
</script>

<template>
  <view class="login">
    <AppTopbar title="登录" subtitle="进入听潮小筑" icon="i-lucide-log-in" back />

    <!-- 本页面是非MP的登录页，主要用于 h5 和 APP -->
    <view class="text-center">
      登录页
    </view>
    <button class="mt-4 w-40 text-center" @click="doLogin">
      点击模拟登录
    </button>
  </view>
</template>

<style lang="scss" scoped>
.login {
  min-height: 100vh;
  background: linear-gradient(180deg, #eef8fb 0%, #f8fbfc 100%);
}
</style>
