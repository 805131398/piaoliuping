import { prisma } from "@/lib/prisma";
import { ConfigManagementClient } from "@/components/admin/ConfigManagementClient";

// 服务端组件 - 直接查询数据库
export default async function ConfigsPage() {
  // 并行获取配置和分类
  const [configs, categories] = await Promise.all([
    prisma.config.findMany({
      orderBy: { key: "asc" },
      include: {
        category: true,
      },
    }),
    prisma.configCategory.findMany({
      orderBy: { order: "asc" },
    }),
  ]);

  // 按分类排序（先按分类order，再按key）
  const sortedConfigs = configs.sort((a, b) => {
    const orderA = a.category?.order ?? 999;
    const orderB = b.category?.order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.key.localeCompare(b.key);
  });

  // 对于敏感信息，只返回部分内容（脱敏）
  const maskedConfigs = sortedConfigs.map(config => ({
    ...config,
    value: config.isSecret && config.value 
      ? `${config.value.substring(0, 4)}****` 
      : config.value,
  }));

  // 将数据传递给客户端组件
  return (
    <ConfigManagementClient 
      initialConfigs={maskedConfigs} 
      initialCategories={categories}
    />
  );
}
