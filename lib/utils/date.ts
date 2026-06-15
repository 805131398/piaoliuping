/**
 * 日期工具函数
 */

/**
 * 格式化日期为本地日期字符串
 * @param date - Date对象或日期字符串
 * @param locale - 语言地区，默认 zh-CN
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: Date | string | null | undefined,
  locale: string = "zh-CN"
): string {
  if (!date) return "-";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale);
  } catch (error) {
    console.error("日期格式化失败:", error);
    return "-";
  }
}

/**
 * 格式化日期时间为本地日期时间字符串
 * @param date - Date对象或日期字符串
 * @param locale - 语言地区，默认 zh-CN
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(
  date: Date | string | null | undefined,
  locale: string = "zh-CN"
): string {
  if (!date) return "-";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleString(locale);
  } catch (error) {
    console.error("日期时间格式化失败:", error);
    return "-";
  }
}

/**
 * 格式化为相对时间（如：3天前）
 * @param date - Date对象或日期字符串
 * @returns 相对时间字符串
 */
export function formatRelativeTime(
  date: Date | string | null | undefined
): string {
  if (!date) return "-";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 60) return "刚刚";
    if (diffMin < 60) return `${diffMin}分钟前`;
    if (diffHour < 24) return `${diffHour}小时前`;
    if (diffDay < 30) return `${diffDay}天前`;
    if (diffMonth < 12) return `${diffMonth}个月前`;
    return `${diffYear}年前`;
  } catch (error) {
    console.error("相对时间格式化失败:", error);
    return "-";
  }
}

/**
 * 格式化为 YYYY-MM-DD 格式
 * @param date - Date对象或日期字符串
 * @returns YYYY-MM-DD 格式的字符串
 */
export function formatDateYMD(
  date: Date | string | null | undefined
): string {
  if (!date) return "-";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("日期格式化失败:", error);
    return "-";
  }
}

/**
 * 格式化为 YYYY-MM-DD HH:mm:ss 格式
 * @param date - Date对象或日期字符串
 * @returns YYYY-MM-DD HH:mm:ss 格式的字符串
 */
export function formatDateTimeYMDHMS(
  date: Date | string | null | undefined
): string {
  if (!date) return "-";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const seconds = String(dateObj.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error("日期时间格式化失败:", error);
    return "-";
  }
}
