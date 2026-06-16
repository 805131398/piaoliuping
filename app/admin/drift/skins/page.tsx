import { prisma } from "@/lib/prisma";
import { DriftSkinManagementClient } from "@/components/admin/drift/DriftAdminClients";

export const dynamic = "force-dynamic";

export default async function DriftSkinsPage() {
  const skins = await prisma.driftBottleSkin.findMany({
    orderBy: [{ rarity: "asc" }, { name: "asc" }],
    include: { _count: { select: { userSkins: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">瓶身风格</h1>
        <p className="text-muted-foreground">管理听潮小筑中展示和装备的瓶子风格</p>
      </div>
      <DriftSkinManagementClient initialSkins={skins} />
    </div>
  );
}
