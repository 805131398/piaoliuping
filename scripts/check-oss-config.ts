/**
 * 阿里云 OSS 配置检查脚本（从数据库读取配置）
 * 运行: npx tsx scripts/check-oss-config.ts
 */

import { PrismaClient } from "@prisma/client";
import OSS from "ali-oss";

const prisma = new PrismaClient();

async function checkOSSConfig() {
  console.log("🔍 开始检查阿里云 OSS 配置...\n");

  try {
    // 1. 读取配置
    console.log("📋 步骤 1: 读取数据库配置");
    const configs = await prisma.config.findMany({
      where: { category: { value: "storage" } },
    });

    const configMap: Record<string, string> = {};
    configs.forEach((config) => {
      if (config.value) {
        configMap[config.key] = config.value;
      }
    });

    const bucket = configMap.OSS_BUCKET || configMap.S3_BUCKET;
    const region = configMap.OSS_REGION || configMap.S3_REGION;
    const accessKeyId = configMap.OSS_ACCESS_KEY_ID || configMap.S3_ACCESS_KEY_ID;
    const secretAccessKey = configMap.OSS_ACCESS_KEY_SECRET || configMap.S3_SECRET_ACCESS_KEY;

    // 显示配置（脱敏）
    console.log("  ✓ 配置读取成功");
    console.log(`    Bucket: ${bucket}`);
    console.log(`    Region: ${region}`);
    console.log(`    AccessKeyId: ${accessKeyId?.substring(0, 10)}...`);
    console.log(`    SecretAccessKey: ${secretAccessKey ? "***" + secretAccessKey.substring(secretAccessKey.length - 4) : "未设置"}\n`);

    // 2. 检查配置完整性
    console.log("📋 步骤 2: 检查配置完整性");
    const missingConfigs: string[] = [];
    if (!bucket) missingConfigs.push("OSS_BUCKET");
    if (!region) missingConfigs.push("OSS_REGION");
    if (!accessKeyId) missingConfigs.push("OSS_ACCESS_KEY_ID");
    if (!secretAccessKey) missingConfigs.push("OSS_ACCESS_KEY_SECRET");

    if (missingConfigs.length > 0) {
      console.log(`  ✗ 配置不完整，缺少: ${missingConfigs.join(", ")}\n`);
      return;
    }
    console.log("  ✓ 配置完整\n");

    // 3. 创建 OSS 客户端
    console.log("📋 步骤 3: 创建 OSS 客户端");
    const ossClient = new OSS({
      region: region,
      accessKeyId: accessKeyId,
      accessKeySecret: secretAccessKey,
      bucket: bucket,
    });
    console.log("  ✓ OSS 客户端创建成功\n");

    // 4. 测试文件上传
    console.log("📋 步骤 4: 测试文件上传");
    const testKey = `test/config-check-${Date.now()}.txt`;
    const testContent = `配置检查测试文件
创建时间: ${new Date().toISOString()}
这是一个测试文件，可以安全删除。
`;

    try {
      const result = await ossClient.put(testKey, Buffer.from(testContent));
      console.log("  ✓ 文件上传成功");
      console.log(`    测试文件: ${testKey}`);
      console.log(`    文件 URL: ${result.url}\n`);
    } catch (error: any) {
      console.log("  ✗ 文件上传失败");
      console.log(`     错误: ${error.code || error.name} - ${error.message}`);
      
      console.log("\n💡 可能的原因:");
      if (error.status === 403 || error.code === "AccessDenied") {
        console.log("  1. AccessKey 没有访问该 Bucket 的权限");
        console.log("  2. AccessKey 或 Secret 错误");
        console.log("  3. Bucket 所属账号与 AccessKey 不匹配");
        console.log("\n🔧 解决方法:");
        console.log("  • 登录阿里云 RAM 控制台: https://ram.console.aliyun.com");
        console.log("  • 检查该 AccessKey 对应的用户权限");
        console.log("  • 确保用户有 AliyunOSSFullAccess 或自定义 OSS 权限");
      } else if (error.status === 404 || error.code === "NoSuchBucket") {
        console.log("  1. Bucket 不存在");
        console.log("  2. Bucket 名称拼写错误");
        console.log("  3. Region 配置错误");
        console.log("\n🔧 解决方法:");
        console.log("  • 登录阿里云 OSS 控制台: https://oss.console.aliyun.com");
        console.log("  • 确认 Bucket 名称和所在区域");
      }
      console.log();
      return;
    }

    // 5. 总结
    console.log("✅ 所有检查通过！OSS 配置正确，可以正常使用。\n");

  } catch (error: any) {
    console.error("❌ 检查过程出错:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkOSSConfig();
