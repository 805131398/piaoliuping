import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold">访问受限</CardTitle>
          <CardDescription>
            您没有权限访问此页面
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            此页面仅限管理员访问。如果您认为这是一个错误，请联系系统管理员。
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/">返回首页</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">重新登录</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
