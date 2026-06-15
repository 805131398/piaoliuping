"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Eye,
  EyeOff,
  Filter,
  Send,
  Loader2,
  FolderCog,
} from "lucide-react";

interface ConfigCategory {
  id: string;
  value: string;
  label: string;
  description: string | null;
  order: number;
}

interface Config {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  categoryId: string | null;
  category: ConfigCategory | null;
  isSecret: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface ConfigManagementClientProps {
  initialConfigs: Config[];
  initialCategories: ConfigCategory[];
}

export function ConfigManagementClient({ 
  initialConfigs, 
  initialCategories 
}: ConfigManagementClientProps) {
  const router = useRouter();
  const [configs, setConfigs] = useState<Config[]>(initialConfigs);
  const [categories, setCategories] = useState<ConfigCategory[]>(initialCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Config | null>(null);
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    description: "",
    category: "",
    isSecret: false,
  });
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showSecretValues, setShowSecretValues] = useState<Record<string, boolean>>({});
  const [viewingConfig, setViewingConfig] = useState<Config | null>(null);
  const [isTestEmailDialogOpen, setIsTestEmailDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isTestStorageDialogOpen, setIsTestStorageDialogOpen] = useState(false);
  const [isTestingStorage, setIsTestingStorage] = useState(false);
  const [storageTestResult, setStorageTestResult] = useState<any>(null);

  // 刷新数据
  const refreshConfigs = async () => {
    try {
      const url = filterCategory && filterCategory !== "all"
        ? `/api/admin/configs?category=${filterCategory}`
        : "/api/admin/configs";
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("获取配置失败");
      const data = await response.json();
      setConfigs(data.configs);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("刷新配置列表失败");
    }
  };

  // 查看完整配置值
  const handleViewConfig = async (configId: string) => {
    try {
      const response = await fetch(`/api/admin/configs/${configId}`);
      if (!response.ok) throw new Error("获取配置详情失败");
      const data = await response.json();
      setViewingConfig(data.config);
    } catch (error) {
      console.error(error);
      toast.error("获取配置详情失败");
    }
  };

  // 打开编辑对话框
  const handleEdit = async (config: Config) => {
    // 获取完整的配置值（如果是敏感信息）
    if (config.isSecret) {
      await handleViewConfig(config.id);
      const fullConfig = await fetch(`/api/admin/configs/${config.id}`).then(res => res.json());
      config = fullConfig.config;
    }
    
    setEditingConfig(config);
    setFormData({
      key: config.key,
      value: config.value || "",
      description: config.description || "",
      category: config.categoryId || "",
      isSecret: config.isSecret,
    });
    setIsDialogOpen(true);
  };

  // 打开新建对话框
  const handleAdd = () => {
    setEditingConfig(null);
    setFormData({
      key: "",
      value: "",
      description: "",
      category: "",
      isSecret: false,
    });
    setIsDialogOpen(true);
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!formData.key.trim()) {
      toast.error("请输入配置键");
      return;
    }

    try {
      const url = editingConfig 
        ? `/api/admin/configs/${editingConfig.id}` 
        : "/api/admin/configs";
      
      const method = editingConfig ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `${editingConfig ? "更新" : "创建"}配置失败`);
      }
      
      toast.success(`配置${editingConfig ? "更新" : "创建"}成功`);
      setIsDialogOpen(false);
      refreshConfigs();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || `${editingConfig ? "更新" : "创建"}配置失败`);
    }
  };

  // 删除配置
  const handleDelete = async (configId: string, configKey: string) => {
    if (!confirm(`确定要删除配置"${configKey}"吗？`)) return;

    try {
      const response = await fetch(`/api/admin/configs/${configId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "删除配置失败");
      }
      
      toast.success("配置已删除");
      refreshConfigs();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "删除配置失败");
    }
  };

  // 切换显示敏感值
  const toggleSecretValue = (configId: string) => {
    setShowSecretValues(prev => ({
      ...prev,
      [configId]: !prev[configId],
    }));
  };

  // 测试存储连接
  const handleTestStorage = async () => {
    setIsTestingStorage(true);
    setStorageTestResult(null);
    
    try {
      const response = await fetch("/api/admin/configs/test-storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "测试存储连接失败");
      }

      setStorageTestResult({
        success: true,
        message: data.message,
        details: data.details,
      });
      toast.success("存储连接测试成功！");
    } catch (error: any) {
      console.error(error);
      setStorageTestResult({
        success: false,
        message: error.message || "测试存储连接失败",
      });
      toast.error(error.message || "测试存储连接失败");
    } finally {
      setIsTestingStorage(false);
    }
  };

  // 发送测试邮件
  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) {
      toast.error("请输入接收邮箱地址");
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      toast.error("邮箱格式不正确");
      return;
    }

    setIsSendingTest(true);
    try {
      const response = await fetch("/api/admin/configs/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "发送测试邮件失败");
      }

      toast.success(data.message || "测试邮件发送成功，请检查收件箱");
      setIsTestEmailDialogOpen(false);
      setTestEmail("");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "发送测试邮件失败");
    } finally {
      setIsSendingTest(false);
    }
  };

  // 过滤后的配置
  const filteredConfigs = filterCategory && filterCategory !== "all"
    ? configs.filter(c => c.categoryId === filterCategory)
    : configs;

  // 按分类分组
  const groupedConfigs = filteredConfigs.reduce((acc, config) => {
    const categoryId = config.categoryId || "uncategorized";
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(config);
    return acc;
  }, {} as Record<string, Config[]>);

  // 获取分类标签
  const getCategoryLabel = (categoryId: string) => {
    if (categoryId === "uncategorized") return "未分类";
    const cat = categories.find(c => c.id === categoryId);
    return cat?.label || "未知分类";
  };

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">参数管理</h1>
          <p className="text-muted-foreground">管理系统配置参数</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          添加配置
        </Button>
      </div>

      {/* 过滤器 */}
      <div className="flex items-center gap-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="选择分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/config-categories">
            <FolderCog className="mr-2 h-4 w-4" />
            管理分类
          </Link>
        </Button>
      </div>

      {/* 配置列表 */}
      <div className="space-y-6">
        {Object.entries(groupedConfigs).map(([categoryId, categoryConfigs]) => {
          const categoryValue = categories.find(c => c.id === categoryId)?.value;
          return (
          <div key={categoryId} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {getCategoryLabel(categoryId)}
              </h2>
              {categoryValue === "email" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTestEmailDialogOpen(true)}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  测试邮件
                </Button>
              )}
              {(categoryValue === "storage" || categoryValue === "aliyun_oss") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTestStorageDialogOpen(true)}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  测试存储
                </Button>
              )}
            </div>
            <div className="rounded-lg border">
              <div className="divide-y">
                {categoryConfigs.map((config) => (
                  <div
                    key={config.id}
                    className="p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm font-mono font-semibold bg-muted px-2 py-0.5 rounded">
                            {config.key}
                          </code>
                          {config.isSecret && (
                            <Badge variant="secondary" className="text-xs">
                              敏感
                            </Badge>
                          )}
                        </div>
                        
                        {config.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {config.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">值:</span>
                          {config.isSecret ? (
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                                {showSecretValues[config.id] 
                                  ? config.value || "(空)" 
                                  : "****"}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (!showSecretValues[config.id]) {
                                    handleViewConfig(config.id);
                                  }
                                  toggleSecretValue(config.id);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                {showSecretValues[config.id] ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>
                          ) : (
                            <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded break-all">
                              {config.value || "(空)"}
                            </code>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(config)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(config.id, config.key)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        })}
      </div>

      {/* 空状态 */}
      {filteredConfigs.length === 0 && (
        <div className="text-center py-12">
          <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">暂无配置数据</p>
          <Button onClick={handleAdd} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            创建第一个配置
          </Button>
        </div>
      )}

      {/* 创建/编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? "编辑配置" : "创建配置"}
            </DialogTitle>
            <DialogDescription>
              {editingConfig ? "修改配置信息" : "创建新的系统配置"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="key">配置键 *</Label>
              <Input
                id="key"
                placeholder="例如: NEXT_PUBLIC_API_URL"
                value={formData.key}
                onChange={(e) => setFormData({...formData, key: e.target.value})}
                disabled={!!editingConfig}
              />
              <p className="text-xs text-muted-foreground">
                通常使用大写字母和下划线，例如：AUTH_SECRET_KEY
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="value">配置值</Label>
              <Textarea
                id="value"
                placeholder="请输入配置值"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                placeholder="请输入配置描述"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">分类</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isSecret"
                checked={formData.isSecret}
                onCheckedChange={(checked) => 
                  setFormData({...formData, isSecret: checked as boolean})
                }
              />
              <label
                htmlFor="isSecret"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                标记为敏感信息（列表中将隐藏值）
              </label>
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
              {editingConfig ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 测试邮件对话框 */}
      <Dialog open={isTestEmailDialogOpen} onOpenChange={setIsTestEmailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>测试邮件发送</DialogTitle>
            <DialogDescription>
              发送一封测试邮件以验证邮件配置是否正确
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="test-email">接收邮箱 *</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="请输入接收测试邮件的邮箱地址"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isSendingTest) {
                    handleSendTestEmail();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                系统将向此邮箱发送一封测试邮件
              </p>
            </div>

            <div className="rounded-lg bg-muted p-4 text-sm">
              <h4 className="font-medium mb-2">测试内容：</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 验证 SMTP 服务器连接</li>
                <li>• 验证认证凭据</li>
                <li>• 测试邮件发送功能</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsTestEmailDialogOpen(false);
                setTestEmail("");
              }}
              disabled={isSendingTest}
            >
              取消
            </Button>
            <Button 
              onClick={handleSendTestEmail}
              disabled={isSendingTest || !testEmail.trim()}
              className="gap-2"
            >
              {isSendingTest ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  发送中...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  发送测试邮件
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 测试存储对话框 */}
      <Dialog open={isTestStorageDialogOpen} onOpenChange={setIsTestStorageDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>测试存储连接</DialogTitle>
            <DialogDescription>
              测试 S3 兼容存储配置是否正确（支持阿里云 OSS、腾讯云 COS、AWS S3 等）
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="rounded-lg bg-muted p-4 text-sm">
              <h4 className="font-medium mb-2">测试内容：</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 验证 Endpoint 连接</li>
                <li>• 检查存储桶是否存在</li>
                <li>• 验证访问密钥权限</li>
                <li>• 上传一个测试文件</li>
              </ul>
            </div>

            {storageTestResult && (
              <div className={`rounded-lg p-4 ${
                storageTestResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  {storageTestResult.success ? (
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      storageTestResult.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {storageTestResult.success ? '测试成功' : '测试失败'}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      storageTestResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {storageTestResult.message}
                    </p>
                    {storageTestResult.success && storageTestResult.details && (
                      <div className="mt-3 space-y-1 text-xs text-green-600">
                        <p>端点: {storageTestResult.details.endpoint}</p>
                        <p>存储桶: {storageTestResult.details.bucket}</p>
                        <p>区域: {storageTestResult.details.region}</p>
                        <p>测试文件: {storageTestResult.details.testFile}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsTestStorageDialogOpen(false);
                setStorageTestResult(null);
              }}
              disabled={isTestingStorage}
            >
              关闭
            </Button>
            <Button 
              onClick={handleTestStorage}
              disabled={isTestingStorage}
              className="gap-2"
            >
              {isTestingStorage ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  测试中...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  开始测试
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
