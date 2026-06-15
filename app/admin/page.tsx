import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Users, Shield, MenuSquare, Settings } from "lucide-react";

async function getAdminStats() {
  const [users, roles, menus, configs] = await Promise.all([
    prisma.user.count(),
    prisma.role.count(),
    prisma.menu.count(),
    prisma.config.count(),
  ]);

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
    },
  });

  return { users, roles, menus, configs, recentUsers };
}

function StatCard({
  href,
  title,
  value,
  icon: Icon,
}: {
  href: string;
  title: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/40"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
        </div>
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </Link>
  );
}

export default async function AdminPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-6">
        <h1 className="text-3xl font-semibold tracking-tight">系统总览</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          当前后台已移除历史打卡业务，保留基础管理能力与可复用系统组件。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard href="/admin/users" title="用户总数" value={stats.users} icon={Users} />
        <StatCard href="/admin/roles" title="角色总数" value={stats.roles} icon={Shield} />
        <StatCard href="/admin/menus" title="有效菜单" value={stats.menus} icon={MenuSquare} />
        <StatCard href="/admin/configs" title="系统配置" value={stats.configs} icon={Settings} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold">最近注册用户</h2>
          <div className="mt-4 space-y-3">
            {stats.recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无用户数据。</p>
            ) : (
              stats.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{user.name || user.email || user.phone || "未命名用户"}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email || user.phone || "未填写联系方式"}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Intl.DateTimeFormat("zh-CN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(user.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold">当前保留能力</h2>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>认证、用户中心、角色权限、菜单管理、系统配置、文件管理保持可用。</p>
            <p>小程序壳子保留，首页与“我的”页已改为基础模板页。</p>
            <p>微信支付底层代码与用户积分/VIP字段保留，等待后续新业务接入。</p>
          </div>
        </div>
      </section>
    </div>
  );
}
