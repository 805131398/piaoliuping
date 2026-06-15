import type { IAuthLoginRes, ICaptcha, IDoubleTokenRes, IFullLoginRes, ISocialLoginBody, IUpdateInfo, IUpdatePassword, IUserInfoRes } from './types/login'
import { http } from '@/http/http'

/**
 * 登录表单
 */
export interface ILoginForm {
  username: string
  password: string
}

/**
 * 获取验证码
 * @returns ICaptcha 验证码
 */
export function getCode() {
  return http.get<ICaptcha>('/api/user/getCode')
}

/**
 * 用户登录
 * @param loginForm 登录表单
 */
export function login(loginForm: ILoginForm) {
  return http.post<IAuthLoginRes>('/api/auth/login', loginForm)
}

/**
 * 刷新token
 * @param refreshToken 刷新token
 */
export function refreshToken(refreshToken: string) {
  return http.post<IDoubleTokenRes>('/api/auth/refreshToken', { refreshToken })
}

/**
 * 获取用户信息
 */
export async function getUserInfo() {
  const data = await http.get<any>('/api/system/user/getInfo')
  const u = data?.user || {}
  const list1: any[] = Array.isArray(data?.roles) ? data.roles : []
  const list2: any[] = Array.isArray(u?.roles) ? u.roles : []
  const rawRoles: any[] = [...list1, ...list2]
  const roles: string[] = Array.from(
    new Set(
      (rawRoles || [])
        .map((r: any) => typeof r === 'string' ? r : (r?.roleKey || r?.key || r?.code || r?.role || r?.name || ''))
        .filter((s: any) => typeof s === 'string' && s)
    )
  )
  const mapped: IUserInfoRes = {
    userId: u.userId || u.id || '',
    username: u.userName || u.username || '',
    nickname: u.nickName || u.nickname || '',
    avatar: u.avatar || '/static/images/default-avatar.png',
    phonenumber: u.phonenumber || '',
    sex: u.sex ?? '',
    email: u.email || '',
    roles,
  }
  return mapped
}

/**
 * 退出登录
 */
export function logout() {
  return http.post<void>('/api/auth/logout')
}

/**
 * 修改用户信息
 */
export function updateInfo(data: IUpdateInfo) {
  return http.post('/api/user/updateInfo', data)
}

/**
 * 修改用户密码
 */
export function updateUserPassword(data: IUpdatePassword) {
  return http.post('/api/user/updatePassword', data)
}

export function updateProfile(data: { nickName?: string, phonenumber?: string }) {
  return http.post('/api/system/user/profile/update', data)
}

export function uploadAvatar(filePath: string) {
  return new Promise<string>((resolve, reject) => {
    uni.uploadFile({
      url: '/api/system/user/profile/avatar',
      name: 'avatarfile',
      filePath,
      success: (res) => {
        try {
          const body = JSON.parse(res.data || '{}')
          const code = body.code
          if (code === 200 || code === 0) {
            const imgUrl = body?.data?.imgUrl || body?.data?.url || ''
            resolve(imgUrl)
          }
          else {
            reject(new Error(body.msg || '上传失败'))
          }
        }
        catch (e) {
          reject(e)
        }
      },
      fail: err => reject(err),
    })
  })
}

/**
 * 获取微信登录凭证
 * @returns Promise 包含微信登录凭证(code)
 */
export function getWxCode() {
  return new Promise<UniApp.LoginRes>((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: res => resolve(res),
      fail: err => reject(new Error(err)),
    })
  })
}

/**
 * 微信登录
 * @param params 微信登录参数，包含code
 * @returns Promise 包含登录结果
 */
export function wxLogin(data: { code: string }) {
  return http.post<IAuthLoginRes>('/api/auth/wxLogin', data)
}

/**
 * 微信小程序登录
 * @param data 社交登录参数
 * @returns Promise 包含登录结果和用户信息
 */
export function wechatMiniLogin(data: ISocialLoginBody) {
  return http.post<IFullLoginRes>('/api/auth/wechat-mini-login', {
    ...data,
    source: 'wechat_mp',
  })
}

/**
 * 完整的微信小程序登录流程
 * 包含获取code和调用登录接口
 * @returns Promise 包含登录结果和用户信息
 */
export function wechatMiniLoginFlow() {
  return new Promise<IFullLoginRes>((resolve, reject) => {
    // #ifdef MP-WEIXIN
    // 获取微信登录凭证
    uni.login({
      provider: 'weixin',
      success: async (loginRes) => {
        try {
          // 调用后端社交登录接口
          const result = await wechatMiniLogin({
            socialCode: loginRes.code,
            socialState: 'wechat_mini_login',
          })

          // 转换后端返回的数据格式为前端期望的格式
          const backendData = result as any
          console.log('微信登录后端返回:', backendData)

          // 提取用户信息并进行字段映射
          let userInfo: IUserInfoRes | undefined
          if (backendData.user) {
            userInfo = {
              userId: backendData.user.userId || '0',
              username: backendData.user.userName || backendData.user.nickName || '',
              nickname: backendData.user.nickName || '',
              avatar: backendData.user.avatar || '/static/images/default-avatar.png',
              // 扩展字段
              phonenumber: backendData.user.phonenumber || '',
              sex: backendData.user.sex || '',
              email: backendData.user.email || '',
            }
          }

          // 将后端返回的 access_token, expire_in 格式转换为前端期望的 token, expiresIn 格式
          const transformedData: IFullLoginRes = {
            token: backendData.access_token || backendData.token || '',
            expiresIn: backendData.expire_in || backendData.expiresIn || 7200,
            user: userInfo,
          }

          console.log('微信登录转换后数据:', transformedData)
          resolve(transformedData)
        }
        catch (error) {
          reject(error)
        }
      },
      fail: (error) => {
        reject(new Error(`微信登录失败: ${error.errMsg}`))
      },
    })
    // #endif

    // #ifndef MP-WEIXIN
    reject(new Error('仅支持在微信小程序环境中使用'))
    // #endif
  })
}
