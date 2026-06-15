/**
 * 修复 OSS AccessKey Secret 配置
 * 运行: npx tsx scripts/fix-oss-secret.ts
 */

import { PrismaClient } from "@prisma/client";
import * as readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log("=".repeat(60));
  console.log("OSS AccessKey Secret 配置修复工具");
  console.log("=".repeat(60));
  console.log("");

  // 显示当前配置
  const currentConfig = await prisma.config.findUnique({
    where: { key: "OSS_ACCESS_KEY_SECRET" },
  });

  if (currentConfig?.value) {
    console.log("当前 OSS_ACCESS_KEY_SECRET:");
    console.log(`  值: ***${currentConfig.value.substring(currentConfig.value.length - 4)}`);
    console.log(`  长度: ${currentConfig.value.length} 个字符`);
    console.log("");
  } else {
    console.log("⚠️  当前未配置 OSS_ACCESS_KEY_SECRET\n");
  }

  // 获取 AccessKey ID 作为参考
  const keyIdConfig = await prisma.config.findUnique({
    where: { key: "OSS_ACCESS_KEY_ID" },
  });

  if (keyIdConfig?.value) {
    console.log("对应的 OSS_ACCESS_KEY_ID:");
    console.log(`  值: ${keyIdConfig.value.substring(0, 10)}...${keyIdConfig.value.substring(keyIdConfig.value.length - 4)}`);
    console.log("");
  }

  console.log("请按以下步骤操作：");
  console.log("1. 登录阿里云 RAM 控制台: https://ram.console.aliyun.com/users");
  console.log("2. 找到对应的 AccessKey ID");
  console.log("3. 查看或重新生成 AccessKey Secret");
  console.log("");

  const answer = await question("是否要更新 OSS_ACCESS_KEY_SECRET？(y/n): ");

  if (answer.toLowerCase() !== "y") {
    console.log("已取消");
    await cleanup();
    return;
  }

  const newSecret = await question("\n请输入新的 AccessKey Secret: ");

  if (!newSecret || newSecret.trim().length === 0) {
    console.log("❌ 密钥不能为空");
    await cleanup();
    return;
  }

  // 更新配置
  await prisma.config.update({
    where: { key: "OSS_ACCESS_KEY_SECRET" },
    data: { value: newSecret.trim() },
  });

  console.log("\n✅ OSS_ACCESS_KEY_SECRET 已更新");
  console.log(`   长度: ${newSecret.trim().length} 个字符`);
  console.log("");
  console.log("现在可以在配置管理页面测试存储连接");

  await cleanup();
}

async function cleanup() {
  rl.close();
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("错误:", error);
  cleanup();
});
