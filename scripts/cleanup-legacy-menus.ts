import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const legacyMenuPrefixes = [
  "/admin/clocking",
  "/admin/game",
];

const legacyMenuKeywords = [
  "打卡",
  "题库",
  "答题",
  "排行",
  "奖金",
  "优惠券",
  "订单",
  "会员",
  "VIP",
  "游戏",
  "主题",
  "音效",
  "轮播",
  "广告",
];

function isLegacyBusinessMenu(menu: { href: string | null; label: string }) {
  return (
    legacyMenuPrefixes.some(prefix => menu.href?.startsWith(prefix) === true)
    || legacyMenuKeywords.some(keyword => menu.label.includes(keyword))
  );
}

async function main() {
  console.log("开始清理旧业务菜单...");

  const menus = await prisma.menu.findMany();
  const legacyMenus = menus.filter(isLegacyBusinessMenu);

  if (legacyMenus.length === 0) {
    console.log("没有检测到旧业务菜单。");
    return;
  }

  await prisma.menu.deleteMany({
    where: {
      id: { in: legacyMenus.map(menu => menu.id) },
    },
  });

  console.log(`✅ 已清理 ${legacyMenus.length} 个旧业务菜单`);
}

main()
  .catch((error) => {
    console.error("清理失败:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
