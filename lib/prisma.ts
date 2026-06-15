import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'info',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ],
  });

// @ts-expect-error Prisma 的类型定义没有暴露 "query" 事件类型，这里用 any 并加 try/catch 防止格式化异常
prisma.$on('query', (e: { query: string; params: string; duration: number }) => {
  console.log('Query: ' + e.query);
  console.log('Params: ' + e.params);
  console.log('Duration: ' + e.duration + 'ms');
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

/**
 * 将 Prisma 日志格式化为可直接执行的 SQL
 * 支持传入 Prisma query 事件对象或原始日志字符串
 */
export function formatPrismaLogToSQL(
  logOrEvent: string | { query: string; params: string },
): string | null {
  let sql: string;
  let params: unknown[];

  if (typeof logOrEvent === 'string') {
    const queryMatch = logOrEvent.match(/Query:\s*(.+)/);
    const paramsMatch = logOrEvent.match(/Params:\s*(\[[\s\S]*?\])/);
    if (!queryMatch || !paramsMatch) return null;
    sql = queryMatch[1].trim();
    try {
      params = JSON.parse(paramsMatch[1]);
    } catch {
      return null;
    }
  } else {
    sql = logOrEvent.query.trim();
    try {
      params = JSON.parse(logOrEvent.params);
    } catch {
      return null;
    }
  }

  params.forEach((param, idx) => {
    let value: string;
    if (param === null) {
      value = 'NULL';
    } else if (typeof param === 'string') {
      value = `'${param.replace(/'/g, "''")}'`;
    } else if (typeof param === 'number' || typeof param === 'boolean') {
      value = String(param);
    } else {
      value = `'${JSON.stringify(param)}'`;
    }
    sql = sql.replace(new RegExp(`\\$${idx + 1}\\b`, 'g'), value);
  });

  return sql;
}
