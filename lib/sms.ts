import crypto from 'crypto';

const accessKeyId = process.env.ALIYUN_SMS_ACCESS_KEY_ID!;
const accessKeySecret = process.env.ALIYUN_SMS_ACCESS_KEY_SECRET!;

// 生成签名
function generateSignature(params: Record<string, string>, secret: string): string {
  const sortedKeys = Object.keys(params).sort();
  const canonicalizedQueryString = sortedKeys
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const stringToSign = `POST&${encodeURIComponent('/')}&${encodeURIComponent(canonicalizedQueryString)}`;
  const signature = crypto
    .createHmac('sha1', secret + '&')
    .update(stringToSign)
    .digest('base64');
  
  return signature;
}

// 生成随机字符串
function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 获取时间戳
function getTimestamp(): string {
  return new Date().toISOString();
}

export async function sendSms(phone: string, code: string, templateCode: string) {
  try {
    const params: Record<string, string> = {
      'Action': 'SendSms',
      'Version': '2017-05-25',
      'AccessKeyId': accessKeyId,
      'SignatureMethod': 'HMAC-SHA1',
      'Timestamp': getTimestamp(),
      'SignatureVersion': '1.0',
      'SignatureNonce': generateNonce(),
      'Format': 'JSON',
      'PhoneNumbers': phone,
      'SignName': process.env.ALIYUN_SMS_SIGN_NAME!,
      'TemplateCode': templateCode,
      'TemplateParam': JSON.stringify({ code }),
    };

    // 生成签名
    const signature = generateSignature(params, accessKeySecret);
    params['Signature'] = signature;

    // 构建请求体
    const body = new URLSearchParams(params).toString();

    const response = await fetch('https://dysmsapi.aliyuncs.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const result = await response.json();
    
    if (result.Code !== 'OK') {
      throw new Error(result.Message || '短信发送失败');
    }

    return true;
  } catch (error) {
    console.error('短信发送失败:', error);
    throw error;
  }
} 