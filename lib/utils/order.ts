import { format } from "date-fns";

/**
 * 生成订单号
 * 格式: DATE(YYYYMMDDHHmmss) + RANDOM(6)
 */
export function generateOrderNo(): string {
  const now = new Date();
  const dateStr = format(now, "yyyyMMddHHmmss");
  const randomStr = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return `ORD${dateStr}${randomStr}`;
}

/**
 * 计算新的 VIP 到期时间
 * @param currentExpireAt 当前到期时间
 * @param days 增加天数
 */
export function calculateNewVipExpire(currentExpireAt: Date | null, days: number): Date {
  const now = new Date();
  // 如果当前没有 VIP 或已过期，从现在开始计算
  // 如果当前有 VIP 且未过期，从原到期时间开始计算
  const baseDate = currentExpireAt && currentExpireAt > now ? currentExpireAt : now;
  
  const newExpire = new Date(baseDate);
  newExpire.setDate(newExpire.getDate() + days);
  
  // 设置为当天的 23:59:59
  newExpire.setHours(23, 59, 59, 999);
  
  return newExpire;
}
