"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Menu as MenuIcon,
  ChevronRight,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { MenuItem } from "@/types/admin";
import { IconSelector } from "@/components/admin/IconSelector";
import { MenuTreeSelect } from "@/components/admin/MenuTreeSelect";
import { DynamicIcon } from "@/components/admin/DynamicIcon";

interface MenuTreeItemProps {
  item: MenuItem;
  level?: number;
  onEdit: (menu: MenuItem) => void;
  onDelete: (menuId: string) => void;
  onToggleVisible: (menuId: string) => void;
  onAddChild: (parentMenu: MenuItem) => void;
  onRefresh: () => void;
}

function MenuTreeItem({
  item: menu,
  level = 0,
  onEdit,
  onDelete,
  onToggleVisible,
  onAddChild,
}: MenuTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = menu.children && menu.children.length > 0;

  const content = (
    <>
      <div className="flex items-center gap-3">
        {menu.icon ? (
          <DynamicIcon icon={menu.icon} className="w-4 h-4 shrink-0" />
        ) : (
          <MenuIcon className="w-4 h-4 shrink-0" />
        )}
        <span className="flex-1">{menu.label}</span>
        {hasChildren && (
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-accent rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </>
  );

  return (
    <div>
      <div
        className="flex items-center gap-3 rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
        style={{ marginLeft: `${level * 2}rem` }}
      >
        {menu.children && menu.children.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="shrink-0"
          >
            <ChevronRight
              className={`h-4 w-4 transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          </button>
        )}
        {(!menu.children || menu.children.length === 0) && (
          <div className="w-5" />
        )}

        {menu.icon ? (
          <DynamicIcon icon={menu.icon} className="h-4 w-4 text-muted-foreground" />
        ) : (
          <MenuIcon className="h-4 w-4 text-muted-foreground" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{menu.label}</span>
            <Badge variant="outline" className="text-xs">
              {menu.order || 0}
            </Badge>
            {menu.type === "DIRECTORY" && (
              <Badge variant="outline" className="text-xs">
                目录
              </Badge>
            )}
            {!menu.visible && (
              <Badge variant="secondary" className="text-xs">
                隐藏
              </Badge>
            )}
          </div>
          {menu.href && (
            <div className="text-sm text-muted-foreground truncate">
              {menu.href}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {menu.type === "DIRECTORY" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddChild(menu)}
              className="h-7 px-2"
              title="添加子菜单"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">添加</span>
            </Button>
          )}
          
          {menu.href && menu.type === "MENU" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(menu.href, '_blank')}
              className="h-7 px-2"
              title="在新标签页打开"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">跳转</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(menu)}
            className="h-7 px-2"
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">编辑</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(menu.id)}
            className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">删除</span>
          </Button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-2">
          {menu.children!.map((child) => (
            <MenuTreeItem
              key={child.id}
              item={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleVisible={onToggleVisible}
              onAddChild={onAddChild}
              onRefresh={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface MenuManagementClientProps {
  initialMenus: MenuItem[];
}

export function MenuManagementClient({ initialMenus }: MenuManagementClientProps) {
  const router = useRouter();
  const [menus, setMenus] = useState<MenuItem[]>(initialMenus);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    type: "MENU" as "DIRECTORY" | "MENU",
    icon: "",
    href: "",
    parentId: "",
    order: 0,
    visible: true,
  });

  const refreshMenus = async () => {
    try {
      const response = await fetch("/api/admin/menus");
      if (!response.ok) throw new Error("获取菜单失败");
      const data = await response.json();
      setMenus(data.menus);
      
      // 刷新服务端组件，更新左侧菜单栏
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("刷新菜单失败");
    }
  };

  const handleToggleVisible = async (menuId: string) => {
    const findMenu = (items: MenuItem[]): MenuItem | null => {
      for (const item of items) {
        if (item.id === menuId) return item;
        if (item.children) {
          const found = findMenu(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    const menu = findMenu(menus);
    if (!menu) return;

    try {
      const response = await fetch(`/api/admin/menus/${menuId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !menu.visible }),
      });
      
      if (!response.ok) throw new Error("更新菜单状态失败");
      
      toast.success("菜单状态已更新");
      refreshMenus();
    } catch (error) {
      console.error(error);
      toast.error("更新菜单状态失败");
    }
  };

  const handleDelete = async (menuId: string) => {
    if (!confirm("确定要删除这个菜单吗？")) return;

    try {
      const response = await fetch(`/api/admin/menus/${menuId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "删除菜单失败");
      }
      
      toast.success("菜单已删除");
      refreshMenus();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "删除菜单失败");
    }
  };

  const handleEdit = (menu: MenuItem) => {
    setEditingMenu(menu);
    setFormData({
      label: menu.label,
      type: (menu.type || "MENU") as "DIRECTORY" | "MENU",
      icon: menu.icon || "",
      href: menu.href || "",
      parentId: menu.parentId || "",
      order: menu.order || 0,
      visible: menu.visible ?? true,
    });
    setIsAddDialogOpen(true);
  };

  const handleAddChild = (parentMenu: MenuItem) => {
    setEditingMenu(null);
    setFormData({
      label: "",
      type: "MENU",
      icon: "",
      href: "",
      parentId: parentMenu.id,
      order: 0,
      visible: true,
    });
    setIsAddDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.label) {
      toast.error("请输入菜单名称");
      return;
    }

    try {
      const url = editingMenu 
        ? `/api/admin/menus/${editingMenu.id}` 
        : "/api/admin/menus";
      
      const method = editingMenu ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: formData.label,
          type: formData.type,
          icon: formData.icon || null,
          href: formData.href || null,
          parentId: formData.parentId || null,
          order: formData.order,
          visible: formData.visible,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `${editingMenu ? "更新" : "创建"}菜单失败`);
      }
      
      toast.success(`菜单${editingMenu ? "更新" : "创建"}成功`);
      setIsAddDialogOpen(false);
      setEditingMenu(null);
      setFormData({
        label: "",
        type: "MENU",
        icon: "",
        href: "",
        parentId: "",
        order: 0,
        visible: true,
      });
      refreshMenus();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || `${editingMenu ? "更新" : "创建"}菜单失败`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">菜单管理</h1>
          <p className="text-muted-foreground">管理后台管理系统的菜单结构</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMenu(null)}>
              <Plus className="mr-2 h-4 w-4" />
              添加菜单
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingMenu ? "编辑菜单" : "添加新菜单"}
              </DialogTitle>
              <DialogDescription>
                {editingMenu ? "修改菜单信息" : "创建一个新的菜单项"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="label">菜单名称 *</Label>
                <Input
                  id="label"
                  placeholder="请输入菜单名称"
                  value={formData.label}
                  onChange={(e) => setFormData({...formData, label: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">类型</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as "DIRECTORY" | "MENU"})}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MENU">菜单（可点击）</SelectItem>
                    <SelectItem value="DIRECTORY">目录（分组）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="icon">图标</Label>
                <IconSelector
                  value={formData.icon}
                  onChange={(icon) => setFormData({...formData, icon})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="href">菜单路径</Label>
                <Input
                  id="href"
                  placeholder="例如: /admin/users"
                  value={formData.href}
                  onChange={(e) => setFormData({...formData, href: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="parent">父级菜单</Label>
                <MenuTreeSelect
                  menus={menus}
                  value={formData.parentId}
                  onChange={(value) => setFormData({...formData, parentId: value})}
                  placeholder="选择父级菜单（可选）"
                  excludeId={editingMenu?.id}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order">排序</Label>
                <Input
                  id="order"
                  type="number"
                  placeholder="数字越小越靠前"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="visible"
                  checked={formData.visible}
                  onCheckedChange={(checked) => setFormData({...formData, visible: checked as boolean})}
                />
                <label
                  htmlFor="visible"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  显示菜单
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingMenu(null);
                  setFormData({
                    label: "",
                    type: "MENU",
                    icon: "",
                    href: "",
                    parentId: "",
                    order: 0,
                    visible: true,
                  });
                }}
              >
                取消
              </Button>
              <Button onClick={handleSubmit}>
                {editingMenu ? "保存" : "创建"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {menus.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            暂无菜单数据，请点击"添加菜单"创建
          </div>
        ) : (
          menus.map((menu) => (
            <MenuTreeItem
              key={menu.id}
              item={menu}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleVisible={handleToggleVisible}
              onAddChild={handleAddChild}
              onRefresh={refreshMenus}
            />
          ))
        )}
      </div>
    </div>
  );
}
