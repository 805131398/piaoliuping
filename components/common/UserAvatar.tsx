"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOssImage } from "@/lib/hooks/useOssImage";
import { cn } from "@/lib/utils";
import { createAvatar } from "@dicebear/core";
import * as styles from "@dicebear/collection";
import type { Style } from "@dicebear/core";
import { Buffer } from "buffer";

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  className?: string;
  // 可选：直接传入 user 对象
  user?: {
    image?: string | null;
    name?: string | null;
    email?: string | null;
    avatarType?: string | null;
    avatarStyle?: string | null;
    avatarSeed?: string | null;
    id?: string | null;
  };
}

/**
 * 用户头像组件
 * 统一处理 OSS 图片签名 URL 和 DiceBear 系统头像
 */
export function UserAvatar({ 
  src, 
  alt, 
  fallback, 
  className,
  user 
}: UserAvatarProps) {
  // 1. 处理数据来源
  const imageSrc = user?.image || src;
  const fallbackText = user 
    ? (user.name?.[0] || user.email?.[0] || "U").toUpperCase()
    : (fallback || "U").toUpperCase();
  const altText = user?.name || alt || "用户头像";

  const avatarType = user?.avatarType || (imageSrc ? "custom" : "system");
  const avatarStyle = user?.avatarStyle || "lorelei";
  const avatarSeed = user?.avatarSeed || user?.id || user?.email || "user";

  // 2. 处理 OSS 图片签名
  // 如果是 custom 类型且有 URL，尝试作为 OSS 图片处理
  const shouldFetchOss = avatarType === "custom" && !!imageSrc;
  const { imageUrl } = useOssImage(shouldFetchOss ? imageSrc : null);

  // 3. 生成系统头像 SVG
  const systemAvatarSvg = useMemo(() => {
    if (avatarType !== "system") return null;
    
    try {
      const styleModule = (
        styles as Record<string, Style<Record<string, unknown>>>
      )[avatarStyle];
      
      if (styleModule) {
        return createAvatar(styleModule, {
          seed: avatarSeed,
        }).toString();
      }
    } catch (error) {
      console.error("生成系统头像失败:", error);
    }
    return null;
  }, [avatarType, avatarStyle, avatarSeed]);

  // 4. 决定最终显示的图片源
  let finalSrc: string | undefined = undefined;

  if (avatarType === "custom") {
    finalSrc = imageUrl || undefined;
  } else if (avatarType === "system" && systemAvatarSvg) {
    const svgBase64 = Buffer.from(systemAvatarSvg).toString("base64");
    finalSrc = `data:image/svg+xml;base64,${svgBase64}`;
  }

  return (
    <Avatar className={cn("h-10 w-10", className)}>
      <AvatarImage src={finalSrc} alt={altText} className="object-cover" />
      <AvatarFallback className="bg-muted flex items-center justify-center text-muted-foreground">
        {fallbackText}
      </AvatarFallback>
    </Avatar>
  );
}
