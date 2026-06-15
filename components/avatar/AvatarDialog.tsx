"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Avatar, AvatarImage } from "../ui/avatar";
import { useEffect, useState } from "react";
import { createAvatar } from "@dicebear/core";
import * as styles from "@dicebear/collection";
import DiceBearAvatarPanel from "./DiceBearAvatarPanel";
import UploadAvatarPanel from "./UploadAvatarPanel";
import Image from "next/image";
import type { Style } from "@dicebear/core";
import { OssAvatar } from "@/components/ui/oss-image";

export interface AvatarData {
  avatarType: "system" | "custom";
  avatarSeed: string;
  avatarStyle: string;
  avatarUrl?: string;
  fileData?: string; // 用于存储 base64 文件数据
}

interface AvatarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: AvatarData) => void;
  initialData: AvatarData;
}

// 新增 DiceBearAvatarPreview 组件
function DiceBearAvatarPreview({ style, seed }: { style: string; seed: string }) {
  try {
    const styleModule = (styles as Record<string, Style<Record<string, unknown>>>)[style];
    if (styleModule) {
      const avatar = createAvatar(styleModule, { seed });
      const svg = avatar.toString();
      const dataUri = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
      return (
          <Avatar className="w-20 h-20 mx-auto mb-2 shadow-lg border-4 border-white bg-white">
            <Image src={dataUri} alt="预览头像" fill style={{objectFit:'cover'}} />
          </Avatar>
      );
    }
  } catch {
    return <Avatar className="w-20 h-20 mx-auto mb-2" />;
  }
  return <Avatar className="w-20 h-20 mx-auto mb-2" />;
}

export default function AvatarDialog({ open, onOpenChange, onSave, initialData }: AvatarDialogProps) {
  const [tab, setTab] = useState<"system" | "custom">(initialData.avatarType);
  const [avatarData, setAvatarData] = useState<AvatarData>(initialData);

  useEffect(() => {
    setTab(initialData.avatarType);
  }, [initialData]);

  useEffect(() => {
    setAvatarData(initialData);
  }, [initialData]);

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>更换头像 </DialogTitle>
          </DialogHeader>
          {/* 头像预览区（顶部大头像） */}
          <div className="flex justify-center mb-6">
            {tab === "system" ? (
                <DiceBearAvatarPreview style={avatarData.avatarStyle} seed={avatarData.avatarSeed} />
            ) : (
                <Avatar className="w-20 h-20 mx-auto mb-2 shadow-lg border-4 border-white bg-white">
                  {avatarData.avatarUrl ? (
                      <OssAvatar src={avatarData.avatarUrl} alt="头像预览" size={80} className="w-full h-full" />
                  ) : null}
                </Avatar>
            )}
          </div>

          {/* 切换按钮 */}
          <div className="flex rounded-lg bg-muted p-1 mb-4">
            <button
                onClick={() => setTab("system")}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    tab === "system"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
              系统头像
            </button>
            <button
                onClick={() => setTab("custom")}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    tab === "custom"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
              自定义头像
            </button>
          </div>

          {/* 内容区 */}
          <div className="mt-4">
            {tab === "system" && (
                <DiceBearAvatarPanel
                    value={avatarData}
                    onChange={data => setAvatarData({ ...avatarData, ...data, avatarType: "system", avatarUrl: initialData.avatarUrl })}
                />
            )}

            {tab === "custom" && (
                <UploadAvatarPanel
                    value={avatarData}
                    onChange={data => setAvatarData({ ...avatarData, ...data, avatarType: "custom" })}
                />
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={() => onSave({ ...avatarData, avatarType: tab })}>
              确认
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  );
} 