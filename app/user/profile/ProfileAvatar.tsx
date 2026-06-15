/** @format */

"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { createAvatar } from "@dicebear/core";
import * as styles from "@dicebear/collection";
import AvatarDialog, { AvatarData } from "@/components/avatar/AvatarDialog";
import { useProfileStore } from "@/lib/store/profile-store";
import { Buffer } from "buffer";
import { OssAvatar } from "@/components/ui/oss-image";
import type { Style } from "@dicebear/core";
import type { User } from "next-auth";

interface ProfileAvatarProps {
  onAvatarUpdate?: () => void;
  initialUser?: User | null;
  /** 服务端预生成的系统头像 SVG */
  initialAvatarSvg?: string | null;
  /** 只渲染覆盖层（点击/hover），不渲染头像本身 */
  overlayOnly?: boolean;
}

// 默认头像数据生成
function getDefaultAvatarData(profile: User | null | undefined): AvatarData {
  return {
    avatarType: (profile?.avatarType as "system" | "custom") || "custom",
    avatarSeed: profile?.avatarSeed || profile?.id || profile?.email || "user",
    avatarStyle: profile?.avatarStyle || "lorelei",
    avatarUrl: profile?.image || undefined,
  };
}

// 比较头像相关数据是否相同
function isAvatarDataEqual(a: any, b: any): boolean {
  if (!a || !b) return false;
  return (
      a.image === b.image &&
      a.avatarType === b.avatarType &&
      a.avatarStyle === b.avatarStyle &&
      a.avatarSeed === b.avatarSeed
  );
}

export function ProfileAvatar({ onAvatarUpdate, initialUser, initialAvatarSvg, overlayOnly = false }: ProfileAvatarProps) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { profile, loaded } = useProfileStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 关键修复：只有头像数据真正变化时才切换
  const displayUser = useMemo(() => {
    if (!loaded) return initialUser;
    if (!profile) return initialUser;
    // 如果头像数据相同，保持使用 initialUser 避免闪烁
    if (isAvatarDataEqual(profile, initialUser)) return initialUser;
    return profile as User;
  }, [loaded, profile, initialUser]) as User | undefined;

  // 用于编辑时的临时状态
  const [editingAvatarData, setEditingAvatarData] = useState<AvatarData | null>(null);

  // 展示用的头像数据：使用 useMemo 确保引用稳定，避免图片闪烁
  const avatarData = useMemo(() => {
    if (editingAvatarData) return editingAvatarData;
    return {
      avatarType: (displayUser?.avatarType as "system" | "custom") || "custom",
      avatarSeed: displayUser?.avatarSeed || displayUser?.id || displayUser?.email || "user",
      avatarStyle: displayUser?.avatarStyle || "lorelei",
      avatarUrl: displayUser?.image || undefined,
    };
  }, [editingAvatarData, displayUser?.avatarType, displayUser?.avatarSeed, displayUser?.avatarStyle, displayUser?.image, displayUser?.id, displayUser?.email]);

  // 用户名（用于 fallback）
  const userName = displayUser?.name || initialUser?.name || "用户";

  // 头像点击弹窗
  const handleAvatarClick = () => setIsDialogOpen(true);

  // 保存头像
  const handleSave = async (data: AvatarData) => {
    setEditingAvatarData(data);
    setIsDialogOpen(false);

    console.log(data, "保存头像");

    try {
      // 1. 保存到数据库
      let response;
      if (data.avatarType === "system") {
        response = await fetch("/api/profile/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            avatarType: "system",
            avatarStyle: data.avatarStyle,
            avatarSeed: data.avatarSeed,
          }),
        });
      } else if (data.avatarType === "custom") {
        response = await fetch("/api/profile/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            avatarType: "custom",
            avatarUrl: data.avatarUrl,
          }),
        });
      }

      if (!response?.ok) {
        throw new Error("保存失败");
      }

      // 2. 更新 Session (传递新数据给 auth.ts 更新 token)
      await update({
        user: {
          avatarType: data.avatarType,
          avatarStyle: data.avatarStyle,
          avatarSeed: data.avatarSeed,
          image: data.avatarUrl || session?.user?.image,
        }
      });

      // 3. 更新 Cookie (用于 UserMenu 即时显示)
      if (session?.user) {
        const updatedUser = {
          ...session.user,
          avatarType: data.avatarType,
          avatarStyle: data.avatarStyle,
          avatarSeed: data.avatarSeed,
          image: data.avatarUrl || session.user.image,
        };

        const USER_CACHE_COOKIE = "user_cache";
        const value = encodeURIComponent(JSON.stringify(updatedUser));
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `${USER_CACHE_COOKIE}=${value}; path=/; expires=${expires}; SameSite=Lax`;
      }

      // 4. 刷新页面或通知
      router.refresh();
      onAvatarUpdate?.();
    } catch (error) {
      console.error("头像保存失败:", error);
    }
  };

  // 生成系统头像 SVG：优先使用服务端预生成的，避免客户端等待
  const systemAvatarSvg = useMemo(() => {
    if (avatarData.avatarType !== "system") return null;

    // 如果头像数据未变化，使用服务端预生成的 SVG
    if (initialAvatarSvg &&
        avatarData.avatarSeed === (initialUser?.avatarSeed || initialUser?.id || initialUser?.email) &&
        avatarData.avatarStyle === (initialUser?.avatarStyle || "lorelei")) {
      return initialAvatarSvg;
    }

    // 否则客户端生成（用于编辑头像后的预览）
    try {
      const styleModule = (
          styles as Record<string, Style<Record<string, unknown>>>
      )[avatarData.avatarStyle];
      if (styleModule) {
        return createAvatar(styleModule, {
          seed: avatarData.avatarSeed,
        }).toString();
      }
    } catch (error) {
      console.error("生成头像失败:", error);
    }
    return null;
  }, [avatarData.avatarType, avatarData.avatarSeed, avatarData.avatarStyle, initialAvatarSvg, initialUser]);

  // 头像展示逻辑
  const renderAvatar = () => {
    // 优先显示自定义头像
    if (avatarData.avatarType === "custom" && avatarData.avatarUrl) {
      return (
          <OssAvatar
              src={avatarData.avatarUrl}
              alt="用户头像"
              size={80}
              className="w-full h-full border-2 border-blue-400"
          />
      );
    }

    // 其次显示系统头像
    if (avatarData.avatarType === "system" && systemAvatarSvg) {
      // 统一使用 Buffer，避免 hydration mismatch
      const svgBase64 = Buffer.from(systemAvatarSvg).toString("base64");
      const dataUri = `data:image/svg+xml;base64,${svgBase64}`;
      return (
          <AvatarImage
              src={dataUri}
              alt="用户头像"
              className="w-full h-full object-cover"
          />
      );
    }

    // fallback
    return <AvatarFallback>{userName?.[0] || "U"}</AvatarFallback>;
  };

  // overlayOnly 模式：只渲染覆盖层（用于覆盖服务端渲染的头像）
  if (overlayOnly) {
    return (
        <>
          <div
              className="absolute inset-0 cursor-pointer group rounded-full"
              onClick={handleAvatarClick}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full bg-black/30">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <AvatarDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              onSave={handleSave}
              initialData={avatarData}
          />
        </>
    );
  }

  // 完整模式：渲染头像 + 覆盖层
  return (
      <>
        <div
            className="relative group cursor-pointer"
            onClick={handleAvatarClick}
        >
          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 transition-all duration-200 group-hover:brightness-75">
            {renderAvatar()}
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full bg-black/30">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </div>
        <AvatarDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSave={handleSave}
            initialData={avatarData}
        />
      </>
  );
}
