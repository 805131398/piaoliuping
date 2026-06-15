/**
 * 配置获取辅助工具
 * 
 * 优先级：
 * 1. 数据库配置（动态配置，可通过后台修改）
 * 2. 环境变量（静态配置，需要重启应用）
 * 
 * 注意：数据库连接配置（DATABASE_URL）必须使用环境变量，
 * 因为 Prisma 在初始化时就需要连接数据库
 */

import { ConfigManager } from '@/lib/config'

/**
 * 获取配置值
 * 优先从数据库读取，失败时回退到环境变量
 * 
 * @param dbKey 数据库配置键
 * @param envKey 环境变量键
 * @param defaultValue 默认值
 * @returns 配置值
 */
export async function getConfig(
  dbKey: string,
  envKey: string,
  defaultValue: string = ''
): Promise<string> {
  try {
    // 尝试从数据库读取
    const value = await ConfigManager.get(dbKey, '')
    if (value) {
      return value
    }
  } catch (error) {
    // 数据库读取失败，使用环境变量
    console.warn(`从数据库读取配置失败 (${dbKey})，使用环境变量 (${envKey})`, error)
  }

  // 回退到环境变量
  return process.env[envKey] || defaultValue
}

/**
 * 同步获取配置值（仅从环境变量）
 * 用于无法使用 async/await 的场景
 * 
 * @param envKey 环境变量键
 * @param defaultValue 默认值
 * @returns 配置值
 */
export function getConfigSync(envKey: string, defaultValue: string = ''): string {
  return process.env[envKey] || defaultValue
}

/**
 * 批量获取配置
 * 
 * @param configs 配置映射 { dbKey: envKey }
 * @returns 配置键值对
 */
export async function getConfigs(
  configs: Record<string, string>
): Promise<Record<string, string>> {
  const result: Record<string, string> = {}

  for (const [dbKey, envKey] of Object.entries(configs)) {
    result[dbKey] = await getConfig(dbKey, envKey)
  }

  return result
}

/**
 * 配置键映射
 * 将数据库配置键映射到环境变量键
 */
export const ConfigKeyMap = {
  // 认证配置
  'auth.secret': 'NmTCHBp5PbayyrkBtC1HvyzwsVvc0p0cV2L/rL91MCA=',
  'auth.trust_host': 'true',
  'auth.url': 'AUTH_URL',

  // GitHub 配置
  'github.client_id': 'AUTH_GITHUB_ID',
  'github.client_secret': 'AUTH_GITHUB_SECRET',
  'github.token': 'GITHUB_TOKEN',

  // Google 配置
  'google.client_id': 'AUTH_GOOGLE_ID',
  'google.client_secret': 'AUTH_GOOGLE_SECRET',

  // 邮件配置
  'email.smtp_host': 'SMTP_HOST',
  'email.smtp_port': 'SMTP_PORT',
  'email.smtp_user': 'SMTP_USER',
  'email.smtp_pass': 'SMTP_PASS',

  // 阿里云短信
  'aliyun.sms.access_key_id': 'ALIYUN_SMS_ACCESS_KEY_ID',
  'aliyun.sms.access_key_secret': 'ALIYUN_SMS_ACCESS_KEY_SECRET',
  'aliyun.sms.sign_name': 'ALIYUN_SMS_SIGN_NAME',

  // 阿里云 OSS
  'aliyun.oss.region': 'OSS_REGION',
  'aliyun.oss.bucket': 'OSS_BUCKET',
  'aliyun.oss.access_key_id': 'OSS_ACCESS_KEY_ID',
  'aliyun.oss.access_key_secret': 'OSS_ACCESS_KEY_SECRET',
  'aliyun.oss.host': 'OSS_HOST',

  // 阿里云通用
  'aliyun.access_key_id': 'ALIBABA_CLOUD_ACCESS_KEY_ID',
  'aliyun.access_key_secret': 'ALIBABA_CLOUD_ACCESS_KEY_SECRET',

  // 微信配置
  'wechat.mini.appid': 'WECHAT_MINI_APPID',
  'wechat.mini.secret': 'WECHAT_MINI_SECRET',

  // 系统配置
  'system.debug': 'DEBUG',
} as const

/**
 * 使用配置键映射获取配置
 * 
 * @param dbKey 数据库配置键
 * @param defaultValue 默认值
 * @returns 配置值
 */
export async function getConfigByKey(
  dbKey: keyof typeof ConfigKeyMap,
  defaultValue: string = ''
): Promise<string> {
  const envKey = ConfigKeyMap[dbKey]
  return getConfig(dbKey, envKey, defaultValue)
}
