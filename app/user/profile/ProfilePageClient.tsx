/** @format */

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { ProfileProviderBadge } from "./ProfileProviderBadge";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileSyncButton } from "./ProfileSyncButton";
import { ProfileNickname } from "./ProfileNickname";
import { useProfileStore } from "@/lib/store/profile-store";
import type { Session } from "next-auth";

interface ProfilePageClientProps {
  initialSession: Session;
  initialProvider: string | null;
  initialAvatarSvg?: string | null;
  /** true: 只渲染头像编辑覆盖层，false: 只渲染用户信息 */
  avatarOnly: boolean;
}

// 比较用户数据是否相同（避免不必要的重渲染）
function isUserDataEqual(a: any, b: any): boolean {
  if (!a || !b) return false;
  return (
      a.id === b.id &&
      a.name === b.name &&
      a.email === b.email &&
      a.phone === b.phone &&
      a.image === b.image &&
      a.avatarType === b.avatarType &&
      a.avatarStyle === b.avatarStyle &&
      a.avatarSeed === b.avatarSeed
  );
}

export default function ProfilePageClient({ initialSession, initialProvider, initialAvatarSvg, avatarOnly }: ProfilePageClientProps) {
  const { update } = useSession();
  const { profile, provider, loaded, fetchProfile } = useProfileStore();
  const [syncing, setSyncing] = useState(false);

  // 只有数据真正变化时才切换，使用 useMemo 确保引用稳定
  const displayUser = useMemo(() => {
    if (!loaded || !profile) return initialSession.user;
    if (isUserDataEqual(profile, initialSession.user)) return initialSession.user;
    return profile;
  }, [loaded, profile, initialSession.user]);

  // 优先使用服务端传入的 provider，加载完成后使用 API 返回的 provider
  const displayProvider = loaded ? provider : initialProvider;

  useEffect(() => {
    // 只在未加载时 fetch，避免重复请求
    if (!loaded) {
      fetchProfile();
    }
  }, [loaded, fetchProfile]);

  const handleSave = async (nickname: string) => {
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname }),
    });
    if (res.ok && typeof update === "function") {
      await update();
      await fetchProfile();
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/profile/sync", { method: "POST" });
      if (res.ok && typeof update === "function") {
        await update();
        await fetchProfile();
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleAvatarUpdate = async () => {
    if (typeof update === "function") {
      await update();
      await fetchProfile();
    }
  };

  // 头像编辑覆盖层模式
  if (avatarOnly) {
    return (
        <div className="absolute inset-0">
          <ProfileAvatar
              onAvatarUpdate={handleAvatarUpdate}
              initialUser={initialSession.user}
              initialAvatarSvg={initialAvatarSvg}
              overlayOnly={true}
          />
        </div>
    );
  }

  // 用户信息模式
  return (
      <div className="flex-1 w-full space-y-2">
        <div className="flex items-center gap-2">
          {displayUser?.email && (
              <span className="text-lg sm:text-2xl font-bold break-all">
            {displayUser.email}
          </span>
          )}
          {displayUser?.phone && (
              <span className="text-lg sm:text-2xl font-bold break-all">
            {displayUser.phone}
          </span>
          )}
          <ProfileProviderBadge provider={displayProvider} />
        </div>
        <div className="flex items-center gap-2">
          <ProfileNickname user={displayUser ?? undefined} onSave={handleSave} />
          {displayProvider === "github" && (
              <ProfileSyncButton syncing={syncing} onSync={handleSync} />
          )}
        </div>
      </div>
  );
}
