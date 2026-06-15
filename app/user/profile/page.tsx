import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfilePageClient from "./ProfilePageClient";
import prisma from "@/lib/prisma";
import { createAvatar } from "@dicebear/core";
import * as styles from "@dicebear/collection";
import type { Style } from "@dicebear/core";
import Image from "next/image";

// 服务端预生成系统头像 SVG
function generateSystemAvatarSvg(avatarStyle: string, avatarSeed: string): string | null {
  try {
    const styleModule = (styles as Record<string, Style<Record<string, unknown>>>)[avatarStyle];
    if (styleModule) {
      return createAvatar(styleModule, { seed: avatarSeed }).toString();
    }
  } catch (error) {
    console.error("服务端生成头像失败:", error);
  }
  return null;
}

// 服务端渲染的初始头像组件（避免等待客户端 JS）
function ServerAvatar({ user, avatarSvg }: { user: any; avatarSvg: string | null }) {
  const avatarType = user?.avatarType || "custom";
  const avatarUrl = user?.image;

  if (avatarType === "custom" && avatarUrl) {
    return (
        <Image
            src={avatarUrl}
            alt="用户头像"
            width={80}
            height={80}
            className="rounded-full object-cover w-16 h-16 sm:w-20 sm:h-20 border-2 border-blue-400"
        />
    );
  }

  if (avatarType === "system" && avatarSvg) {
    const svgBase64 = Buffer.from(avatarSvg).toString("base64");
    return (
        <img
            src={`data:image/svg+xml;base64,${svgBase64}`}
            alt="用户头像"
            className="rounded-full object-cover w-16 h-16 sm:w-20 sm:h-20"
        />
    );
  }

  // Fallback
  return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500 text-xl">{user?.name?.[0] || "U"}</span>
      </div>
  );
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/user/profile");
  }

  // 服务端获取 provider，避免客户端等待
  const account = await prisma.account.findFirst({
    where: { userId: session.user.id },
    select: { provider: true },
  });

  // 服务端预生成系统头像 SVG
  let initialAvatarSvg: string | null = null;
  if (session.user.avatarType === "system") {
    const seed = session.user.avatarSeed || session.user.id || session.user.email || "user";
    const style = session.user.avatarStyle || "lorelei";
    initialAvatarSvg = generateSystemAvatarSvg(style, seed);
  }

  return (
      <div className="max-w-2xl mx-auto px-2 py-4 sm:px-4 md:px-8">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-8">
          {/* 头像区域：服务端渲染 + 客户端覆盖层 */}
          <div className="flex-shrink-0 relative w-16 h-16 sm:w-20 sm:h-20">
            <ServerAvatar user={session.user} avatarSvg={initialAvatarSvg} />
            {/* 客户端编辑层覆盖在头像上 */}
            <ProfilePageClient
                initialSession={session}
                initialProvider={account?.provider || null}
                initialAvatarSvg={initialAvatarSvg}
                avatarOnly={true}
            />
          </div>
          <ProfilePageClient
              initialSession={session}
              initialProvider={account?.provider || null}
              initialAvatarSvg={initialAvatarSvg}
              avatarOnly={false}
          />
        </div>
      </div>
  );
}
