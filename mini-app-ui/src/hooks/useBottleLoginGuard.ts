import { ref } from 'vue'
import { useTokenStore } from '@/store/token'

export function useBottleLoginGuard() {
  const tokenStore = useTokenStore()
  const isLoggingIn = ref(false)
  const showLoginPrompt = ref(false)
  let loginPromptResolver: ((confirmed: boolean) => void) | undefined

  function navigateToBottle() {
    uni.navigateTo({ url: '/pages/drift/read' })
  }

  function confirmLogin() {
    return new Promise<boolean>((resolve) => {
      loginPromptResolver = resolve
      showLoginPrompt.value = true
    })
  }

  function closeLoginPrompt(confirmed: boolean) {
    showLoginPrompt.value = false
    loginPromptResolver?.(confirmed)
    loginPromptResolver = undefined
  }

  async function loginBeforeDrawBottle() {
    // #ifdef MP-WEIXIN
    await tokenStore.wxLogin()
    return true
    // #endif

    // #ifndef MP-WEIXIN
    uni.navigateTo({
      url: `/pages-fg/login/login?redirect=${encodeURIComponent('/pages/drift/read')}`,
    })
    return false
    // #endif
  }

  async function drawBottle() {
    if (tokenStore.hasLogin) {
      navigateToBottle()
      return
    }

    if (isLoggingIn.value) {
      return
    }

    isLoggingIn.value = true
    try {
      const shouldLogin = await confirmLogin()
      if (!shouldLogin) {
        return
      }

      const loggedIn = await loginBeforeDrawBottle()
      if (loggedIn) {
        navigateToBottle()
      }
    }
    catch (error) {
      console.error('捕捞前登录失败:', error)
    }
    finally {
      isLoggingIn.value = false
    }
  }

  return {
    showLoginPrompt,
    closeLoginPrompt,
    drawBottle,
  }
}
