"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MenuItem } from "@/types/admin";
import {
  ChevronDown,
  ChevronRight,
  Home,
  Loader2,
  Menu as MenuIcon,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DynamicIcon } from "./DynamicIcon";

interface MenuItemProps {
  item: MenuItem;
  depth?: number;
}

function MenuItemComponent({ item, depth = 0 }: MenuItemProps) {
  const pathname = usePathname();
  const hasChildren = item.children && item.children.length > 0;
  
  // 检查当前路径是否在此菜单项或其子菜单中
  const isChildActive = useMemo(() => {
    if (!pathname) return false;
    
    // 检查自己的 href
    if (item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`))) {
      return true;
    }
    
    // 递归检查子菜单
    const checkChildren = (children: MenuItem[] | undefined): boolean => {
      if (!children) return false;
      return children.some((child) => {
        if (child.href && (pathname === child.href || pathname.startsWith(`${child.href}/`))) {
          return true;
        }
        return checkChildren(child.children);
      });
    };
    
    return checkChildren(item.children);
  }, [pathname, item.href, item.children]);
  
  // 只有当子菜单中有活跃项时才默认展开
  const [isOpen, setIsOpen] = useState(isChildActive);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Improve active state detection
  const isActive = useMemo(() => {
    if (!item.href || !pathname) return false;
    
    // Exact match
    if (pathname === item.href) return true;
    
    // Sub-route match (but avoid matching /admin against /admin-user)
    if (item.href !== "/admin" && item.href !== "/") {
      return pathname.startsWith(`${item.href}/`);
    }
    
    return false;
  }, [pathname, item.href]);

  // Reset navigating state when pathname changes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const content = (
    <div className="flex items-center gap-3 w-full">
      {isNavigating ? (
        <Loader2 className="w-4 h-4 shrink-0 animate-spin text-primary" />
      ) : (
        item.icon ? (
          <DynamicIcon icon={item.icon} className={cn("w-4 h-4 shrink-0", isActive && "text-primary")} />
        ) : (
          <MenuIcon className={cn("w-4 h-4 shrink-0", isActive && "text-primary")} />
        )
      )}
      <span className={cn("flex-1", isActive && "font-semibold")}>{item.label}</span>
      {hasChildren && (
        isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )
      )}
    </div>
  );

  return (
    <div>
      {item.href && !hasChildren ? (
        <Link
          href={item.href}
          onClick={() => {
            if (pathname !== item.href) {
              setIsNavigating(true);
            }
          }}
          className={cn(
            "relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            (isActive || isNavigating)
              ? "bg-primary/10 text-primary border-l-2 border-primary"
              : "text-muted-foreground",
            depth > 0 && "ml-6"
          )}
        >
          {content}
        </Link>
      ) : (
        <div
          onClick={() => hasChildren && setIsOpen(!isOpen)}
          className={cn(
            "relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground cursor-pointer",
            "text-muted-foreground",
            depth > 0 && "ml-6"
          )}
        >
          {content}
        </div>
      )}

      {hasChildren && isOpen && (
        <div className="mt-1">
          {item.children!.map((child) => (
            <MenuItemComponent
              key={child.id}
              item={child}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface AdminSidebarProps {
  menuItems: MenuItem[];
}

export function AdminSidebar({ menuItems }: AdminSidebarProps) {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <Home className="h-6 w-6" />
          <span className="text-lg">后台管理</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <MenuItemComponent key={item.id} item={item} />
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
