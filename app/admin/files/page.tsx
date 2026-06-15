"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Upload,
  MoreVertical,
  Download,
  Trash2,
  FileText,
  Image as ImageIcon,
  Video,
  FileArchive,
  File,
  Eye,
  RefreshCw,
  Folder,
  ChevronLeft,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { uploadToOss } from "@/lib/oss-utils";
import { Progress } from "@/components/ui/progress";

// OSS 文件项接口
interface OssFileItem {
  name: string;
  url: string;
  size: number;
  lastModified: string;
  etag: string;
  type: string;
}

// OSS 文件夹项接口
interface OssFolderItem {
  name: string;
  prefix: string;
}

// 文件类型选项
const fileTypeOptions = [
  { value: "all", label: "全部类型" },
  { value: "image", label: "图片" },
  { value: "video", label: "视频" },
  { value: "document", label: "文档" },
  { value: "archive", label: "压缩包" },
];

// 排序选项
const sortOptions = [
  { value: "date-desc", label: "最新上传" },
  { value: "date-asc", label: "最早上传" },
  { value: "size-desc", label: "文件最大" },
  { value: "size-asc", label: "文件最小" },
  { value: "name", label: "文件名称" },
];

// 时间范围选项
const timeRangeOptions = [
  { value: "all", label: "全部时间" },
  { value: "today", label: "今天" },
  { value: "week", label: "本周" },
  { value: "month", label: "本月" },
  { value: "year", label: "今年" },
];

// 获取时间范围的起始时间
function getTimeRangeStart(range: string): Date | null {
  const now = new Date();
  switch (range) {
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "week":
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 周一为起始
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "year":
      return new Date(now.getFullYear(), 0, 1);
    default:
      return null;
  }
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return ImageIcon;
  if (fileType.startsWith("video/")) return Video;
  if (fileType.includes("pdf") || fileType.includes("document")) return FileText;
  if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("7z")) return FileArchive;
  return File;
}

// 判断是否为图片类型
function isImageType(type: string): boolean {
  return type.startsWith("image/");
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// 从文件路径获取文件名
function getFileName(path: string): string {
  return path.split("/").pop() || path;
}

export default function FilesPage() {
  const [files, setFiles] = useState<OssFileItem[]>([]);
  const [folders, setFolders] = useState<OssFolderItem[]>([]);
  const [currentPrefix, setCurrentPrefix] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [fileType, setFileType] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextMarker, setNextMarker] = useState<string | undefined>();
  const [isTruncated, setIsTruncated] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<OssFileItem | null>(null);
  const [timeRange, setTimeRange] = useState("today");

  // 获取文件列表
  const fetchFiles = useCallback(async (prefix = "", marker?: string, recursive = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (prefix) params.set("prefix", prefix);
      if (marker) params.set("marker", marker);
      if (recursive) {
        // 递归获取所有文件，用于时间范围筛选
        params.set("recursive", "true");
        params.set("maxKeys", "1000"); // 获取更多文件
      } else {
        params.set("maxKeys", "100");
      }

      const res = await fetch(`/api/admin/files?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "获取文件列表失败");
      }

      setFiles(data.files || []);
      setFolders(recursive ? [] : (data.folders || [])); // 递归模式下不显示文件夹
      setNextMarker(data.nextMarker);
      setIsTruncated(data.isTruncated);
    } catch (err) {
      setError((err as Error).message);
      toast.error("获取文件列表失败: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载和时间范围变化时重新加载
  useEffect(() => {
    const recursive = timeRange !== "all";
    fetchFiles(currentPrefix, undefined, recursive);
  }, [currentPrefix, timeRange, fetchFiles]);

  // 刷新
  const handleRefresh = () => {
    const recursive = timeRange !== "all";
    fetchFiles(currentPrefix, undefined, recursive);
  };

  // 进入文件夹
  const handleEnterFolder = (folderPrefix: string) => {
    setCurrentPrefix(folderPrefix);
  };

  // 返回上级
  const handleGoBack = () => {
    const parts = currentPrefix.split("/").filter(Boolean);
    parts.pop();
    const newPrefix = parts.length > 0 ? parts.join("/") + "/" : "";
    setCurrentPrefix(newPrefix);
  };

  // 筛选和排序文件
  const filteredFiles = files
    .filter((file) => {
      // 搜索过滤
      if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // 类型过滤
      if (fileType !== "all") {
        if (fileType === "image" && !file.type.startsWith("image/")) return false;
        if (fileType === "video" && !file.type.startsWith("video/")) return false;
        if (fileType === "document" && !file.type.includes("pdf") && !file.type.includes("document") && !file.type.includes("text")) return false;
        if (fileType === "archive" && !file.type.includes("zip") && !file.type.includes("rar") && !file.type.includes("7z")) return false;
      }
      // 时间范围过滤
      if (timeRange !== "all") {
        const rangeStart = getTimeRangeStart(timeRange);
        if (rangeStart) {
          const fileDate = new Date(file.lastModified);
          if (fileDate < rangeStart) return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        case "date-asc":
          return new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
        case "size-desc":
          return b.size - a.size;
        case "size-asc":
          return a.size - b.size;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  // 删除文件
  const handleDeleteFile = async (objectKey: string) => {
    if (!confirm("确定要删除这个文件吗？删除后无法恢复。")) return;

    try {
      const res = await fetch("/api/admin/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectKey }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "删除失败");
      }

      toast.success("文件已删除");
      fetchFiles(currentPrefix);
    } catch (err) {
      toast.error("删除失败: " + (err as Error).message);
    }
  };

  // 下载文件
  const handleDownload = (file: OssFileItem) => {
    window.open(file.url, "_blank");
  };

  // 上传文件
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const dir = currentPrefix || "uploads/";
      await uploadToOss(file, dir, 100, (percent) => {
        setUploadProgress(percent);
      });

      toast.success("上传成功");
      setIsUploadDialogOpen(false);
      fetchFiles(currentPrefix);
    } catch (err) {
      toast.error("上传失败: " + (err as Error).message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">文件管理</h1>
          <p className="text-muted-foreground">
            管理 OSS 中存储的文件 {currentPrefix && `- ${currentPrefix}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            刷新
          </Button>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                上传文件
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>上传文件</DialogTitle>
                <DialogDescription>
                  上传到: {currentPrefix || "根目录"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isUploading ? (
                          <>
                            <Loader2 className="w-10 h-10 mb-3 text-muted-foreground animate-spin" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              上传中...
                            </p>
                            <Progress value={uploadProgress} className="w-48" />
                            <p className="mt-2 text-xs text-muted-foreground">
                              {uploadProgress}%
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">点击上传</span> 或拖拽文件
                            </p>
                            <p className="text-xs text-muted-foreground">
                              支持图片、文档、视频等格式
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                  disabled={isUploading}
                >
                  取消
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">文件总数</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{files.length}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">图片文件</span>
          </div>
          <div className="mt-2 text-2xl font-bold">
            {files.filter((f) => f.type.startsWith("image/")).length}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">视频文件</span>
          </div>
          <div className="mt-2 text-2xl font-bold">
            {files.filter((f) => f.type.startsWith("video/")).length}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <FileArchive className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">总容量</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{formatFileSize(totalSize)}</div>
        </div>
      </div>

      {/* 路径导航 */}
      {currentPrefix && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleGoBack}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            返回上级
          </Button>
          <span className="text-sm text-muted-foreground">
            当前路径: /{currentPrefix}
          </span>
        </div>
      )}

      {/* 搜索和筛选 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索文件..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={fileType} onValueChange={setFileType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="文件类型" />
          </SelectTrigger>
          <SelectContent>
            {fileTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="时间范围" />
          </SelectTrigger>
          <SelectContent>
            {timeRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="排序方式" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">加载中...</span>
        </div>
      )}

      {/* 错误状态 */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button variant="outline" onClick={handleRefresh}>
            重试
          </Button>
        </div>
      )}

      {/* 文件列表 */}
      {!loading && !error && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>大小</TableHead>
                <TableHead>修改时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* 文件夹列表 - 当选择时间范围筛选时隐藏文件夹 */}
              {timeRange === "all" && folders.map((folder) => (
                <TableRow
                  key={folder.prefix}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleEnterFolder(folder.prefix)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                        <Folder className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div className="font-medium">{getFileName(folder.name.replace(/\/$/, ""))}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">文件夹</Badge>
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEnterFolder(folder.prefix); }}>
                      进入
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {/* 文件列表 */}
              {filteredFiles.map((file) => {
                const FileIcon = getFileIcon(file.type);
                const isImage = isImageType(file.type);
                return (
                  <TableRow key={file.name}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {isImage ? (
                          <div 
                            className="relative h-10 w-10 rounded-md border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setPreviewFile(file)}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={file.url}
                              alt={getFileName(file.name)}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                // 图片加载失败时显示默认图标
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div className="hidden h-full w-full items-center justify-center bg-muted absolute inset-0">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                            <FileIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{getFileName(file.name)}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {file.name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{file.type.split("/")[0]}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatFileSize(file.size)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(file.lastModified).toLocaleDateString("zh-CN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => isImage ? setPreviewFile(file) : window.open(file.url, "_blank")}>
                            <Eye className="mr-2 h-4 w-4" />
                            {isImage ? "预览" : "查看"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(file)}>
                            <Download className="mr-2 h-4 w-4" />
                            下载
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteFile(file.name)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* 空状态 */}
              {(timeRange === "all" ? folders.length === 0 : true) && filteredFiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="text-muted-foreground">
                      {searchQuery 
                        ? "没有找到匹配的文件" 
                        : timeRange !== "all" 
                          ? `没有${timeRangeOptions.find(o => o.value === timeRange)?.label || ''}的文件`
                          : "此目录为空"
                      }
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 分页信息 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {timeRange === "all" && `共 ${folders.length} 个文件夹，`}{filteredFiles.length} 个文件{timeRange !== "all" && `（${timeRangeOptions.find(o => o.value === timeRange)?.label}）`}，总大小 {formatFileSize(filteredFiles.reduce((sum, f) => sum + f.size, 0))}
        </p>
        {isTruncated && nextMarker && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchFiles(currentPrefix, nextMarker)}
          >
            加载更多
          </Button>
        )}
      </div>

      {/* 图片预览弹窗 */}
      {previewFile && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setPreviewFile(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            {/* 关闭按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white hover:bg-white/20"
              onClick={() => setPreviewFile(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            
            {/* 图片 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewFile.url}
              alt={getFileName(previewFile.name)}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* 图片信息 */}
            <div className="absolute -bottom-12 left-0 right-0 text-center text-white text-sm">
              <p>{getFileName(previewFile.name)}</p>
              <p className="text-white/60 text-xs mt-1">
                {formatFileSize(previewFile.size)} · {new Date(previewFile.lastModified).toLocaleDateString("zh-CN")}
              </p>
            </div>

            {/* 操作按钮 */}
            <div className="absolute -bottom-12 right-0 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(previewFile);
                }}
              >
                <Download className="h-4 w-4 mr-1" />
                下载
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
