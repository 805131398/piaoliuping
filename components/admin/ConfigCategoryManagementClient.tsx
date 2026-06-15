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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  FolderTree,
  GripVertical,
} from "lucide-react";

interface ConfigCategory {
  id: string;
  value: string;
  label: string;
  description: string | null;
  order: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count: {
    configs: number;
  };
}

interface ConfigCategoryManagementClientProps {
  initialCategories: ConfigCategory[];
}

export function ConfigCategoryManagementClient({ 
  initialCategories 
}: ConfigCategoryManagementClientProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<ConfigCategory[]>(initialCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ConfigCategory | null>(null);
  const [formData, setFormData] = useState({
    value: "",
    label: "",
    description: "",
    order: 0,
  });

  // 刷新数据
  const refreshCategories = async () => {
    try {
      const response = await fetch("/api/admin/config-categories");
      if (!response.ok) throw new Error("获取分类失败");
      const data = await response.json();
      setCategories(data.categories);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("刷新分类列表失败");
    }
  };

  // 打开编辑对话框
  const handleEdit = (category: ConfigCategory) => {
    setEditingCategory(category);
    setFormData({
      value: category.value,
      label: category.label,
      description: category.description || "",
      order: category.order,
    });
    setIsDialogOpen(true);
  };

  // 打开新建对话框
  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({
      value: "",
      label: "",
      description: "",
      order: categories.length,
    });
    setIsDialogOpen(true);
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!formData.value.trim() || !formData.label.trim()) {
      toast.error("请输入分类标识和名称");
      return;
    }

    try {
      const url = editingCategory 
        ? `/api/admin/config-categories/${editingCategory.id}` 
        : "/api/admin/config-categories";
      
      const method = editingCategory ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `${editingCategory ? "更新" : "创建"}分类失败`);
      }
      
      toast.success(`分类${editingCategory ? "更新" : "创建"}成功`);
      setIsDialogOpen(false);
      refreshCategories();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || `${editingCategory ? "更新" : "创建"}分类失败`);
    }
  };

  // 删除分类
  const handleDelete = async (categoryId: string, categoryLabel: string) => {
    if (!confirm(`确定要删除分类"${categoryLabel}"吗？`)) return;

    try {
      const response = await fetch(`/api/admin/config-categories/${categoryId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "删除分类失败");
      }
      
      toast.success("分类已删除");
      refreshCategories();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "删除分类失败");
    }
  };

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">配置分类管理</h1>
          <p className="text-muted-foreground">管理系统配置的分类</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          添加分类
        </Button>
      </div>

      {/* 分类列表 */}
      <div className="rounded-lg border">
        <div className="divide-y">
          {categories.map((category) => (
            <div
              key={category.id}
              className="p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{category.label}</span>
                      <Badge variant="outline" className="text-xs font-mono">
                        {category.value}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {category._count.configs} 个配置
                      </Badge>
                    </div>
                    
                    {category.description && (
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category.id, category.label)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={category._count.configs > 0}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 空状态 */}
      {categories.length === 0 && (
        <div className="text-center py-12">
          <FolderTree className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">暂无配置分类</p>
          <Button onClick={handleAdd} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            创建第一个分类
          </Button>
        </div>
      )}

      {/* 创建/编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "编辑分类" : "创建分类"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? "修改分类信息" : "创建新的配置分类"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="value">分类标识 *</Label>
              <Input
                id="value"
                placeholder="例如: email, storage, auth"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                disabled={!!editingCategory}
              />
              <p className="text-xs text-muted-foreground">
                用于程序内部识别，创建后不可修改
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="label">显示名称 *</Label>
              <Input
                id="label"
                placeholder="例如: 邮件配置"
                value={formData.label}
                onChange={(e) => setFormData({...formData, label: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                placeholder="请输入分类描述"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="order">排序</Label>
              <Input
                id="order"
                type="number"
                placeholder="0"
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
              />
              <p className="text-xs text-muted-foreground">
                数字越小越靠前
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleSubmit}>
              {editingCategory ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
