"use client";
import { useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { Button } from "../ui/button";
import { Upload, RotateCcw, RotateCw } from "lucide-react";
import { AvatarData } from "./AvatarDialog";
import { uploadToOss, getOssSignedUrl } from "@/lib/oss-utils";

interface UploadAvatarPanelProps {
  value: AvatarData;
  onChange: (data: Partial<AvatarData>) => void;
}

export default function UploadAvatarPanel({ value, onChange }: UploadAvatarPanelProps) {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // 处理图片选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
      }

      // 检查文件大小 (限制为5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setRotation(0); // 重置旋转角度
      };
      reader.readAsDataURL(file);
    }
  };

  // 裁剪完成回调
  const handleCropComplete = async (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
    if (image) {
      try {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
        onChange({
          avatarUrl: croppedImage,
          fileData: croppedImage // 保留 fileData 用于预览
        });
      } catch (error) {
        console.error('裁剪图片失败:', error);
      }
    }
  };

  // 上传到 OSS
  const handleUploadToOss = async () => {
    if (!image || !croppedAreaPixels) {
      alert('请先选择并裁剪图片');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 将 base64 转换为 File 对象
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
      const file = await base64ToFile(croppedImage, 'avatar.jpg');

      // 使用 oss-utils 上传到 OSS
      const result = await uploadToOss(
          file,
          "uploads/avatars/",
          5, // 最大 5MB
          (progress) => setUploadProgress(progress)
      );

      // 存储原始的 OSS URL，而不是签名 URL
      // 签名 URL 只在显示时动态获取，避免过期问题
      const originalOssUrl = result.url;

      // 更新头像 URL 为原始 OSS URL
      onChange({
        avatarUrl: originalOssUrl,
        fileData: undefined // 清除 fileData，因为已经上传到 OSS
      });

      console.log('头像上传成功，存储原始 URL:', originalOssUrl);
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
      <div className="flex flex-col space-y-4">
        {/* 文件选择 */}
        <div className="w-full">
          <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
          />
          <Button
              variant="outline"
              onClick={() => inputRef.current?.click()}
              className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            选择图片
          </Button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            支持 JPG、PNG、GIF 格式，大小不超过 5MB
          </p>
        </div>

        {/* 裁剪区域 */}
        {image && (
            <div className="w-full">
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    onCropComplete={handleCropComplete}
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2 mt-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRotation(r => r - 90)}
                    className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  左旋转
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRotation(r => r + 90)}
                    className="flex-1"
                >
                  <RotateCw className="w-4 h-4 mr-1" />
                  右旋转
                </Button>
              </div>

              {/* 上传按钮 */}
              <Button
                  onClick={handleUploadToOss}
                  disabled={isUploading}
                  className="w-full mt-3"
              >
                {isUploading ? `上传中... ${uploadProgress}%` : '上传到 OSS'}
              </Button>
            </div>
        )}
      </div>
  );
}

// 工具函数：裁剪图片
async function getCroppedImg(imageSrc: string, crop: any, rotation = 0): Promise<string> {
  const createImage = (url: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = reject;
      });

  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("No 2d context");

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - crop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - crop.y)
  );

  return canvas.toDataURL("image/jpeg");
}

// 工具函数：将 base64 转换为 File 对象
async function base64ToFile(base64: string, filename: string): Promise<File> {
  const response = await fetch(base64);
  const blob = await response.blob();
  return new File([blob], filename, { type: 'image/jpeg' });
} 