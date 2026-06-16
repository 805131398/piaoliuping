import { prisma } from "@/lib/prisma";
import { DriftReportManagementClient } from "@/components/admin/drift/DriftAdminClients";

export const dynamic = "force-dynamic";

export default async function DriftReportsPage() {
  const reports = await prisma.driftReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      handler: { select: { id: true, name: true, email: true } },
      bottle: { select: { id: true, title: true, textContent: true, status: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">举报审核</h1>
        <p className="text-muted-foreground">处理瓶中尺素和回信中的不当内容举报</p>
      </div>
      <DriftReportManagementClient initialReports={reports} />
    </div>
  );
}
