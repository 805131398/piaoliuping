import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { ConfigManager, ConfigKeys } from './config';

/**
 * 微信支付 V3 API 工具类
 * 
 * 封装了以下功能：
 * 1. JSAPI/小程序下单
 * 2. 小程序调起支付参数生成
 * 3. 微信支付订单号查询订单
 * 4. 商户订单号查询订单
 * 5. 支付回调验签及解密
 */

// ======================== 类型定义 ========================

/** 下单请求参数 */
export interface CreateOrderParams {
  /** 商品描述 */
  description: string;
  /** 商户订单号 (6-32字符) */
  outTradeNo: string;
  /** 订单金额 (单位: 分) */
  amountTotal: number;
  /** 用户openid */
  payerOpenid: string;
  /** 支付结束时间 (可选，RFC3339格式) */
  timeExpire?: string;
  /** 商户数据包 (可选，最长128字符) */
  attach?: string;
  /** 订单优惠标记 (可选) */
  goodsTag?: string;
  /** 是否开启电子发票入口 (可选) */
  supportFapiao?: boolean;
  /** 商品详情 (可选) */
  detail?: {
    costPrice?: number;
    invoiceId?: string;
    goodsDetail?: Array<{
      merchantGoodsId: string;
      wechatpayGoodsId?: string;
      goodsName?: string;
      quantity: number;
      unitPrice: number;
    }>;
  };
  /** 场景信息 (可选) */
  sceneInfo?: {
    payerClientIp?: string;
    deviceId?: string;
    storeInfo?: {
      id: string;
      name?: string;
      areaCode?: string;
      address?: string;
    };
  };
}

/** 下单响应 */
export interface CreateOrderResponse {
  prepayId: string;
}

/** 小程序支付参数 */
export interface MiniProgramPaymentParams {
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: string;
  paySign: string;
}

/** 订单查询响应 */
export interface OrderQueryResponse {
  appid: string;
  mchid: string;
  outTradeNo: string;
  transactionId: string;
  tradeType: 'JSAPI' | 'NATIVE' | 'APP' | 'MICROPAY' | 'MWEB' | 'FACEPAY';
  tradeState: 'SUCCESS' | 'REFUND' | 'NOTPAY' | 'CLOSED' | 'REVOKED' | 'USERPAYING' | 'PAYERROR';
  tradeStateDesc: string;
  bankType?: string;
  attach?: string;
  successTime?: string;
  payer?: {
    openid: string;
  };
  amount?: {
    total: number;
    payerTotal: number;
    currency: string;
    payerCurrency: string;
  };
  sceneInfo?: {
    deviceId?: string;
  };
  promotionDetail?: Array<{
    couponId: string;
    name?: string;
    scope?: string;
    type?: string;
    amount: number;
    stockId?: string;
    wechatpayContribute?: number;
    merchantContribute?: number;
    otherContribute?: number;
    currency?: string;
  }>;
}

/** 支付回调通知数据 */
export interface PaymentNotification {
  id: string;
  createTime: string;
  eventType: string;
  resourceType: string;
  resource: {
    algorithm: string;
    ciphertext: string;
    associatedData?: string;
    nonce: string;
    originalType: string;
  };
  summary: string;
}

/** 解密后的支付结果 */
export interface DecryptedPaymentResult {
  appid: string;
  mchid: string;
  outTradeNo: string;
  transactionId: string;
  tradeType: string;
  tradeState: string;
  tradeStateDesc: string;
  bankType?: string;
  attach?: string;
  successTime: string;
  payer: {
    openid: string;
  };
  amount: {
    total: number;
    payerTotal: number;
    currency: string;
    payerCurrency: string;
  };
}

/** 微信支付配置 */
interface WechatPayConfig {
  appid: string;
  mchid: string;
  apiV3Key: string;
  serialNo: string;
  privateKey: string;
  notifyUrl: string;
}

// ======================== 工具类实现 ========================

/** 平台证书信息 */
interface PlatformCertificate {
  serialNo: string;
  effectiveTime: string;
  expireTime: string;
  publicKey: string;
}

export class WechatPay {
  private static instance: WechatPay | null = null;
  private config: WechatPayConfig | null = null;
  private configLoaded = false;
  
  /** 平台证书缓存 (serialNo -> certificate) */
  private platformCerts: Map<string, PlatformCertificate> = new Map();
  private platformCertsLoaded = false;

  private static readonly API_BASE_URL = 'https://api.mch.weixin.qq.com';
  private static readonly CERTS_DIR = path.join(process.cwd(), 'data', 'certs');

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): WechatPay {
    if (!WechatPay.instance) {
      WechatPay.instance = new WechatPay();
    }
    return WechatPay.instance;
  }

  /**
   * 加载配置
   */
  private async loadConfig(): Promise<WechatPayConfig> {
    if (this.configLoaded && this.config) {
      return this.config;
    }

    const configs = await ConfigManager.getMany([
      ConfigKeys.WECHAT_MINI_APPID,
      ConfigKeys.WECHAT_PAY_MCH_ID,
      ConfigKeys.WECHAT_PAY_API_V3_KEY,
      ConfigKeys.WECHAT_PAY_SERIAL_NO,
      ConfigKeys.WECHAT_PAY_KEY_PEM_PATH,
      ConfigKeys.WECHAT_PAY_NOTIFY_URL,
    ]);

    const keyPemPath = configs[ConfigKeys.WECHAT_PAY_KEY_PEM_PATH];
    let privateKey: string;

    // 默认私钥路径
    const defaultKeyPath = path.join(process.cwd(), 'data', 'certs', 'apiclient_key.pem');

    // 支持从文件路径或直接配置内容读取私钥
    if (keyPemPath && fs.existsSync(keyPemPath)) {
      privateKey = fs.readFileSync(keyPemPath, 'utf-8');
    } else if (keyPemPath && keyPemPath.includes('-----BEGIN')) {
      // 如果配置直接是私钥内容
      privateKey = keyPemPath;
    } else if (fs.existsSync(defaultKeyPath)) {
      // 使用默认路径
      privateKey = fs.readFileSync(defaultKeyPath, 'utf-8');
      console.log('[WECHAT_PAY] Using default key path:', defaultKeyPath);
    } else {
      throw new Error('微信支付私钥配置不正确，请检查 wechat.pay.key_pem_path 配置或将私钥放到 data/certs/apiclient_key.pem');
    }

    this.config = {
      appid: configs[ConfigKeys.WECHAT_MINI_APPID],
      mchid: configs[ConfigKeys.WECHAT_PAY_MCH_ID],
      apiV3Key: configs[ConfigKeys.WECHAT_PAY_API_V3_KEY],
      serialNo: configs[ConfigKeys.WECHAT_PAY_SERIAL_NO],
      privateKey,
      notifyUrl: configs[ConfigKeys.WECHAT_PAY_NOTIFY_URL],
    };

    // 调试：打印配置信息（隐藏敏感信息）
    console.log('[WECHAT_PAY] Config loaded:', {
      appid: this.config.appid,
      mchid: this.config.mchid,
      serialNo: this.config.serialNo,
      notifyUrl: this.config.notifyUrl,
      apiV3KeyLength: this.config.apiV3Key?.length || 0,
      privateKeyLength: privateKey?.length || 0,
      privateKeyPrefix: privateKey?.substring(0, 30) || 'N/A',
    });

    this.configLoaded = true;
    return this.config;
  }

  /**
   * 生成随机字符串
   */
  private generateNonceStr(length = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 获取当前时间戳 (秒)
   */
  private getTimestamp(): string {
    return Math.floor(Date.now() / 1000).toString();
  }

  /**
   * 使用私钥进行 RSA-SHA256 签名
   */
  private sign(message: string, privateKey: string): string {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(message);
    sign.end();
    return sign.sign(privateKey, 'base64');
  }

  /**
   * 生成请求签名
   * @param method HTTP 方法
   * @param url 请求 URL (不含域名)
   * @param timestamp 时间戳
   * @param nonceStr 随机字符串
   * @param body 请求体 (JSON 字符串，GET 请求为空字符串)
   */
  private generateSignature(
    method: string,
    url: string,
    timestamp: string,
    nonceStr: string,
    body: string,
    privateKey: string
  ): string {
    const message = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${body}\n`;
    return this.sign(message, privateKey);
  }

  /**
   * 构建 Authorization Header
   */
  private buildAuthorizationHeader(
    method: string,
    url: string,
    body: string,
    mchid: string,
    serialNo: string,
    privateKey: string
  ): string {
    const timestamp = this.getTimestamp();
    const nonceStr = this.generateNonceStr();
    const signature = this.generateSignature(method, url, timestamp, nonceStr, body, privateKey);

    return `WECHATPAY2-SHA256-RSA2048 mchid="${mchid}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timestamp}",serial_no="${serialNo}"`;
  }

  /**
   * 发送请求到微信支付 API
   */
  private async request<T>(
    method: 'GET' | 'POST',
    urlPath: string,
    body?: object
  ): Promise<T> {
    const config = await this.loadConfig();
    const bodyStr = body ? JSON.stringify(body) : '';

    const authorization = this.buildAuthorizationHeader(
      method,
      urlPath,
      bodyStr,
      config.mchid,
      config.serialNo,
      config.privateKey
    );

    const headers: Record<string, string> = {
      'Authorization': authorization,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Accept-Language': 'zh-CN',
    };

    console.log('[WECHAT_PAY] Request:', {
      method,
      url: `${WechatPay.API_BASE_URL}${urlPath}`,
      bodyLength: bodyStr.length,
    });

    const response = await fetch(`${WechatPay.API_BASE_URL}${urlPath}`, {
      method,
      headers,
      body: method === 'POST' ? bodyStr : undefined,
    });

    const responseText = await response.text();

    console.log('[WECHAT_PAY] Response:', {
      status: response.status,
      body: responseText.substring(0, 500),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }
      console.error('[WECHAT_PAY] Error:', errorData);
      throw new WechatPayError(
        errorData.code || 'UNKNOWN_ERROR',
        errorData.message || '微信支付请求失败',
        response.status
      );
    }

    return JSON.parse(responseText) as T;
  }

  // ======================== 公开 API ========================

  /**
   * JSAPI/小程序下单
   * @param params 下单参数
   * @returns 预支付交易会话标识
   * @see https://pay.weixin.qq.com/doc/v3/merchant/4012791897
   */
  async createJsapiOrder(params: CreateOrderParams): Promise<CreateOrderResponse> {
    const config = await this.loadConfig();

    const requestBody: Record<string, unknown> = {
      appid: config.appid,
      mchid: config.mchid,
      description: params.description,
      out_trade_no: params.outTradeNo,
      notify_url: config.notifyUrl,
      amount: {
        total: params.amountTotal,
        currency: 'CNY',
      },
      payer: {
        openid: params.payerOpenid,
      },
    };

    // 可选参数
    if (params.timeExpire) {
      requestBody.time_expire = params.timeExpire;
    }
    if (params.attach) {
      requestBody.attach = params.attach;
    }
    if (params.goodsTag) {
      requestBody.goods_tag = params.goodsTag;
    }
    if (params.supportFapiao !== undefined) {
      requestBody.support_fapiao = params.supportFapiao;
    }
    if (params.detail) {
      requestBody.detail = {
        cost_price: params.detail.costPrice,
        invoice_id: params.detail.invoiceId,
        goods_detail: params.detail.goodsDetail?.map(item => ({
          merchant_goods_id: item.merchantGoodsId,
          wechatpay_goods_id: item.wechatpayGoodsId,
          goods_name: item.goodsName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        })),
      };
    }
    if (params.sceneInfo) {
      requestBody.scene_info = {
        payer_client_ip: params.sceneInfo.payerClientIp,
        device_id: params.sceneInfo.deviceId,
        store_info: params.sceneInfo.storeInfo ? {
          id: params.sceneInfo.storeInfo.id,
          name: params.sceneInfo.storeInfo.name,
          area_code: params.sceneInfo.storeInfo.areaCode,
          address: params.sceneInfo.storeInfo.address,
        } : undefined,
      };
    }

    const response = await this.request<{ prepay_id: string }>(
      'POST',
      '/v3/pay/transactions/jsapi',
      requestBody
    );

    return {
      prepayId: response.prepay_id,
    };
  }

  /**
   * 生成小程序调起支付的参数
   * @param prepayId 预支付交易会话标识
   * @returns 小程序调起支付所需参数
   * @see https://pay.weixin.qq.com/doc/v3/merchant/4012791898
   */
  async getMiniProgramPaymentParams(prepayId: string): Promise<MiniProgramPaymentParams> {
    const config = await this.loadConfig();
    const timeStamp = this.getTimestamp();
    const nonceStr = this.generateNonceStr();
    const packageStr = `prepay_id=${prepayId}`;

    // 签名字符串: appId + 时间戳 + 随机字符串 + package
    const message = `${config.appid}\n${timeStamp}\n${nonceStr}\n${packageStr}\n`;
    const paySign = this.sign(message, config.privateKey);

    return {
      timeStamp,
      nonceStr,
      package: packageStr,
      signType: 'RSA',
      paySign,
    };
  }

  /**
   * 微信支付订单号查询订单
   * @param transactionId 微信支付订单号
   * @returns 订单信息
   * @see https://pay.weixin.qq.com/doc/v3/merchant/4012791899
   */
  async queryOrderByTransactionId(transactionId: string): Promise<OrderQueryResponse> {
    const config = await this.loadConfig();
    const urlPath = `/v3/pay/transactions/id/${transactionId}?mchid=${config.mchid}`;

    const response = await this.request<Record<string, unknown>>('GET', urlPath);

    return this.transformOrderResponse(response);
  }

  /**
   * 商户订单号查询订单
   * @param outTradeNo 商户订单号
   * @returns 订单信息
   * @see https://pay.weixin.qq.com/doc/v3/merchant/4013070356
   */
  async queryOrderByOutTradeNo(outTradeNo: string): Promise<OrderQueryResponse> {
    const config = await this.loadConfig();
    const urlPath = `/v3/pay/transactions/out-trade-no/${outTradeNo}?mchid=${config.mchid}`;

    const response = await this.request<Record<string, unknown>>('GET', urlPath);

    return this.transformOrderResponse(response);
  }

  /**
   * 关闭订单
   * @param outTradeNo 商户订单号
   * @see https://pay.weixin.qq.com/doc/v3/merchant/4012791860
   */
  async closeOrder(outTradeNo: string): Promise<void> {
    const config = await this.loadConfig();
    await this.request<void>(
      'POST',
      `/v3/pay/transactions/out-trade-no/${outTradeNo}/close`,
      { mchid: config.mchid }
    );
  }

  // ======================== 平台证书管理 ========================

  /**
   * 下载并缓存微信支付平台证书
   * @see https://pay.weixin.qq.com/doc/v3/merchant/4012068815
   */
  async downloadPlatformCertificates(): Promise<void> {
    const config = await this.loadConfig();
    
    // 调用证书下载接口
    const response = await this.request<{
      data: Array<{
        serial_no: string;
        effective_time: string;
        expire_time: string;
        encrypt_certificate: {
          algorithm: string;
          nonce: string;
          associated_data: string;
          ciphertext: string;
        };
      }>;
    }>('GET', '/v3/certificates');

    // 解密并缓存每个证书
    for (const cert of response.data) {
      const decryptedCert = this.aesGcmDecrypt(
        cert.encrypt_certificate.ciphertext,
        config.apiV3Key,
        cert.encrypt_certificate.nonce,
        cert.encrypt_certificate.associated_data
      );

      const platformCert: PlatformCertificate = {
        serialNo: cert.serial_no,
        effectiveTime: cert.effective_time,
        expireTime: cert.expire_time,
        publicKey: decryptedCert,
      };

      this.platformCerts.set(cert.serial_no, platformCert);

      // 保存到本地文件（作为备份）
      try {
        const certPath = path.join(WechatPay.CERTS_DIR, `platform_cert_${cert.serial_no}.pem`);
        fs.writeFileSync(certPath, decryptedCert);
        console.log(`[WECHAT_PAY] Platform certificate saved: ${certPath}`);
      } catch (error) {
        console.error('[WECHAT_PAY] Failed to save platform certificate:', error);
      }
    }

    this.platformCertsLoaded = true;
    console.log(`[WECHAT_PAY] Downloaded ${response.data.length} platform certificate(s)`);
  }

  /**
   * 获取平台证书（根据序列号）
   * 如果缓存中没有，会自动下载
   */
  async getPlatformCertificate(serialNo: string): Promise<string> {
    // 先尝试从缓存获取
    if (this.platformCerts.has(serialNo)) {
      const cert = this.platformCerts.get(serialNo)!;
      // 检查是否过期
      if (new Date(cert.expireTime) > new Date()) {
        return cert.publicKey;
      }
    }

    // 尝试从本地文件加载
    const localCertPath = path.join(WechatPay.CERTS_DIR, `platform_cert_${serialNo}.pem`);
    if (fs.existsSync(localCertPath)) {
      const publicKey = fs.readFileSync(localCertPath, 'utf-8');
      this.platformCerts.set(serialNo, {
        serialNo,
        effectiveTime: '',
        expireTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 本地加载的假设24小时有效
        publicKey,
      });
      return publicKey;
    }

    // 从微信下载证书
    await this.downloadPlatformCertificates();

    const cert = this.platformCerts.get(serialNo);
    if (!cert) {
      throw new Error(`Platform certificate not found for serial: ${serialNo}`);
    }

    return cert.publicKey;
  }

  /**
   * 验证支付回调签名（自动获取平台证书）
   * @param timestamp 回调头中的时间戳 (Wechatpay-Timestamp)
   * @param nonce 回调头中的随机字符串 (Wechatpay-Nonce)
   * @param body 回调请求体
   * @param signature 回调头中的签名 (Wechatpay-Signature)
   * @param serialNo 回调头中的证书序列号 (Wechatpay-Serial)
   * @returns 是否验证通过
   */
  async verifyNotifySignature(
    timestamp: string,
    nonce: string,
    body: string,
    signature: string,
    serialNo: string
  ): Promise<boolean> {
    try {
      // 自动获取对应序列号的平台证书
      const publicKey = await this.getPlatformCertificate(serialNo);
      return this.verifySignature(timestamp, nonce, body, signature, publicKey);
    } catch (error) {
      console.error('[WECHAT_PAY] Verify notify signature failed:', error);
      return false;
    }
  }

  /**
   * 验证支付回调签名（需要提供公钥）
   * @param timestamp 回调头中的时间戳 (Wechatpay-Timestamp)
   * @param nonce 回调头中的随机字符串 (Wechatpay-Nonce)
   * @param body 回调请求体
   * @param signature 回调头中的签名 (Wechatpay-Signature)
   * @param wechatPublicKey 微信支付平台公钥
   * @returns 是否验证通过
   */
  verifySignature(
    timestamp: string,
    nonce: string,
    body: string,
    signature: string,
    wechatPublicKey: string
  ): boolean {
    try {
      const message = `${timestamp}\n${nonce}\n${body}\n`;
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(message);
      verify.end();
      return verify.verify(wechatPublicKey, signature, 'base64');
    } catch (error) {
      console.error('验签失败:', error);
      return false;
    }
  }

  /**
   * 解密支付回调通知数据
   * @param ciphertext 密文
   * @param associatedData 附加数据
   * @param nonce 随机串
   * @returns 解密后的支付结果
   */
  async decryptNotification(
    ciphertext: string,
    associatedData: string,
    nonce: string
  ): Promise<DecryptedPaymentResult> {
    const config = await this.loadConfig();
    const decrypted = this.aesGcmDecrypt(ciphertext, config.apiV3Key, nonce, associatedData);
    const result = JSON.parse(decrypted);

    return {
      appid: result.appid,
      mchid: result.mchid,
      outTradeNo: result.out_trade_no,
      transactionId: result.transaction_id,
      tradeType: result.trade_type,
      tradeState: result.trade_state,
      tradeStateDesc: result.trade_state_desc,
      bankType: result.bank_type,
      attach: result.attach,
      successTime: result.success_time,
      payer: {
        openid: result.payer?.openid,
      },
      amount: {
        total: result.amount?.total,
        payerTotal: result.amount?.payer_total,
        currency: result.amount?.currency,
        payerCurrency: result.amount?.payer_currency,
      },
    };
  }

  /**
   * AES-256-GCM 解密
   */
  private aesGcmDecrypt(
    ciphertext: string,
    key: string,
    nonce: string,
    associatedData: string
  ): string {
    const ciphertextBuffer = Buffer.from(ciphertext, 'base64');
    // 最后 16 字节是 auth tag
    const authTag = ciphertextBuffer.slice(-16);
    const encryptedData = ciphertextBuffer.slice(0, -16);

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(key),
      Buffer.from(nonce)
    );
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from(associatedData));

    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    return decrypted.toString('utf-8');
  }

  /**
   * 转换订单响应格式 (下划线 -> 驼峰)
   */
  private transformOrderResponse(response: Record<string, unknown>): OrderQueryResponse {
    return {
      appid: response.appid as string,
      mchid: response.mchid as string,
      outTradeNo: response.out_trade_no as string,
      transactionId: response.transaction_id as string,
      tradeType: response.trade_type as OrderQueryResponse['tradeType'],
      tradeState: response.trade_state as OrderQueryResponse['tradeState'],
      tradeStateDesc: response.trade_state_desc as string,
      bankType: response.bank_type as string | undefined,
      attach: response.attach as string | undefined,
      successTime: response.success_time as string | undefined,
      payer: response.payer ? {
        openid: (response.payer as Record<string, string>).openid,
      } : undefined,
      amount: response.amount ? {
        total: (response.amount as Record<string, number>).total,
        payerTotal: (response.amount as Record<string, number>).payer_total,
        currency: (response.amount as Record<string, string>).currency,
        payerCurrency: (response.amount as Record<string, string>).payer_currency,
      } : undefined,
      sceneInfo: response.scene_info ? {
        deviceId: (response.scene_info as Record<string, string>).device_id,
      } : undefined,
      promotionDetail: response.promotion_detail as OrderQueryResponse['promotionDetail'],
    };
  }
}

// ======================== 错误类 ========================

export class WechatPayError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.name = 'WechatPayError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

// ======================== 便捷导出 ========================

/** 获取微信支付实例 */
export const wechatPay = WechatPay.getInstance();

/**
 * 快捷创建订单并获取小程序支付参数
 * @param params 下单参数
 * @returns 小程序调起支付所需参数
 */
export async function createMiniProgramPayment(params: CreateOrderParams): Promise<{
  prepayId: string;
  paymentParams: MiniProgramPaymentParams;
}> {
  const { prepayId } = await wechatPay.createJsapiOrder(params);
  const paymentParams = await wechatPay.getMiniProgramPaymentParams(prepayId);
  return { prepayId, paymentParams };
}
