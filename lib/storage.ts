import OSS from "ali-oss";
import { getOssConfigValues } from "./oss-config";

/**
 * 从数据库获取存储配置
 */
async function getStorageConfig() {
  const { region, bucket, accessKeyId, accessKeySecret } = await getOssConfigValues();

  console.log('🔍 [Debug] OSS Config:', {
    region,
    bucket,
    accessKeyId: accessKeyId ? '***' : '(empty)',
    accessKeySecret: accessKeySecret ? '***' : '(empty)',
  });

  return {
    region,
    bucket,
    accessKeyId,
    accessKeySecret,
  };
}

/**
 * 创建 OSS 客户端
 */
async function createOSSClient() {
  const config = await getStorageConfig();

  if (!config.region || !config.bucket || !config.accessKeyId || !config.accessKeySecret) {
    throw new Error("存储配置不完整，请检查 aliyun.oss.region、aliyun.oss.bucket、aliyun.oss.access_key_id 和 aliyun.oss.access_key_secret");
  }

  // 处理 region 格式：如果包含 .aliyuncs.com，则提取 region ID
  let region = config.region;
  if (region.includes('.aliyuncs.com')) {
    region = region.replace('.aliyuncs.com', '');
  }
  // 如果是完整的 endpoint (如 https://oss-cn-beijing.aliyuncs.com)，也处理一下
  if (region.includes('://')) {
    region = region.split('://')[1];
  }
  if (region.includes('.')) {
     region = region.split('.')[0];
  }

  console.log(`🔍 [Debug] Using OSS Region: ${region}`);

  return new OSS({
    region: region,
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessKeySecret,
    bucket: config.bucket,
    secure: true, // 强制使用 HTTPS
  });
}

/**
 * 测试存储连接
 */
export async function testStorageConnection() {
  try {
    const config = await getStorageConfig();
    const ossClient = await createOSSClient();

    console.log(`测试连接到存储桶: ${config.bucket}`);

    // 测试: 上传一个测试文件
    const testContent = `存储测试文件
创建时间: ${new Date().toISOString()}
这是一个用于测试存储配置的文件，可以安全删除。
`;
    const testKey = `test/storage-test-${Date.now()}.txt`;
    
    console.log(`上传测试文件: ${testKey}`);
    const result = await ossClient.put(testKey, Buffer.from(testContent));

    return {
      success: true,
      message: "存储连接测试成功",
      details: {
        bucket: config.bucket,
        region: config.region,
        testFile: testKey,
        url: result.url,
      },
    };
  } catch (error: any) {
    console.error("存储连接测试失败:", error);
    
    // 解析错误信息
    let errorMessage = error.message || "存储连接测试失败";
    
    if (error.code === "NoSuchBucket") {
      errorMessage = `存储桶不存在，请检查 Bucket 名称是否正确`;
    } else if (error.code === "InvalidAccessKeyId") {
      errorMessage = "访问密钥 ID 无效，请检查 OSS_ACCESS_KEY_ID";
    } else if (error.code === "SignatureDoesNotMatch") {
      errorMessage = "访问密钥错误，请检查 OSS_ACCESS_KEY_SECRET";
    } else if (error.code === "AccessDenied" || error.status === 403) {
      errorMessage = "访问被拒绝，请检查 AccessKey 权限";
    } else if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      errorMessage = "无法连接到存储服务，请检查网络连接";
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * 上传文件到 OSS
 */
export async function uploadToOSS(params: {
  key: string;
  body: Buffer | string;
  contentType?: string;
}) {
  try {
    const ossClient = await createOSSClient();

    const result = await ossClient.put(params.key, params.body, {
      headers: params.contentType ? { "Content-Type": params.contentType } : undefined,
    });

    return {
      success: true,
      url: result.url,
      key: params.key,
    };
  } catch (error: any) {
    console.error("上传文件失败:", error);
    throw new Error(error.message || "上传文件失败");
  }
}
