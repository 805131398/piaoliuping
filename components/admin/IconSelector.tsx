"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2, ExternalLink } from "lucide-react";
import { DynamicIcon } from "@/components/admin/DynamicIcon";

interface IconSelectorProps {
  value?: string;
  onChange: (iconName: string) => void;
}

// 常用图标列表 (保持 PascalCase 兼容旧数据和本地 Lucide)
const commonIcons = [
  "Home",
  "LayoutDashboard",
  "Users",
  "UserCog",
  "Shield",
  "Menu",
  "Settings",
  "FileText",
  "File",
  "Folder",
  "Image",
  "Video",
  "Music",
  "Archive",
  "Database",
  "Server",
  "Cloud",
  "Globe",
  "Mail",
  "MessageSquare",
  "Bell",
  "Calendar",
  "Clock",
  "Activity",
  "BarChart",
  "PieChart",
  "TrendingUp",
  "Package",
  "ShoppingCart",
  "CreditCard",
  "DollarSign",
  "Star",
  "Heart",
  "Bookmark",
  "Tag",
  "Search",
  "Filter",
  "Download",
  "Upload",
  "Plus",
  "Minus",
  "Edit",
  "Trash2",
  "Save",
  "Copy",
  "Eye",
  "EyeOff",
  "Lock",
  "Unlock",
  "Key",
  "LogIn",
  "LogOut",
  "UserPlus",
  "UserMinus",
  "Check",
  "X",
  "AlertCircle",
  "AlertTriangle",
  "Info",
  "HelpCircle",
  "Zap",
  "Cpu",
  "HardDrive",
  "Monitor",
  "Smartphone",
  "Wifi",
  "Bluetooth",
  "Gamepad",
  "Gamepad2",
  "Joystick",
  "Swords",
  "Trophy",
  "Medal",
  "Crown",
];

export function IconSelector({ value, onChange }: IconSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [onlineResults, setOnlineResults] = useState<string[]>([]);

  // 执行在线搜索
  useEffect(() => {
    if (!search.trim()) {
      setOnlineResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // 使用 Iconify API 搜索
        // 如果用户输入包含冒号（如 mdi:home），API 会自动处理
        // 默认加上 prefix=lucide 偏好，但如果用户明确搜其他的也能搜到？
        // 为了体验最好，我们默认搜 lucide，但如果用户输入了 "mdi:" 开头，我们就不加 prefix 限制
        
        let apiUrl = `https://api.iconify.design/search?limit=100&query=${encodeURIComponent(search)}`;
        
        // 如果不包含冒号，且不显式包含库名，默认偏向 Lucide (通过追加 prefix 参数? Iconify API 的 prefix 参数是过滤用的)
        // 如果我们想默认搜 Lucide 但允许其他的，比较麻烦。
        // 简单起见：默认只搜 Lucide。如果用户想搜其他的，需要我们提供切换或者在搜索词里特殊处理。
        // 鉴于用户给了 icones 的链接，那里是全库搜索。
        // 我们这里暂时默认搜 Lucide，以保持风格一致。但如果用户搜 "mdi:home"，我们检测到冒号就去掉 prefix 参数。
        
        if (!search.includes(":")) {
            apiUrl += "&prefix=lucide";
        }

        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.icons && Array.isArray(data.icons)) {
          setOnlineResults(data.icons);
        }
      } catch (error) {
        console.error("Failed to search icons:", error);
        setOnlineResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms 防抖

    return () => clearTimeout(timer);
  }, [search]);

  // 最终显示的图标列表
  const displayIcons = useMemo(() => {
    if (!search.trim()) {
      return commonIcons;
    }
    return onlineResults;
  }, [search, onlineResults]);

  const handleSelectIcon = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start overflow-hidden">
          {value ? (
            <DynamicIcon icon={value} className="mr-2 h-4 w-4 shrink-0" />
          ) : (
            <div className="mr-2 h-4 w-4" />
          )}
          <span className="truncate">{value || "选择图标"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>选择图标 {search && `(搜索结果: ${displayIcons.length})`}</DialogTitle>
          <p className="text-xs text-muted-foreground pt-1">
            默认搜索 Lucide 图标。也可前往 <a href="https://icones.js.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">icones.js.org</a> 搜索任意图标，复制名称（如 "mdi:account"）即可使用。
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            {loading ? (
              <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            ) : (
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            )}
            <Input
              placeholder="在线搜索... (例如: 'home', 'mdi:account')"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-6 gap-2">
              {displayIcons.map((iconName) => (
                <button
                  key={iconName}
                  onClick={() => handleSelectIcon(iconName)}
                  className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-4 hover:bg-accent hover:border-primary transition-colors ${
                    value === iconName ? "bg-accent border-primary" : ""
                  }`}
                  title={iconName}
                >
                  <DynamicIcon icon={iconName} className="h-6 w-6" />
                  <span className="text-xs text-center truncate w-full px-1">
                    {iconName.includes(":") ? iconName.split(":")[1] : iconName}
                  </span>
                </button>
              ))}
            </div>
            {displayIcons.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                <p>{search ? "未找到匹配的图标" : "请输入关键词搜索"}</p>
                {search && (
                  <Button
                    variant="link"
                    className="gap-1"
                    onClick={() => window.open(`https://icones.js.org/collection/all?s=${encodeURIComponent(search)}`, '_blank')}
                  >
                    去 icones.js.org 搜索 "{search}" <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
