import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("开始初始化配置...");

  // 常见的配置示例（排除数据库相关配置）
  const configs = [
    // 认证配置
    {
      key: "AUTH_SECRET",
      value: "your-auth-secret-here",
      description: "NextAuth.js 认证密钥",
      category: "auth",
      isSecret: true,
    },
    {
      key: "NEXTAUTH_URL",
      value: "http://localhost:3000",
      description: "应用的基础 URL",
      category: "auth",
      isSecret: false,
    },
    
    // 邮件配置
    {
      key: "SMTP_HOST",
      value: "smtp.example.com",
      description: "SMTP 服务器地址",
      category: "email",
      isSecret: false,
    },
    {
      key: "SMTP_PORT",
      value: "587",
      description: "SMTP 端口",
      category: "email",
      isSecret: false,
    },
    {
      key: "SMTP_USER",
      value: "user@example.com",
      description: "SMTP 用户名",
      category: "email",
      isSecret: false,
    },
    {
      key: "SMTP_PASSWORD",
      value: "your-smtp-password",
      description: "SMTP 密码",
      category: "email",
      isSecret: true,
    },
    {
      key: "EMAIL_FROM",
      value: "noreply@example.com",
      description: "发件人邮箱地址",
      category: "email",
      isSecret: false,
    },
    
    // 存储配置（OSS）
    {
      key: "OSS_REGION",
      value: "oss-cn-beijing",
      description: "OSS 区域",
      category: "storage",
      isSecret: false,
    },
    {
      key: "OSS_BUCKET",
      value: "your-bucket-name",
      description: "OSS 存储桶名称",
      category: "storage",
      isSecret: false,
    },
    {
      key: "OSS_ACCESS_KEY_ID",
      value: "your-access-key-id",
      description: "OSS 访问密钥 ID",
      category: "storage",
      isSecret: true,
    },
    {
      key: "OSS_ACCESS_KEY_SECRET",
      value: "your-access-key-secret",
      description: "OSS 访问密钥",
      category: "storage",
      isSecret: true,
    },
    {
      key: "OSS_HOST",
      value: "https://your-bucket-name.oss-cn-beijing.aliyuncs.com",
      description: "OSS 访问域名（前端直传使用）",
      category: "storage",
      isSecret: false,
    },
    
    // API 配置
    {
      key: "NEXT_PUBLIC_API_URL",
      value: "https://example.com",
      description: "公开的 API 基础地址",
      category: "api",
      isSecret: false,
    },
    {
      key: "API_RATE_LIMIT",
      value: "100",
      description: "API 速率限制（每分钟请求数）",
      category: "api",
      isSecret: false,
    },
    
    // 支付配置
    {
      key: "STRIPE_PUBLISHABLE_KEY",
      value: "pk_test_...",
      description: "Stripe 公钥",
      category: "payment",
      isSecret: false,
    },
    {
      key: "STRIPE_SECRET_KEY",
      value: "sk_test_...",
      description: "Stripe 密钥",
      category: "payment",
      isSecret: true,
    },
    
    // 其他配置
    {
      key: "APP_NAME",
      value: "Piaoliuping",
      description: "应用名称",
      category: "other",
      isSecret: false,
    },
    {
      key: "APP_ENV",
      value: "development",
      description: "应用环境（development/production）",
      category: "other",
      isSecret: false,
    },
  ];

  // 批量创建配置（跳过已存在的）
  for (const config of configs) {
    const existing = await prisma.config.findUnique({
      where: { key: config.key },
    });

    if (!existing) {
      await prisma.config.create({
        data: config,
      });
      console.log(`✅ 创建配置: ${config.key}`);
    } else {
      console.log(`⏭️  跳过已存在的配置: ${config.key}`);
    }
  }

  console.log("\n配置初始化完成！");
}

main()
  .catch((e) => {
    console.error("初始化配置失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
