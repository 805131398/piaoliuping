import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('开始添加数据库注释...')
  
  const sqlFile = join(process.cwd(), 'prisma', 'add-comments.sql')
  const sql = readFileSync(sqlFile, 'utf-8')
  
  // 分割 SQL 语句（按分号分割，忽略注释行）
  const statements = sql
    .split('\n')
    .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
    .join('\n')
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)
  
  console.log(`共 ${statements.length} 条 SQL 语句`)
  
  for (const statement of statements) {
    try {
      await prisma.$executeRawUnsafe(statement)
    } catch (error) {
      console.error('执行失败:', statement.substring(0, 100))
      console.error(error)
    }
  }
  
  console.log('✅ 注释添加完成！')
}

main()
  .catch((e) => {
    console.error('❌ 添加注释失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
