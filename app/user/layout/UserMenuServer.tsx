import { cookies } from "next/headers";
import UserMenuClient from "./UserMenuClient";
import { createAvatar } from "@dicebear/core";
import * as styles from "@dicebear/collection";
import type { Style } from "@dicebear/core";
import Image from "next/image";
import { auth } from "@/auth";

const USER_CACHE_COOKIE = "user_cache";

// 服务端生成系统头像 SVG
function generateSystemAvatarSvg(avatarStyle: string, avatarSeed: string): string | null {
    try {
        const styleModule = (styles as Record<string, Style<Record<string, unknown>>>)[avatarStyle];
        if (styleModule) {
            return createAvatar(styleModule, { seed: avatarSeed }).toString();
        }
    } catch {
        // ignore
    }
    return null;
}

// 服务端渲染的头像（立即显示）
function ServerNavAvatar({ user }: { user: any }) {
    if (!user) return null;
    
    if (user.avatarType === "system" && user.avatarStyle && user.avatarSeed) {
        const svg = generateSystemAvatarSvg(user.avatarStyle, user.avatarSeed);
        if (svg) {
            const svgBase64 = Buffer.from(svg).toString("base64");
            return (
                <img
                    src={`data:image/svg+xml;base64,${svgBase64}`}
                    alt="用户头像"
                    className="h-10 w-10 rounded-full object-cover"
                />
            );
        }
    }
    
    if (user.avatarType === "custom" && user.image) {
        return (
            <Image
                src={user.image}
                alt="用户头像"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
            />
        );
    }
    
    if (user.image) {
        return (
            <Image
                src={user.image}
                alt="用户头像"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
            />
        );
    }
    
    // Fallback
    return (
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">{user.name?.[0] || "U"}</span>
        </div>
    );
}

// 服务端组件：读取 cookie 并传给客户端
export async function UserMenuServer() {
    // 首先验证 NextAuth session - 这是权威的登录状态
    const session = await auth();

    // 如果没有有效的 session，直接返回未登录状态
    if (!session?.user) {
        return <UserMenuClient initialUser={null} />;
    }

    // 有有效 session，使用 session 中的用户数据
    // 同时尝试从 cookie 获取缓存的头像信息（可能包含更完整的头像数据）
    const cookieStore = await cookies();
    const userCookie = cookieStore.get(USER_CACHE_COOKIE);

    let cachedUser = null;
    if (userCookie?.value) {
        try {
            cachedUser = JSON.parse(decodeURIComponent(userCookie.value));
        } catch {
            // ignore
        }
    }

    // 优先使用 session 数据，缓存数据作为补充（主要是头像相关字段）
    const initialUser = {
        id: session.user.id,
        name: session.user.name || undefined,
        email: session.user.email || undefined,
        image: session.user.image || undefined,
        // 如果 session 中没有头像信息，从缓存补充
        avatarType: session.user.avatarType || cachedUser?.avatarType,
        avatarStyle: session.user.avatarStyle || cachedUser?.avatarStyle,
        avatarSeed: session.user.avatarSeed || cachedUser?.avatarSeed,
    };

    return (
        <div className="relative h-10 w-10">
            {/* 服务端渲染的头像（立即显示） */}
            <ServerNavAvatar user={initialUser} />
            {/* 客户端覆盖层（处理交互） */}
            <UserMenuClient initialUser={initialUser} overlayMode={true} />
        </div>
    );
}
