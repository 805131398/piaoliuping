import { prisma } from "@/lib/prisma";
import { ConfigCategoryManagementClient } from "@/components/admin/ConfigCategoryManagementClient";

// 服务端组件 - 直接查询数据库
export default async function ConfigCategoriesPage() {
  // 获取所有分类
  const categories = await prisma.configCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: { configs: true }
      }
    }
  });

  // 将数据传递给客户端组件
  return <ConfigCategoryManagementClient initialCategories={categories} />;
}
