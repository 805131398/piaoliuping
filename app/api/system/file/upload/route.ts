import { NextRequest, NextResponse } from "next/server";
import { AliyunOssClient } from "@/lib/oss";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ code: 400, msg: "未上传文件" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 生成文件名
    const originalName = file.name || "image.png";
    const ext = originalName.split(".").pop() || "png";
    const fileName = `${crypto.randomUUID()}.${ext}`;
    
    // 按照日期分类
    const now = new Date();
    const dateDir = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
    const objectKey = `uploads/${dateDir}/${fileName}`;

    // 初始化 OSS 客户端并上传
    try {
      const ossClient = await AliyunOssClient.createFromDB();
      const result = await ossClient.upload(objectKey, buffer);

      return NextResponse.json({
        code: 200,
        msg: "上传成功",
        url: result.url,
        fileName,
        originalName
      });
    } catch (error: any) {
      console.error("OSS 上传失败:", error);
      // 如果是配置错误，返回具体信息
      if (error.message.includes("OSS 配置不完整")) {
        return NextResponse.json({ code: 500, msg: "OSS 配置缺失，请联系管理员" }, { status: 500 });
      }
      throw error;
    }
  } catch (error) {
    console.error("文件上传失败:", error);
    return NextResponse.json({ code: 500, msg: "上传失败" }, { status: 500 });
  }
}
