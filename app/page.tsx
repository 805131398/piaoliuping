import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <main className="flex flex-col items-center justify-center gap-8 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
              Piaoliuping
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
              面向语言学习项目的基础工程，保留后台管理、认证、数据库、小程序壳子与可复用系统能力。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/login">
              <Button size="lg" className="flex items-center gap-2">
                进入系统
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/user">
              <Button size="lg" variant="outline" className="flex items-center gap-2">
                个人中心
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-2">认证与账号体系</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Web 登录、角色鉴权、个人资料和基础账号能力保持可用。
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-2">数据与配置底座</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Prisma、PostgreSQL、系统配置、菜单与权限管理已完成基础收敛。
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-2">后台基础管理</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                用户、角色、菜单、配置、文件管理可直接作为新项目后台起点。
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-2">对象存储与通知</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                阿里云 OSS、邮件和短信配置能力仍可继续复用。
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-2">小程序壳子</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                小程序首页、我的页和登录链路保留，适合继续接入语言学习场景。
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-2">预留扩展位</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                用户积分、VIP 字段和微信支付底层入口已保留，可承接后续业务。
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
