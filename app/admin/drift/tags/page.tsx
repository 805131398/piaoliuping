import { prisma } from "@/lib/prisma";
import { DriftTagManagementClient } from "@/components/admin/drift/DriftAdminClients";

export const dynamic = "force-dynamic";

export default async function DriftTagsPage() {
  const tags = await prisma.driftTag.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { bottles: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">标签管理</h1>
        <p className="text-muted-foreground">维护沧海拾音、寄海笺中使用的内容标签</p>
      </div>
      <DriftTagManagementClient initialTags={tags} />
    </div>
  );
}
