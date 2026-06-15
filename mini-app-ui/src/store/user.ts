import type { IUserInfoRes } from '@/api/types/login'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfo, updateProfile } from '@/api/login'
import { http } from '@/http/http'

// 初始化状态
const userInfoState: IUserInfoRes = {
  userId: -1,
  username: '',
  nickname: '',
  avatar: '/static/images/default-avatar.png',
  roles: [],
}

export const useUserStore = defineStore(
  'user',
  () => {
    // 定义用户信息
    const userInfo = ref<IUserInfoRes>({ ...userInfoState })
    // 设置用户信息
    const setUserInfo = (val: IUserInfoRes) => {
      console.log('设置用户信息', val)
      // 若头像为空 则使用默认头像
      if (!val.avatar) {
        val.avatar = userInfoState.avatar
      }
      if (!Array.isArray(val.roles)) {
        val.roles = []
      }
      userInfo.value = val
    }
    const setUserAvatar = (avatar: string) => {
      userInfo.value.avatar = avatar
      console.log('设置用户头像', avatar)
      console.log('userInfo', userInfo.value)
    }
    // 删除用户信息
    const clearUserInfo = () => {
      userInfo.value = { ...userInfoState }
      uni.removeStorageSync('user')
    }

    /**
     * 获取用户信息
     */
    const fetchUserInfo = async () => {
      const res = await getUserInfo()
      setUserInfo(res)
      return res
    }

    const updateUserProfile = async (payload: { nickname?: string, phonenumber?: string, avatar?: string }) => {
      const req: Record<string, any> = {}
      if (typeof payload.nickname !== 'undefined') req.nickName = payload.nickname
      if (typeof payload.avatar !== 'undefined') req.avatar = payload.avatar
      if (typeof payload.phonenumber !== 'undefined') {
        const raw = String(payload.phonenumber || '')
        const digits = raw.replace(/\D/g, '')
        if (digits && digits.length === 11) {
          req.phonenumber = digits
        }
      }
      if (Object.keys(req).length === 0) return userInfo.value
      await updateProfile(req)
      userInfo.value = {
        ...userInfo.value,
        nickname: typeof req.nickName !== 'undefined' ? req.nickName : userInfo.value.nickname,
        avatar: typeof req.avatar !== 'undefined' ? req.avatar : userInfo.value.avatar,
        phonenumber: typeof req.phonenumber !== 'undefined' ? req.phonenumber : userInfo.value.phonenumber,
      }
      return userInfo.value
    }

    /**
     * 通过微信手机号授权更新手机号
     * @param code 微信 getPhoneNumber 返回的 code
     */
    const updatePhoneByWechat = async (code: string) => {
      const res = await http.post<{ phonenumber: string }>('/api/auth/wechat-phone', { code })
      if (res?.phonenumber) {
        userInfo.value.phonenumber = res.phonenumber
      }
      return res
    }

    return {
      userInfo,
      clearUserInfo,
      fetchUserInfo,
      setUserInfo,
      setUserAvatar,
      updateUserProfile,
      updatePhoneByWechat,
    }
  },
  {
    persist: true,
  },
)
