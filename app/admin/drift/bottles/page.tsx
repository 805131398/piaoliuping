import { prisma } from "@/lib/prisma";
import { DriftBottleManagementClient } from "@/components/admin/drift/DriftAdminClients";

export const dynamic = "force-dynamic";

export default async function DriftBottlesPage() {
  const bottles = await prisma.driftBottle.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      author: { select: { id: true, name: true, email: true, phone: true } },
      tags: { include: { tag: true } },
      _count: { select: { discoveries: true, conversations: true, reports: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">海笺管理</h1>
        <p className="text-muted-foreground">查看与治理用户寄出的漂流瓶内容</p>
      </div>
      <DriftBottleManagementClient initialBottles={bottles} />
    </div>
  );
}
