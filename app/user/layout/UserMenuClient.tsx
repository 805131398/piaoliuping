"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
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
    MailIcon,
    LayoutDashboardIcon
} from "lucide-react";
import { createAvatar } from "@dicebear/core";
import * as styles from "@dicebear/collection";
import { Buffer } from "buffer";
import type { Style } from "@dicebear/core";
import { OssAvatar } from "@/components/ui/oss-image";
import { useEffect, useMemo, useState } from "react";

// 登录方式配置
interface LoginMethod {
    key: string;
    label: string;
}

// 用户菜单项配置
export const userMenuItems = [
    {
        title: "个人中心",
        href: "/user/profile",
        icon: SettingsIcon,
    },
    {
        title: "管理后台",
        href: "/admin",
        icon: LayoutDashboardIcon,
    },
];

// Cookie name for caching user data
const USER_CACHE_COOKIE = "user_cache";

// 缓存用户数据到 Cookie
function setCachedUser(user: unknown) {
    try {
        if (typeof document !== 'undefined') {
            if (user) {
                const value = encodeURIComponent(JSON.stringify(user));
                // 设置 7 天过期，添加 SameSite=Strict 增强安全性
                const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
                document.cookie = `${USER_CACHE_COOKIE}=${value}; path=/; expires=${expires}; SameSite=Strict`;
            } else {
                // 清除 Cookie - 确保完全删除
                document.cookie = `${USER_CACHE_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
            }
        }
    } catch {
        // ignore
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

interface UserMenuClientProps {
    initialUser?: CachedUser | null;
    /** 覆盖层模式：只渲染透明触发器，不渲染头像 */
    overlayMode?: boolean;
}

export default function UserMenuClient({ initialUser, overlayMode = false }: UserMenuClientProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loginMethods, setLoginMethods] = useState<LoginMethod[]>([]);

    // 使用服务端传入的初始数据（保持 SSR 和客户端一致）
    const cachedUser = initialUser;

    // 当 session 数据更新时，同步到缓存
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            setCachedUser(session.user);
        } else if (status === "unauthenticated") {
            setCachedUser(null);
        }
    }, [status, session]);

    // 获取登录配置
    useEffect(() => {
        const fetchLoginConfig = async () => {
            try {
                const response = await fetch('/api/auth/login-config');
                const data = await response.json();
                if (data.success && data.data.methods.length > 0) {
                    setLoginMethods(data.data.methods);
                }
            } catch (error) {
                console.error('获取登录配置失败:', error);
                // 默认配置
                setLoginMethods([
                    { key: 'phone_code', label: '手机号登录' },
                    { key: 'email', label: '邮箱登录' },
                ]);
            }
        };
        fetchLoginConfig();
    }, []);
    
    // 优先使用 session，其次用缓存
    const userData = session?.user || cachedUser;
    const userName = userData?.name || "用户";

    // DiceBear 头像渲染优化：使用 useMemo 避免重复计算
    const avatarContent = useMemo(() => {
        if (!userData) return <AvatarFallback>{userName?.[0] || "U"}</AvatarFallback>;

        if (userData.avatarType === "system" && userData.avatarStyle && userData.avatarSeed) {
            try {
                const styleModule = (styles as Record<string, Style<Record<string, unknown>>>)[userData.avatarStyle];
                if (styleModule) {
                    const svg = createAvatar(styleModule, { seed: userData.avatarSeed }).toString();
                    // 使用 Buffer 代替 window.btoa，兼容服务端和客户端
                    const svgBase64 = Buffer.from(svg).toString('base64');
                    const dataUri = `data:image/svg+xml;base64,${svgBase64}`;
                    return <AvatarImage src={dataUri || undefined} alt={userName} className="w-full h-full object-cover" />;
                }
            } catch {
                return <AvatarFallback>{userName?.[0] || "U"}</AvatarFallback>;
            }
        } else if (userData.image && userData.avatarType === "custom") {
            return (
                <OssAvatar
                    src={userData.image}
                    alt={userName}
                    size={40}
                    className="w-full h-full object-cover"
                />
            );
        } else if (userData.image) {
            return <AvatarImage src={userData.image} alt={userName} className="w-full h-full object-cover" />;
        }
        
        return <AvatarFallback>{userName?.[0] || "U"}</AvatarFallback>;
    }, [userData, userName]);
    
    // 有用户数据时显示头像菜单
    if (userData) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {overlayMode ? (
                        // 覆盖层模式：透明触发器覆盖在服务端头像上
                        <button className="absolute inset-0 rounded-full cursor-pointer" />
                    ) : (
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                                {avatarContent}
                            </Avatar>
                        </Button>
                    )}
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
                                {userData.email}
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
                            // 先清除本地缓存的 Cookie
                            setCachedUser(null);
                            // 手动清除所有相关 cookie
                            if (typeof document !== 'undefined') {
                                document.cookie.split(";").forEach((c) => {
                                    document.cookie = c
                                        .replace(/^ +/, "")
                                        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                                });
                            }
                            // 然后执行 signOut
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

    // 加载中且无缓存
    if (status === "loading") {
        // overlayMode 时不显示加载状态（服务端已渲染头像）
        if (overlayMode) return null;
        return (
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
        );
    }

    // 登录方式图标映射
    const getLoginIcon = (key: string) => {
        switch (key) {
            case 'phone_code':
                return <PhoneIcon className="mr-2 h-4 w-4" />;
            case 'email':
                return <MailIcon className="mr-2 h-4 w-4" />;
            case 'github':
                return <GithubIcon className="mr-2 h-4 w-4" />;
            case 'google':
                return (
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    // 处理登录点击
    const handleLoginClick = (key: string) => {
        if (key === 'phone_code' || key === 'email') {
            router.push("/login");
        } else {
            signIn(key);
        }
    };

    // 未登录时显示登录入口
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
                {loginMethods.map((method, index) => {
                    // 在验证码登录和 OAuth 登录之间添加分隔线
                    const isOAuth = method.key === 'github' || method.key === 'google';
                    const prevMethod = loginMethods[index - 1];
                    const prevIsCredential = prevMethod && (prevMethod.key === 'phone_code' || prevMethod.key === 'email');
                    const needSeparator = isOAuth && prevIsCredential;

                    return (
                        <div key={method.key}>
                            {needSeparator && <DropdownMenuSeparator />}
                            <DropdownMenuItem
                                onClick={() => handleLoginClick(method.key)}
                                className="flex items-center"
                            >
                                {getLoginIcon(method.key)}
                                <span>{method.label}</span>
                            </DropdownMenuItem>
                        </div>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
