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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Users, 
  Menu as MenuIcon,
  UserPlus,
  X
} from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: string | Date;
}

interface Menu {
  id: string;
  label: string;
  type: string;
  icon: string | null;
  href: string | null;
  parentId: string | null;
  order: number;
  visible: boolean;
  children?: MenuTreeNode[];
}

interface MenuTreeNode {
  id: string;
  label: string;
  type: string;
  icon: string | null;
  href: string | null;
  parentId: string | null;
  order: number;
  visible: boolean;
  children: MenuTreeNode[];
}


interface RoleMenu {
  id: string;
  menu: Menu;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  menus: RoleMenu[];
  _count: {
    users: number;
    menus: number;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface RoleManagementClientProps {
  initialRoles: Role[];
  menus: Menu[];
}

export function RoleManagementClient({ 
  initialRoles,
  menus 
}: RoleManagementClientProps) {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);
  const [roleUsers, setRoleUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loadingAvailableUsers, setLoadingAvailableUsers] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // 刷新数据
  const refreshRoles = async () => {
    try {
      const response = await fetch("/api/admin/roles");
      if (!response.ok) throw new Error("获取角色失败");
      const data = await response.json();
      setRoles(data.roles);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("刷新角色列表失败");
    }
  };

  // 打开编辑对话框
  const handleEdit = async (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
    });
    setSelectedMenus(role.menus.map(m => m.menu.id));
    setIsDialogOpen(true);
    
    // 加载该角色的用户列表
    await loadRoleUsers(role.id);
  };

  // 打开新建对话框
  const handleAdd = () => {
    setEditingRole(null);
    setFormData({
      name: "",
      description: "",
    });
    setSelectedMenus([]);
    setRoleUsers([]);
    setIsDialogOpen(true);
  };

  // 加载角色的用户列表
  const loadRoleUsers = async (roleId: string) => {
    setLoadingUsers(true);
    try {
      const response = await fetch(`/api/admin/roles/${roleId}/users`);
      if (!response.ok) throw new Error("获取用户列表失败");
      const data = await response.json();
      setRoleUsers(data.users || []);
    } catch (error) {
      console.error(error);
      toast.error("获取用户列表失败");
      setRoleUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // 加载可用用户列表（排除当前角色的用户）
  const loadAvailableUsers = async (roleId: string) => {
    setLoadingAvailableUsers(true);
    try {
      const response = await fetch(`/api/admin/users/available?roleId=${roleId}`);
      if (!response.ok) throw new Error("获取可用用户失败");
      const data = await response.json();
      setAvailableUsers(data.users || []);
    } catch (error) {
      console.error(error);
      toast.error("获取可用用户失败");
      setAvailableUsers([]);
    } finally {
      setLoadingAvailableUsers(false);
    }
  };

  // 打开添加用户对话框
  const handleOpenAddUser = async () => {
    if (!editingRole) return;
    setSelectedUserIds([]);
    setIsAddUserDialogOpen(true);
    await loadAvailableUsers(editingRole.id);
  };

  // 添加用户到角色
  const handleAddUsers = async () => {
    if (!editingRole || selectedUserIds.length === 0) {
      toast.error("请选择要添加的用户");
      return;
    }

    try {
      const response = await fetch(`/api/admin/roles/${editingRole.id}/users/manage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: selectedUserIds }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "添加用户失败");
      }

      const result = await response.json();
      toast.success(result.message || "添加用户成功");
      setIsAddUserDialogOpen(false);
      setSelectedUserIds([]);
      
      // 刷新用户列表
      await loadRoleUsers(editingRole.id);
      refreshRoles();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "添加用户失败");
    }
  };

  // 从角色移除用户
  const handleRemoveUser = async (userId: string, userName: string | null) => {
    if (!editingRole) return;
    
    if (!confirm(`确定要将用户 "${userName || '未知用户'}" 从该角色移除吗？`)) return;

    try {
      const response = await fetch(
        `/api/admin/roles/${editingRole.id}/users/manage?userId=${userId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "移除用户失败");
      }

      toast.success("移除用户成功");
      
      // 刷新用户列表
      await loadRoleUsers(editingRole.id);
      refreshRoles();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "移除用户失败");
    }
  };

  // 切换用户选择
  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("请输入角色名称");
      return;
    }

    try {
      const url = editingRole 
        ? `/api/admin/roles/${editingRole.id}` 
        : "/api/admin/roles";
      
      const method = editingRole ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          menuIds: selectedMenus,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `${editingRole ? "更新" : "创建"}角色失败`);
      }
      
      toast.success(`角色${editingRole ? "更新" : "创建"}成功`);
      setIsDialogOpen(false);
      refreshRoles();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || `${editingRole ? "更新" : "创建"}角色失败`);
    }
  };

  // 删除角色
  const handleDelete = async (roleId: string, roleName: string) => {
    if (!confirm(`确定要删除角色"${roleName}"吗？`)) return;

    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "删除角色失败");
      }
      
      toast.success("角色已删除");
      refreshRoles();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "删除角色失败");
    }
  };

  // 获取菜单节点及其所有子节点的ID
  const getAllMenuIds = (menuNode: MenuTreeNode): string[] => {
    const ids = [menuNode.id];
    if (menuNode.children && menuNode.children.length > 0) {
      menuNode.children.forEach(child => {
        ids.push(...getAllMenuIds(child));
      });
    }
    return ids;
  };

  // 从扁平菜单列表中找到对应的树节点
  const findMenuNode = (menuId: string, nodes: MenuTreeNode[]): MenuTreeNode | null => {
    for (const node of nodes) {
      if (node.id === menuId) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const found = findMenuNode(menuId, node.children);
        if (found) return found;
      }
    }
    return null;
  };

  // 切换菜单选择（级联选择：选择父节点会自动选择所有子节点）
  const toggleMenu = (menuId: string) => {
    const menuTree = buildMenuTree(menus);
    const menuNode = findMenuNode(menuId, menuTree);
    
    if (!menuNode) return;

    // 获取该节点及其所有子节点的ID
    const allIds = getAllMenuIds(menuNode);
    
    setSelectedMenus(prev => {
      // 检查当前选择状态
      const selectedCount = allIds.filter(id => prev.includes(id)).length;
      
      if (selectedCount === allIds.length) {
        // 完全选中状态 -> 取消选择：移除该节点及所有子节点
        return prev.filter(id => !allIds.includes(id));
      } else {
        // 未选中或半选状态 -> 选择：添加该节点及所有子节点
        const newSet = new Set([...prev, ...allIds]);
        return Array.from(newSet);
      }
    });
  };

  // 跳转到用户管理页面，显示该角色的用户
  const handleViewUsers = (roleId: string) => {
    router.push(`/admin/users?roleId=${roleId}`);
  };

  // 构建树形菜单结构
  const buildMenuTree = (menus: Menu[]): MenuTreeNode[] => {
    const menuMap = new Map<string, MenuTreeNode>();
    const rootMenus: MenuTreeNode[] = [];

    // 先创建所有菜单节点
    menus.forEach((menu) => {
      menuMap.set(menu.id, {
        id: menu.id,
        label: menu.label,
        type: menu.type,
        icon: menu.icon,
        href: menu.href,
        parentId: menu.parentId,
        order: menu.order,
        visible: menu.visible,
        children: [],
      });
    });

    // 构建树形关系
    menus.forEach((menu) => {
      const menuNode = menuMap.get(menu.id);
      if (menuNode) {
        if (menu.parentId) {
          const parent = menuMap.get(menu.parentId);
          if (parent) {
            parent.children.push(menuNode);
          }
        } else {
          rootMenus.push(menuNode);
        }
      }
    });

    return rootMenus;
  };

  // 检查节点的选择状态（完全选中/部分选中/未选中）
  const getNodeCheckState = (menuNode: MenuTreeNode): boolean | "indeterminate" => {
    const allIds = getAllMenuIds(menuNode);
    const selectedCount = allIds.filter(id => selectedMenus.includes(id)).length;
    
    if (selectedCount === 0) {
      return false;
    } else if (selectedCount === allIds.length) {
      return true;
    } else {
      return "indeterminate";
    }
  };

  // 递归渲染树形菜单项
  const renderMenuTreeItem = (menuNode: MenuTreeNode, level: number = 0) => {
    const hasChildren = menuNode.children && menuNode.children.length > 0;
    const checkState = getNodeCheckState(menuNode);

    return (
      <div key={menuNode.id} className="space-y-1">
        <div
          className="flex items-center space-x-2"
          style={{ paddingLeft: `${level * 20}px` }}
        >
          <Checkbox
            id={`menu-${menuNode.id}`}
            checked={checkState}
            onCheckedChange={() => toggleMenu(menuNode.id)}
          />
          <label
            htmlFor={`menu-${menuNode.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
          >
            <div className="flex items-center gap-2">
              <span>{menuNode.label}</span>
              {menuNode.type === "DIRECTORY" && (
                <Badge variant="outline" className="text-xs">目录</Badge>
              )}
              {!menuNode.visible && (
                <Badge variant="secondary" className="text-xs">隐藏</Badge>
              )}
            </div>
            {menuNode.href && (
              <div className="text-xs text-muted-foreground">{menuNode.href}</div>
            )}
          </label>
        </div>
        {hasChildren && (
          <div className="space-y-1">
            {menuNode.children.map((child) => renderMenuTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // 构建菜单树
  const menuTree = buildMenuTree(menus);

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">角色管理</h1>
          <p className="text-muted-foreground">管理系统角色、权限和菜单访问</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          添加角色
        </Button>
      </div>

      {/* 角色列表 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <div
            key={role.id}
            className="rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">{role.name}</h3>
                  </div>
                  {role.description && (
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                  )}
                </div>
              </div>

              {/* 统计信息 */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-semibold">{role._count.users}</div>
                  <div className="text-muted-foreground text-xs">用户</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{role._count.menus}</div>
                  <div className="text-muted-foreground text-xs">菜单</div>
                </div>
              </div>

              {/* 菜单预览 */}
              {role.menus.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium flex items-center gap-1">
                    <MenuIcon className="h-3.5 w-3.5" />
                    菜单
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {role.menus.slice(0, 3).map((rm) => (
                      <Badge key={rm.id} variant="outline" className="text-xs">
                        {rm.menu.label}
                      </Badge>
                    ))}
                    {role.menus.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{role.menus.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(role)}
                  className="flex-1"
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  编辑
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(role.id, role.name)}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  删除
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {roles.length === 0 && (
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">暂无角色数据</p>
          <Button onClick={handleAdd} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            创建第一个角色
          </Button>
        </div>
      )}

      {/* 创建/编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "编辑角色" : "创建角色"}
            </DialogTitle>
            <DialogDescription>
              {editingRole ? "修改角色信息、权限和菜单访问" : "创建新角色并分配权限和菜单"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* 基本信息 */}
            <div className="grid gap-2">
              <Label htmlFor="name">角色名称 *</Label>
              <Input
                id="name"
                placeholder="请输入角色名称"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">角色描述</Label>
              <Textarea
                id="description"
                placeholder="请输入角色描述"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={2}
              />
            </div>

            {/* 选项卡：菜单和用户 */}
            <Tabs defaultValue="menus" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="menus">
                  菜单配置 ({selectedMenus.length})
                </TabsTrigger>
                <TabsTrigger value="users" disabled={!editingRole}>
                  当前用户 ({editingRole ? roleUsers.length : 0})
                </TabsTrigger>
              </TabsList>
              
              {/* 菜单配置 */}
              <TabsContent value="menus" className="space-y-4">
                <div className="rounded-md border p-4 max-h-[400px] overflow-y-auto space-y-2">
                  {menuTree.length > 0 ? (
                    <div className="space-y-1">
                      {menuTree.map((menuNode) => renderMenuTreeItem(menuNode, 0))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      暂无菜单数据
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* 用户列表 */}
              <TabsContent value="users" className="space-y-4">
                <div className="flex justify-end mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenAddUser}
                    disabled={!editingRole}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    添加用户
                  </Button>
                </div>
                {loadingUsers ? (
                  <div className="text-center py-8 text-muted-foreground">
                    加载中...
                  </div>
                ) : roleUsers.length > 0 ? (
                  <div className="rounded-md border">
                    <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                      {roleUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name || ""}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="h-4 w-4 text-primary" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{user.name || "未设置姓名"}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveUser(user.id, user.name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="border-t p-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUsers(editingRole!.id)}
                        className="w-full"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        在用户管理中查看
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border p-8 text-center">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">该角色暂无用户</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenAddUser}
                      className="mt-4"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      添加第一个用户
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleSubmit}>
              {editingRole ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加用户对话框 */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>添加用户到角色</DialogTitle>
            <DialogDescription>
              选择要添加到 "{editingRole?.name}" 角色的用户
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {loadingAvailableUsers ? (
              <div className="text-center py-8 text-muted-foreground">
                加载可用用户...
              </div>
            ) : availableUsers.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto rounded-md border p-4">
                {availableUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={selectedUserIds.includes(user.id)}
                      onCheckedChange={() => toggleUserSelection(user.id)}
                    />
                    <label
                      htmlFor={`user-${user.id}`}
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                    >
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || ""}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{user.name || "未设置姓名"}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm">没有可添加的用户</p>
                <p className="text-xs mt-1">所有用户都已在该角色中</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                已选择 {selectedUserIds.length} 个用户
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddUserDialogOpen(false)}
                >
                  取消
                </Button>
                <Button
                  onClick={handleAddUsers}
                  disabled={selectedUserIds.length === 0}
                >
                  添加 ({selectedUserIds.length})
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
