"use client";

import React, { useState, useMemo } from "react";
import * as Icons from "lucide-react";
import { MenuItem } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronRight, ChevronDown, Check, Search, Menu as MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuTreeSelectProps {
  menus: MenuItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  excludeId?: string;
}

interface TreeNodeProps {
  menu: MenuItem;
  level: number;
  selectedId: string;
  onSelect: (id: string) => void;
  searchTerm: string;
  expandedNodes: Set<string>;
  toggleExpand: (id: string) => void;
}

function TreeNode({
  menu,
  level,
  selectedId,
  onSelect,
  searchTerm,
  expandedNodes,
  toggleExpand,
}: TreeNodeProps) {
  const hasChildren = menu.children && menu.children.length > 0;
  const isExpanded = expandedNodes.has(menu.id);
  const isSelected = selectedId === menu.id;

  const IconComponent = menu.icon && (Icons as any)[menu.icon]
    ? (Icons as any)[menu.icon]
    : MenuIcon;

  // 检查当前节点或子节点是否匹配搜索
  const matchesSearch = (item: MenuItem, term: string): boolean => {
    if (!term) return true;
    const lowerTerm = term.toLowerCase();
    if (item.label.toLowerCase().includes(lowerTerm)) return true;
    if (item.children) {
      return item.children.some(child => matchesSearch(child, term));
    }
    return false;
  };

  const shouldShow = matchesSearch(menu, searchTerm);
  if (!shouldShow) return null;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors",
          isSelected && "bg-accent"
        )}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        onClick={() => onSelect(menu.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(menu.id);
            }}
            className="shrink-0 p-0.5 hover:bg-accent-foreground/10 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}
        
        <IconComponent className="h-4 w-4 text-muted-foreground shrink-0" />
        
        <span className="flex-1 text-sm truncate">{menu.label}</span>
        
        {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-0.5 space-y-0.5">
          {menu.children!.map((child) => (
            <TreeNode
              key={child.id}
              menu={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              searchTerm={searchTerm}
              expandedNodes={expandedNodes}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function MenuTreeSelect({
  menus,
  value,
  onChange,
  placeholder = "选择父级菜单（可选）",
  excludeId,
}: MenuTreeSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // 过滤掉当前编辑的菜单及其子菜单
  const filterMenus = (items: MenuItem[], exclude?: string): MenuItem[] => {
    return items
      .filter(item => item.id !== exclude)
      .map(item => ({
        ...item,
        children: item.children ? filterMenus(item.children, exclude) : undefined,
      }));
  };

  const filteredMenus = useMemo(() => {
    return filterMenus(menus, excludeId);
  }, [menus, excludeId]);

  // 自动展开包含搜索结果的节点
  const autoExpandForSearch = (items: MenuItem[], term: string, expanded: Set<string> = new Set()): Set<string> => {
    if (!term) return expanded;
    
    const lowerTerm = term.toLowerCase();
    items.forEach(item => {
      if (item.label.toLowerCase().includes(lowerTerm)) {
        expanded.add(item.id);
      }
      if (item.children) {
        const childExpanded = autoExpandForSearch(item.children, term, expanded);
        if (childExpanded.size > expanded.size) {
          expanded.add(item.id);
        }
      }
    });
    return expanded;
  };

  // 当搜索词改变时自动展开相关节点
  React.useEffect(() => {
    if (searchTerm) {
      const newExpanded = autoExpandForSearch(filteredMenus, searchTerm);
      setExpandedNodes(newExpanded);
    }
  }, [searchTerm, filteredMenus]);

  const toggleExpand = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 查找选中菜单的显示文本
  const findMenuLabel = (items: MenuItem[], id: string): string | null => {
    for (const item of items) {
      if (item.id === id) return item.label;
      if (item.children) {
        const found = findMenuLabel(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedLabel = value ? findMenuLabel(filteredMenus, value) : null;

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onChange("");
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">
            {selectedLabel || placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[400px] p-0 flex flex-col max-h-[400px]" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center border-b px-3 py-2 flex-shrink-0 bg-background">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="搜索菜单..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div 
          className="overflow-y-auto overflow-x-hidden flex-1 min-h-[100px]" 
          style={{ maxHeight: '300px', overscrollBehavior: 'contain' }}
        >
          <div className="p-2 space-y-0.5">
            <div
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors",
                !value && "bg-accent"
              )}
              onClick={handleClear}
            >
              <div className="w-5" />
              <MenuIcon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-sm">无（顶级菜单）</span>
              {!value && <Check className="h-4 w-4 text-primary" />}
            </div>
            
            {filteredMenus.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                没有可选的菜单
              </div>
            ) : (
              filteredMenus.map((menu) => (
                <TreeNode
                  key={menu.id}
                  menu={menu}
                  level={0}
                  selectedId={value}
                  onSelect={handleSelect}
                  searchTerm={searchTerm}
                  expandedNodes={expandedNodes}
                  toggleExpand={toggleExpand}
                />
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
