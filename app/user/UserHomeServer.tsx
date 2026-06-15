import { cookies } from "next/headers";
import UserHomeClient from "./UserHomeClient";
import { auth } from "@/auth";

const USER_CACHE_COOKIE = "user_cache";

// 服务端组件：读取 cookie 并传给客户端
export async function UserHomeServer() {
    // 首先验证 NextAuth session
    const session = await auth();

    if (!session?.user) {
        return <UserHomeClient initialUser={null} />;
    }

    // 有有效 session，从 cookie 获取缓存的头像信息
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

    // 优先使用 session 数据
    const initialUser = {
        id: session.user.id,
        name: session.user.name || undefined,
        email: session.user.email || undefined,
        image: session.user.image || undefined,
        avatarType: session.user.avatarType || cachedUser?.avatarType,
        avatarStyle: session.user.avatarStyle || cachedUser?.avatarStyle,
        avatarSeed: session.user.avatarSeed || cachedUser?.avatarSeed,
    };

    return <UserHomeClient initialUser={initialUser} />;
}
