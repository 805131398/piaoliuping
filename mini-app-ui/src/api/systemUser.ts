import { http } from '@/http/http'

export interface ISysUserItem {
  userId: string | number
  userName?: string
  nickName?: string
  phonenumber?: string
  roles?: Array<string | { roleKey?: string; roleId?: number; [k: string]: any }>
  [k: string]: any
}

export interface IPageResp<T = any> {
  rows?: T[]
  total?: number
  list?: T[]
  records?: T[]
  [k: string]: any
}

/**
 * 获取存在手机号的用户列表
 * ruoyi: GET /system/user/listExistPhoneNumber
 */
export function listExistPhoneNumber(params?: { pageNum?: number; pageSize?: number; phonenumber?: string }) {
  return http.get<IPageResp<ISysUserItem>>('/system/user/listExistPhoneNumber', params as any)
}

/**
 * 用户授权角色
 * ruoyi: PUT /system/user/authRole (userId, roleIds[] 作为 query 参数)
 */
export function grantUserRoles(userId: string | number, roleIds: Array<string | number>) {
  // 以 query 方式传参，兼容后端 @RequestParam 解析
  return http.put<void>('/system/user/authRole', {}, { userId, roleIds })
}

/**
 * 获取用户已授权的角色
 * ruoyi: GET /system/user/authRole/{userId}
 */
export function getUserAuthRole(userId: string | number) {
  return http.get<any>(`/system/user/authRole/${userId}`)
}
