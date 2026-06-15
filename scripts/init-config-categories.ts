import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { value: "auth", label: "认证配置", description: "身份认证相关配置", order: 0 },
  { value: "email", label: "邮件配置", description: "邮件发送相关配置", order: 1 },
  { value: "storage", label: "存储配置", description: "文件存储相关配置", order: 2 },
  { value: "payment", label: "支付配置", description: "支付相关配置", order: 3 },
  { value: "api", label: "API配置", description: "外部API相关配置", order: 4 },
  { value: "other", label: "其他", description: "其他配置", order: 99 },
];

async function main() {
  console.log("开始初始化配置分类...");

  for (const category of DEFAULT_CATEGORIES) {
    const existing = await prisma.configCategory.findUnique({
      where: { value: category.value },
    });

    if (existing) {
      console.log(`分类 "${category.label}" 已存在，跳过`);
    } else {
      await prisma.configCategory.create({
        data: category,
      });
      console.log(`创建分类 "${category.label}" 成功`);
    }
  }

  // 迁移现有配置到新的分类关系
  // 查找所有未设置 categoryId 的配置
  const configsWithoutCategory = await prisma.config.findMany({
    where: { categoryId: null },
  });

  if (configsWithoutCategory.length > 0) {
    console.log(`\n发现 ${configsWithoutCategory.length} 个未分类的配置，尝试自动分类...`);
    
    // 获取所有分类
    const categories = await prisma.configCategory.findMany();
    const categoryMap = new Map(categories.map(c => [c.value, c.id]));

    for (const config of configsWithoutCategory) {
      // 根据配置键名推断分类
      let categoryValue = "other";
      const key = config.key.toLowerCase();
      
      if (key.includes("smtp") || key.includes("email") || key.includes("mail")) {
        categoryValue = "email";
      } else if (key.includes("oss") || key.includes("s3") || key.includes("storage") || key.includes("bucket")) {
        categoryValue = "storage";
      } else if (key.includes("auth") || key.includes("secret") || key.includes("jwt")) {
        categoryValue = "auth";
      } else if (key.includes("api") || key.includes("key")) {
        categoryValue = "api";
      } else if (key.includes("pay") || key.includes("stripe") || key.includes("alipay") || key.includes("wechat")) {
        categoryValue = "payment";
      }

      const categoryId = categoryMap.get(categoryValue);
      if (categoryId) {
        await prisma.config.update({
          where: { id: config.id },
          data: { categoryId },
        });
        console.log(`配置 "${config.key}" -> 分类 "${categoryValue}"`);
      }
    }
  }

  console.log("\n配置分类初始化完成！");
}

main()
  .catch((e) => {
    console.error("初始化失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
