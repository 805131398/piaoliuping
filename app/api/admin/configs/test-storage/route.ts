import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { testStorageConnection } from "@/lib/storage";

// POST /api/admin/configs/test-storage - 测试存储连接
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 测试存储连接
    const result = await testStorageConnection();

    return NextResponse.json({
      success: true,
      message: result.message,
      details: result.details,
    });
  } catch (error: any) {
    console.error("测试存储连接失败:", error);
    return NextResponse.json({ 
      error: error.message || "测试存储连接失败" 
    }, { status: 500 });
  }
}
