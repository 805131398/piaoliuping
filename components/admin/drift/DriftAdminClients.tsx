"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Plus, RefreshCw, Trash2 } from "lucide-react";

const bottleStatusOptions = [
  { value: "FLOATING", label: "漂流中" },
  { value: "RETURNED", label: "已归海" },
  { value: "ARCHIVED", label: "已归档" },
  { value: "BLOCKED", label: "已屏蔽" },
  { value: "DELETED", label: "已删除" },
];

const reviewStatusOptions = [
  { value: "PENDING", label: "待处理" },
  { value: "REVIEWING", label: "处理中" },
  { value: "RESOLVED", label: "已处理" },
  { value: "REJECTED", label: "已驳回" },
];

const rarityOptions = [
  { value: "COMMON", label: "普通" },
  { value: "RARE", label: "稀有" },
  { value: "EPIC", label: "史诗" },
  { value: "LIMITED", label: "限定" },
];

function formatDate(value: string | Date) {
  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(value: string, options: { value: string; label: string }[]) {
  return options.find(option => option.value === value)?.label || value;
}

interface DriftTag {
  id: string;
  code: string;
  name: string;
  color: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { bottles: number };
}

interface DriftBottle {
  id: string;
  title: string | null;
  contentType: string;
  textContent: string | null;
  mood: string | null;
  status: string;
  isAnonymous: boolean;
  replyCount: number;
  discoveryCount: number;
  createdAt: string | Date;
  author: { id: string; name: string | null; email: string | null; phone?: string | null };
  tags: { tag: DriftTag }[];
  _count: { discoveries: number; conversations: number; reports: number };
}

interface DriftReport {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string | Date;
  reporter: { id: string; name: string | null; email: string | null };
  handler: { id: string; name: string | null; email: string | null } | null;
  bottle: { id: string; title: string | null; textContent: string | null; status: string } | null;
}

interface DriftSkin {
  id: string;
  code: string;
  name: string;
  description: string | null;
  rarity: string;
  previewUrl: string | null;
  isActive: boolean;
  _count?: { userSkins: number };
}

export function DriftBottleManagementClient({ initialBottles }: { initialBottles: DriftBottle[] }) {
  const router = useRouter();
  const [bottles, setBottles] = useState(initialBottles);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const refresh = async () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (status !== "all") params.set("status", status);
    const response = await fetch(`/api/admin/drift/bottles?${params.toString()}`);
    if (!response.ok) {
      toast.error("刷新海笺失败");
      return;
    }
    const data = await response.json();
    setBottles(data.bottles);
    router.refresh();
  };

  const updateStatus = async (id: string, nextStatus: string) => {
    const response = await fetch(`/api/admin/drift/bottles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (!response.ok) {
      toast.error("状态更新失败");
      return;
    }
    toast.success("状态已更新");
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索标题、正文或作者"
          className="sm:max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            {bottleStatusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          刷新
        </Button>
      </div>

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>海笺</TableHead>
              <TableHead>作者</TableHead>
              <TableHead>标签</TableHead>
              <TableHead>互动</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bottles.map(bottle => (
              <TableRow key={bottle.id}>
                <TableCell className="max-w-sm">
                  <div className="font-medium">{bottle.title || "未命名海笺"}</div>
                  <div className="line-clamp-2 text-sm text-muted-foreground">
                    {bottle.textContent || bottle.contentType}
                  </div>
                </TableCell>
                <TableCell>{bottle.author.name || bottle.author.email || bottle.author.phone || "匿名用户"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {bottle.tags.map(({ tag }) => (
                      <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  捞起 {bottle._count.discoveries} / 回音 {bottle._count.conversations} / 举报 {bottle._count.reports}
                </TableCell>
                <TableCell>
                  <Select value={bottle.status} onValueChange={(value) => updateStatus(bottle.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bottleStatusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{formatDate(bottle.createdAt)}</TableCell>
              </TableRow>
            ))}
            {bottles.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  暂无海笺
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function DriftTagManagementClient({ initialTags }: { initialTags: DriftTag[] }) {
  const router = useRouter();
  const [tags, setTags] = useState(initialTags);
  const [editing, setEditing] = useState<DriftTag | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", color: "#0077b6", sortOrder: "0", isActive: true });

  const refresh = async () => {
    const response = await fetch("/api/admin/drift/tags");
    if (!response.ok) {
      toast.error("刷新标签失败");
      return;
    }
    const data = await response.json();
    setTags(data.tags);
    router.refresh();
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ code: "", name: "", color: "#0077b6", sortOrder: "0", isActive: true });
    setOpen(true);
  };

  const openEdit = (tag: DriftTag) => {
    setEditing(tag);
    setForm({
      code: tag.code,
      name: tag.name,
      color: tag.color || "#0077b6",
      sortOrder: String(tag.sortOrder),
      isActive: tag.isActive,
    });
    setOpen(true);
  };

  const submit = async () => {
    const response = await fetch(editing ? `/api/admin/drift/tags/${editing.id}` : "/api/admin/drift/tags", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      toast.error(editing ? "更新标签失败" : "创建标签失败");
      return;
    }
    toast.success(editing ? "标签已更新" : "标签已创建");
    setOpen(false);
    refresh();
  };

  const remove = async (tag: DriftTag) => {
    if (!confirm(`确定删除标签「${tag.name}」吗？`)) return;
    const response = await fetch(`/api/admin/drift/tags/${tag.id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("删除标签失败");
      return;
    }
    toast.success("标签已删除");
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          新建标签
        </Button>
      </div>
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标签</TableHead>
              <TableHead>编码</TableHead>
              <TableHead>颜色</TableHead>
              <TableHead>排序</TableHead>
              <TableHead>瓶子数</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map(tag => (
              <TableRow key={tag.id}>
                <TableCell className="font-medium">{tag.name}</TableCell>
                <TableCell>{tag.code}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: tag.color || "#0077b6" }} />
                    {tag.color || "-"}
                  </span>
                </TableCell>
                <TableCell>{tag.sortOrder}</TableCell>
                <TableCell>{tag._count?.bottles || 0}</TableCell>
                <TableCell>
                  <Badge variant={tag.isActive ? "default" : "secondary"}>{tag.isActive ? "启用" : "停用"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(tag)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(tag)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "编辑标签" : "新建标签"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>编码</Label>
              <Input disabled={!!editing} value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>名称</Label>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>颜色</Label>
              <Input value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>排序</Label>
              <Input value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button onClick={submit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function DriftReportManagementClient({ initialReports }: { initialReports: DriftReport[] }) {
  const router = useRouter();
  const [reports, setReports] = useState(initialReports);
  const [status, setStatus] = useState("all");

  const refresh = async () => {
    const response = await fetch(`/api/admin/drift/reports?status=${status}`);
    if (!response.ok) {
      toast.error("刷新举报失败");
      return;
    }
    const data = await response.json();
    setReports(data.reports);
    router.refresh();
  };

  const handleReport = async (id: string, nextStatus: string, blockBottle = false) => {
    const response = await fetch(`/api/admin/drift/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus, blockBottle }),
    });
    if (!response.ok) {
      toast.error("处理举报失败");
      return;
    }
    toast.success("举报状态已更新");
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            {reviewStatusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={refresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          刷新
        </Button>
      </div>

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>举报内容</TableHead>
              <TableHead>原因</TableHead>
              <TableHead>举报人</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>时间</TableHead>
              <TableHead className="text-right">处理</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map(report => (
              <TableRow key={report.id}>
                <TableCell className="max-w-sm">
                  <div className="font-medium">{report.bottle?.title || "未命名海笺"}</div>
                  <div className="line-clamp-2 text-sm text-muted-foreground">
                    {report.description || report.bottle?.textContent || "无补充说明"}
                  </div>
                </TableCell>
                <TableCell>{report.reason}</TableCell>
                <TableCell>{report.reporter.name || report.reporter.email || "未知用户"}</TableCell>
                <TableCell>
                  <Badge variant={report.status === "PENDING" ? "destructive" : "secondary"}>
                    {statusLabel(report.status, reviewStatusOptions)}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(report.createdAt)}</TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button size="sm" variant="outline" onClick={() => handleReport(report.id, "RESOLVED")}>通过</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleReport(report.id, "RESOLVED", true)}>屏蔽</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleReport(report.id, "REJECTED")}>驳回</Button>
                </TableCell>
              </TableRow>
            ))}
            {reports.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  暂无举报
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function DriftSkinManagementClient({ initialSkins }: { initialSkins: DriftSkin[] }) {
  const router = useRouter();
  const [skins, setSkins] = useState(initialSkins);
  const [editing, setEditing] = useState<DriftSkin | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    rarity: "COMMON",
    previewUrl: "",
    isActive: true,
  });

  const refresh = async () => {
    const response = await fetch("/api/admin/drift/skins");
    if (!response.ok) {
      toast.error("刷新瓶身风格失败");
      return;
    }
    const data = await response.json();
    setSkins(data.skins);
    router.refresh();
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ code: "", name: "", description: "", rarity: "COMMON", previewUrl: "", isActive: true });
    setOpen(true);
  };

  const openEdit = (skin: DriftSkin) => {
    setEditing(skin);
    setForm({
      code: skin.code,
      name: skin.name,
      description: skin.description || "",
      rarity: skin.rarity,
      previewUrl: skin.previewUrl || "",
      isActive: skin.isActive,
    });
    setOpen(true);
  };

  const submit = async () => {
    const response = await fetch(editing ? `/api/admin/drift/skins/${editing.id}` : "/api/admin/drift/skins", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      toast.error(editing ? "更新风格失败" : "创建风格失败");
      return;
    }
    toast.success(editing ? "风格已更新" : "风格已创建");
    setOpen(false);
    refresh();
  };

  const remove = async (skin: DriftSkin) => {
    if (!confirm(`确定删除风格「${skin.name}」吗？`)) return;
    const response = await fetch(`/api/admin/drift/skins/${skin.id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("删除风格失败");
      return;
    }
    toast.success("风格已删除");
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          新建风格
        </Button>
      </div>
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>风格</TableHead>
              <TableHead>编码</TableHead>
              <TableHead>稀有度</TableHead>
              <TableHead>持有人</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skins.map(skin => (
              <TableRow key={skin.id}>
                <TableCell>
                  <div className="font-medium">{skin.name}</div>
                  <div className="line-clamp-2 text-sm text-muted-foreground">{skin.description}</div>
                </TableCell>
                <TableCell>{skin.code}</TableCell>
                <TableCell>{statusLabel(skin.rarity, rarityOptions)}</TableCell>
                <TableCell>{skin._count?.userSkins || 0}</TableCell>
                <TableCell>
                  <Badge variant={skin.isActive ? "default" : "secondary"}>{skin.isActive ? "启用" : "停用"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(skin)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(skin)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "编辑风格" : "新建风格"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>编码</Label>
              <Input disabled={!!editing} value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>名称</Label>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>稀有度</Label>
              <Select value={form.rarity} onValueChange={(value) => setForm({ ...form, rarity: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rarityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>描述</Label>
              <Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button onClick={submit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
