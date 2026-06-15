import { prisma } from "./prisma";

const OSS_CONFIG_KEYS = [
  "aliyun.oss.region",
  "aliyun.oss.bucket",
  "aliyun.oss.access_key_id",
  "aliyun.oss.access_key_secret",
  "aliyun.oss.host",
  "aliyun.oss.domain",
] as const;

export interface OssConfigValues {
  region: string;
  bucket: string;
  accessKeyId: string;
  accessKeySecret: string;
  host: string;
  domain: string;
}

/**
 * 直接按配置键读取 OSS 配置，避免依赖分类名。
 */
export async function getOssConfigValues(): Promise<OssConfigValues> {
  const configs = await prisma.config.findMany({
    where: {
      key: {
        in: [...OSS_CONFIG_KEYS],
      },
    },
  });

  const configMap = new Map(configs.map((config) => [config.key, config.value || ""]));

  return {
    region: configMap.get("aliyun.oss.region") || process.env.OSS_REGION || "",
    bucket: configMap.get("aliyun.oss.bucket") || process.env.OSS_BUCKET || "",
    accessKeyId: configMap.get("aliyun.oss.access_key_id") || process.env.OSS_ACCESS_KEY_ID || "",
    accessKeySecret: configMap.get("aliyun.oss.access_key_secret") || process.env.OSS_ACCESS_KEY_SECRET || "",
    host: configMap.get("aliyun.oss.host") || process.env.OSS_HOST || "",
    domain: configMap.get("aliyun.oss.domain") || "",
  };
}
