"use client"

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, Settings, ArrowRight } from "lucide-react";

// Cookie name
const USER_CACHE_COOKIE = "user_cache";

function getCachedUser() {
  try {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(new RegExp('(^| )' + USER_CACHE_COOKIE + '=([^;]+)'));
      if (match) {
        return JSON.parse(decodeURIComponent(match[2]));
      }
    }
    return null;
  } catch {
    return null;
  }
}

interface CachedUser {
  name?: string;
  email?: string;
  image?: string;
  avatarType?: string;
  avatarStyle?: string;
  avatarSeed?: string;
}

interface UserHomeClientProps {
  initialUser?: CachedUser | null;
}

export default function UserHomeClient({ initialUser }: UserHomeClientProps) {
  const { data: session, status } = useSession();
  
  // 使用服务端传入的初始数据（保持 SSR 和客户端一致）
  const cachedUser = initialUser;
  
  // 优先使用 session，其次用缓存
  const userData = session?.user || cachedUser;

  // 未登录且无缓存
  if (status === "unauthenticated" && !cachedUser) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">请先登录</h1>
          <Link href="/login">
            <Button>前往登录</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 加载中且无缓存
  if (status === "loading" && !cachedUser) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <main className="flex flex-col gap-8 items-center">
            <div className="text-center space-y-2">
              <div className="h-10 w-64 mx-auto bg-muted animate-pulse rounded" />
              <div className="h-5 w-40 mx-auto bg-muted animate-pulse rounded" />
            </div>
            <div className="w-full max-w-2xl space-y-4">
              <div className="h-24 w-full bg-muted animate-pulse rounded-lg" />
              <div className="h-24 w-full bg-muted animate-pulse rounded-lg" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // 有用户数据时显示内容
  if (!userData) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <main className="flex flex-col gap-8 items-center">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              欢迎回来，{userData.name || userData.email}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              这是你的个人中心
            </p>
          </div>
          
          <div className="w-full max-w-2xl space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-lg">个人资料</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      管理你的头像、昵称等个人信息
                    </p>
                  </div>
                </div>
                <Link href="/user/profile">
                  <Button className="flex items-center gap-2">
                    查看资料
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="h-6 w-6 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-lg">账号设置</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      管理你的账号和登录方式
                    </p>
                  </div>
                </div>
                <Link href="/user/profile">
                  <Button variant="outline" className="flex items-center gap-2">
                    前往设置
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
