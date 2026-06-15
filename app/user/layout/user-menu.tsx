"use client"

import Link from "next/link";
import { redirect } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
    SettingsIcon,
    LogOutIcon,
    GithubIcon,
    PhoneIcon,
    MailIcon
} from "lucide-react";
import { createAvatar } from "@dicebear/core";
import * as styles from "@dicebear/collection";
import { Buffer } from "buffer";
import type { Style } from "@dicebear/core";
import { OssAvatar } from "@/components/ui/oss-image";
import { useState, useEffect } from "react";

// 用户菜单项类型
export interface UserMenuItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

// 用户菜单项配置
export const userMenuItems: UserMenuItem[] = [
    {
        title: "个人设置",
        href: "/user/profile",
        icon: SettingsIcon,
    },
];

// localStorage key for caching user data
const USER_CACHE_KEY = "user_menu_cache";

// 从 localStorage 获取缓存的用户数据
function getCachedUser() {
    if (typeof window === "undefined") return null;
    try {
        const cached = localStorage.getItem(USER_CACHE_KEY);
        return cached ? JSON.parse(cached) : null;
    } catch {
        return null;
    }
}

// 缓存用户数据到 localStorage
function setCachedUser(user: unknown) {
    if (typeof window === "undefined") return;
    try {
        if (user) {
            localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(USER_CACHE_KEY);
        }
    } catch {
        // ignore
    }
}

export function UserMenu() {
    const { data: session, status } = useSession();
    // 直接在初始化时读取缓存（客户端）
    const [cachedUser, setCachedUserState] = useState<ReturnType<typeof getCachedUser>>(() => getCachedUser());
    const [mounted, setMounted] = useState(false);
    
    // 标记客户端已挂载
    useEffect(() => {
        setMounted(true);
        // 确保客户端有最新缓存
        setCachedUserState(getCachedUser());
    }, []);
    
    // 当 session 数据更新时，同步到缓存
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            setCachedUser(session.user);
            setCachedUserState(session.user);
        } else if (status === "unauthenticated") {
            setCachedUser(null);
            setCachedUserState(null);
        }
    }, [status, session]);
    
    // 优先使用 session 数据，其次使用缓存数据（乐观 UI）
    const userData = session?.user || cachedUser;
    const userName = userData?.name || "用户";
    
    // SSR 时返回占位符，避免 hydration mismatch
    if (!mounted) {
        return (
            <div className="h-10 w-10 rounded-full bg-muted" />
        );
    }
    
    const isLoading = status === "loading" && !cachedUser;

    // DiceBear 头像渲染
    let avatarContent = null;
    if (userData?.avatarType === "system" && userData.avatarStyle && userData.avatarSeed) {
        try {
            const styleModule = (styles as Record<string, Style<Record<string, unknown>>>)[userData.avatarStyle];
            if (styleModule) {
                const svg = createAvatar(styleModule, { seed: userData.avatarSeed }).toString();
                const svgBase64 = typeof window === 'undefined'
                  ? Buffer.from(svg).toString("base64")
                  : window.btoa(unescape(encodeURIComponent(svg)));
                const dataUri = `data:image/svg+xml;base64,${svgBase64}`;
                avatarContent = <AvatarImage src={dataUri || undefined} alt={userName} className="w-full h-full object-cover" />;
            }
        } catch {
            avatarContent = <AvatarFallback>{userName?.[0] || "U"}</AvatarFallback>;
        }
    } else if (userData?.image && userData?.avatarType === "custom") {
        // 使用 OssAvatar 处理自定义头像（OSS 图片）
        avatarContent = (
            <OssAvatar
                src={userData.image}
                alt={userName}
                size={40}
                className="w-full h-full object-cover"
            />
        );
    } else if (userData?.image) {
        // 处理其他类型的图片（非 OSS）
        avatarContent = <AvatarImage src={userData.image} alt={userName} className="w-full h-full object-cover" />;
    } else {
        avatarContent = <AvatarFallback>{userName?.[0] || "U"}</AvatarFallback>;
    }
    if (userData) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                            {avatarContent}
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-56"
                    sideOffset={8}
                >
                    <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                            <p className="font-medium">{userName}</p>
                            <p className="w-[200px] truncate text-sm text-muted-foreground">
                                {userData?.email}
                            </p>
                        </div>
                    </div>
                    <DropdownMenuSeparator />
                    {userMenuItems.map((item) => (
                        <DropdownMenuItem key={item.title} asChild>
                            <Link href={item.href} className="flex items-center">
                                <item.icon className="mr-2 h-4 w-4" />
                                <span>{item.title}</span>
                            </Link>
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={async () => {
                            // 清除 localStorage 缓存
                            setCachedUser(null);
                            // 手动清除所有相关 cookie
                            if (typeof document !== 'undefined') {
                                document.cookie.split(";").forEach((c) => {
                                    document.cookie = c
                                        .replace(/^ +/, "")
                                        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                                });
                            }
                            // 调用 NextAuth signOut
                            await signOut({ callbackUrl: "/", redirect: true });
                        }}
                        className="flex items-center text-red-600 focus:text-red-600"
                    >
                        <LogOutIcon className="mr-2 h-4 w-4" />
                        <span>退出登录</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    // 首次访问无缓存时显示 loading
    if (isLoading) {
        return (
            <div className="h-10 w-10 rounded-full overflow-hidden bg-muted animate-pulse" />
        );
    }

    // 未登录时显示登录入口
    if (status === "unauthenticated") {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        登录
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-48"
                    sideOffset={8}
                >
                    <DropdownMenuItem
                        onClick={() => { redirect("/login") }}
                        className="flex items-center"
                    >
                        <PhoneIcon className="mr-2 h-4 w-4" />
                        <span>手机号登录</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => { redirect("/login") }}
                        className="flex items-center"
                    >
                        <MailIcon className="mr-2 h-4 w-4" />
                        <span>邮箱登录</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => signIn("github")}
                        className="flex items-center"
                    >
                        <GithubIcon className="mr-2 h-4 w-4" />
                        <span>GitHub 登录</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => signIn("google")}
                        className="flex items-center"
                    >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span>Google 登录</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return null;
} 