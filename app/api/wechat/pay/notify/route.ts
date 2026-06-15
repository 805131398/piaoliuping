import { NextRequest, NextResponse } from "next/server";

/**
 * 微信支付回调预留接口
 *
 * 当前仓库已移除历史业务订单处理逻辑，但保留该路由作为后续项目接入入口。
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  console.warn("[WECHAT_PAY_NOTIFY] Callback received, but no business handler is configured.", {
    headers: Object.fromEntries(req.headers.entries()),
    bodyLength: rawBody.length,
  });

  return NextResponse.json(
    {
      code: "NOT_IMPLEMENTED",
      message: "微信支付底层能力已保留，但当前项目未配置支付回调业务处理逻辑",
    },
    { status: 501 }
  );
}
