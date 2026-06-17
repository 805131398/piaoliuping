import { ref } from 'vue'
import { drawDriftBottle } from '@/api/drift'
import { useTokenStore } from '@/store/token'

export function useBottleLoginGuard() {
  const tokenStore = useTokenStore()
  const isLoggingIn = ref(false)
  const isDrawing = ref(false)
  const showLoginPrompt = ref(false)
  let loginPromptResolver: ((confirmed: boolean) => void) | undefined

  function navigateToBottle(discoveryId: string) {
    uni.navigateTo({ url: `/pages/drift/read?discoveryId=${encodeURIComponent(discoveryId)}` })
  }

  function navigateToEmptyBottle(message?: string) {
    const reason = message || '暂时没有可捕捞的漂流瓶'
    uni.navigateTo({ url: `/pages/drift/read?emptyReason=${encodeURIComponent(reason)}` })
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
      url: `/pages-fg/login/login?redirect=${encodeURIComponent('/pages/index/index')}`,
    })
    return false
    // #endif
  }

  async function drawBottle() {
    if (tokenStore.hasLogin) {
      await drawBottleFromSea()
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
        await drawBottleFromSea()
      }
    }
    catch (error) {
      console.error('捕捞前登录失败:', error)
    }
    finally {
      isLoggingIn.value = false
    }
  }

  async function drawBottleFromSea() {
    if (isDrawing.value)
      return

    isDrawing.value = true
    uni.showLoading({ title: '捕捞中...' })

    try {
      const response = await drawDriftBottle()
      uni.hideLoading()

      if (response.status === 'EMPTY') {
        navigateToEmptyBottle(response.msg)
        return
      }

      if (response.status === 'LIMIT_EXCEEDED') {
        uni.showToast({ title: response.msg || '今天的捕捞次数已用完', icon: 'none' })
        return
      }

      if (response.status === 'FOUND' && response.data?.discovery.id) {
        navigateToBottle(response.data.discovery.id)
        return
      }

      uni.showToast({ title: response.msg || '暂时没有捞到漂流瓶', icon: 'none' })
    }
    catch (error) {
      uni.hideLoading()
      const response = error as { statusCode?: number, data?: { msg?: string, message?: string } }
      const message = response.data?.msg || response.data?.message

      if (response.statusCode === 404 || message?.includes('没有可捕捞')) {
        navigateToEmptyBottle(message)
        return
      }

      uni.showToast({ title: message || '暂时没有捞到漂流瓶', icon: 'none' })
    }
    finally {
      isDrawing.value = false
    }
  }

  return {
    showLoginPrompt,
    closeLoginPrompt,
    drawBottle,
  }
}
