import { prisma } from '@/lib/prisma'

/**
 * 配置管理工具类
 * 用于从数据库读取和更新系统配置
 */
export class ConfigManager {
  private static cache: Map<string, string> = new Map()
  private static cacheTime: number = 0
  private static cacheDuration: number = 5 * 60 * 1000 // 5分钟缓存

  /**
   * 获取配置值
   * @param key 配置键
   * @param defaultValue 默认值
   * @returns 配置值
   */
  static async get(key: string, defaultValue: string = ''): Promise<string> {
    // 检查缓存
    if (this.isCacheValid() && this.cache.has(key)) {
      return this.cache.get(key) || defaultValue
    }

    try {
      const config = await prisma.config.findUnique({
        where: { key },
      })

      const value = config?.value || defaultValue
      this.cache.set(key, value)
      return value
    } catch (error) {
      console.error(`获取配置失败: ${key}`, error)
      return defaultValue
    }
  }

  /**
   * 获取多个配置值
   * @param keys 配置键数组
   * @returns 配置键值对
   */
  static async getMany(keys: string[]): Promise<Record<string, string>> {
    try {
      const configs = await prisma.config.findMany({
        where: {
          key: {
            in: keys,
          },
        },
      })

      const result: Record<string, string> = {}
      configs.forEach((config) => {
        result[config.key] = config.value || ''
        this.cache.set(config.key, config.value || '')
      })

      return result
    } catch (error) {
      console.error('批量获取配置失败', error)
      return {}
    }
  }

  /**
   * 获取某个分类下的所有配置
   * @param categoryValue 分类标识
   * @returns 配置列表
   */
  static async getByCategory(categoryValue: string) {
    try {
      const category = await prisma.configCategory.findUnique({
        where: { value: categoryValue },
        include: {
          configs: true,
        },
      })

      return category?.configs || []
    } catch (error) {
      console.error(`获取分类配置失败: ${categoryValue}`, error)
      return []
    }
  }

  /**
   * 设置配置值
   * @param key 配置键
   * @param value 配置值
   */
  static async set(key: string, value: string): Promise<void> {
    try {
      await prisma.config.update({
        where: { key },
        data: { value },
      })

      // 更新缓存
      this.cache.set(key, value)
    } catch (error) {
      console.error(`设置配置失败: ${key}`, error)
      throw error
    }
  }

  /**
   * 批量设置配置
   * @param configs 配置键值对
   */
  static async setMany(configs: Record<string, string>): Promise<void> {
    try {
      await Promise.all(
        Object.entries(configs).map(([key, value]) =>
          prisma.config.update({
            where: { key },
            data: { value },
          })
        )
      )

      // 更新缓存
      Object.entries(configs).forEach(([key, value]) => {
        this.cache.set(key, value)
      })
    } catch (error) {
      console.error('批量设置配置失败', error)
      throw error
    }
  }

  /**
   * 清除缓存
   */
  static clearCache(): void {
    this.cache.clear()
    this.cacheTime = 0
  }

  /**
   * 检查缓存是否有效
   */
  private static isCacheValid(): boolean {
    return Date.now() - this.cacheTime < this.cacheDuration
  }

  /**
   * 刷新缓存
   */
  static async refreshCache(): Promise<void> {
    try {
      const configs = await prisma.config.findMany()
      this.cache.clear()
      configs.forEach((config) => {
        this.cache.set(config.key, config.value || '')
      })
      this.cacheTime = Date.now()
    } catch (error) {
      console.error('刷新配置缓存失败', error)
    }
  }
}

/**
 * 配置键常量
 * 方便在代码中使用，避免硬编码字符串
 */
export const ConfigKeys = {
  // 认证配置
  AUTH_SECRET: 'auth.secret',
  AUTH_TRUST_HOST: 'auth.trust_host',
  AUTH_URL: 'auth.url',

  // GitHub 配置
  GITHUB_CLIENT_ID: 'github.client_id',
  GITHUB_CLIENT_SECRET: 'github.client_secret',
  GITHUB_TOKEN: 'github.token',

  // Google 配置
  GOOGLE_CLIENT_ID: 'google.client_id',
  GOOGLE_CLIENT_SECRET: 'google.client_secret',

  // 邮件配置
  EMAIL_SMTP_HOST: 'email.smtp_host',
  EMAIL_SMTP_PORT: 'email.smtp_port',
  EMAIL_SMTP_USER: 'email.smtp_user',
  EMAIL_SMTP_PASS: 'email.smtp_pass',

  // 阿里云短信
  ALIYUN_SMS_ACCESS_KEY_ID: 'aliyun.sms.access_key_id',
  ALIYUN_SMS_ACCESS_KEY_SECRET: 'aliyun.sms.access_key_secret',
  ALIYUN_SMS_SIGN_NAME: 'aliyun.sms.sign_name',

  // 阿里云 OSS
  ALIYUN_OSS_REGION: 'aliyun.oss.region',
  ALIYUN_OSS_BUCKET: 'aliyun.oss.bucket',
  ALIYUN_OSS_ACCESS_KEY_ID: 'aliyun.oss.access_key_id',
  ALIYUN_OSS_ACCESS_KEY_SECRET: 'aliyun.oss.access_key_secret',
  ALIYUN_OSS_HOST: 'aliyun.oss.host',

  // 阿里云通用
  ALIYUN_ACCESS_KEY_ID: 'aliyun.access_key_id',
  ALIYUN_ACCESS_KEY_SECRET: 'aliyun.access_key_secret',

  // 数据库配置
  DATABASE_URL: 'database.url',

  // 微信小程序配置
  WECHAT_MINI_APPID: 'wechat.mini.appid',
  WECHAT_MINI_SECRET: 'wechat.mini.secret',

  // 微信支付配置
  WECHAT_PAY_MCH_ID: 'wechat.pay.mch_id',
  WECHAT_PAY_API_KEY: 'wechat.pay.api_key',
  WECHAT_PAY_API_V3_KEY: 'wechat.pay.api_v3_key',
  WECHAT_PAY_SERIAL_NO: 'wechat.pay.serial_no',
  WECHAT_PAY_CERT_P12_PATH: 'wechat.pay.cert_p12_path',
  WECHAT_PAY_CERT_PEM_PATH: 'wechat.pay.cert_pem_path',
  WECHAT_PAY_KEY_PEM_PATH: 'wechat.pay.key_pem_path',
  WECHAT_PAY_NOTIFY_URL: 'wechat.pay.notify_url',
  WECHAT_PAY_REFUND_NOTIFY_URL: 'wechat.pay.refund_notify_url',

  // 游戏配置
  GAME_LEVEL_EXP_BASE: 'game.level.exp.base',
  GAME_LEVEL_EXP_MULTIPLIER: 'game.level.exp.multiplier',
  GAME_BUBBLE_SPEED_MIN: 'game.bubble.speed.min',
  GAME_BUBBLE_SPEED_MAX: 'game.bubble.speed.max',
  GAME_CHALLENGE_DURATION: 'game.challenge.duration',

  // 系统配置
  SYSTEM_NAME: 'system.name',
  SYSTEM_VERSION: 'system.version',
  SYSTEM_MAINTENANCE: 'system.maintenance',
  SYSTEM_DEBUG: 'system.debug',

  // 域名配置
  DOMAIN: 'domain',

  // 登录配置
  LOGIN_STYLE: 'login.style',
} as const
