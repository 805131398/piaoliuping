import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

// 需要导出的表（按依赖顺序）
const tables = [
  'config_categories',
  'configs',
  'users',
  'accounts',
  'sessions',
  'verification_tokens',
  'permissions',
  'roles',
  'menus',
  'user_roles',
  'role_permissions',
  'role_menus',
]

function escapeValue(value: any): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
  if (typeof value === 'number') return String(value)
  if (value instanceof Date) return `'${value.toISOString()}'`
  if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`
  return `'${String(value).replace(/'/g, "''")}'`
}

function generateInsert(tableName: string, rows: any[]): string {
  if (rows.length === 0) return ''

  const columns = Object.keys(rows[0])
  const lines: string[] = []

  lines.push(`-- Table: ${tableName}`)
  lines.push(`-- Rows: ${rows.length}`)

  for (const row of rows) {
    const values = columns.map(col => escapeValue(row[col]))
    lines.push(`INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});`)
  }

  lines.push('')
  return lines.join('\n')
}

async function exportData() {
  const output: string[] = []

  output.push('-- PostgreSQL Data Export')
  output.push(`-- Generated at: ${new Date().toISOString()}`)
  output.push('-- Tables: ' + tables.join(', '))
  output.push('')
  output.push('-- Create MenuType enum if not exists')
  output.push(`DO $$ BEGIN
    CREATE TYPE "MenuType" AS ENUM ('DIRECTORY', 'MENU');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;`)
  output.push('')

  // 导出表结构（从 new.schema.prisma 生成）
  output.push('-- Run: npx prisma db push --schema=prisma/new.schema.prisma')
  output.push('-- to create tables before importing data')
  output.push('')

  // 禁用外键约束
  output.push('-- Disable foreign key checks')
  output.push('SET session_replication_role = replica;')
  output.push('')

  // 导出数据
  try {
    // config_categories
    const configCategories = await prisma.configCategory.findMany()
    output.push(generateInsert('config_categories', configCategories))

    // configs
    const configs = await prisma.config.findMany()
    output.push(generateInsert('configs', configs))

    // users
    const users = await prisma.user.findMany()
    output.push(generateInsert('users', users))

    // accounts
    const accounts = await prisma.account.findMany()
    output.push(generateInsert('accounts', accounts))

    // sessions
    const sessions = await prisma.session.findMany()
    output.push(generateInsert('sessions', sessions))

    // verification_tokens
    const verificationTokens = await prisma.verificationToken.findMany()
    output.push(generateInsert('verification_tokens', verificationTokens))

    // permissions
    const permissions = await prisma.permission.findMany()
    output.push(generateInsert('permissions', permissions))

    // roles
    const roles = await prisma.role.findMany()
    output.push(generateInsert('roles', roles))

    // menus (按层级排序：先插入父级，再插入子级)
    const menus = await prisma.menu.findMany()
    // 先插入没有 parentId 的（顶级菜单）
    const topMenus = menus.filter(m => !m.parentId)
    // 再插入有 parentId 的（子菜单）
    const childMenus = menus.filter(m => m.parentId)
    output.push(generateInsert('menus', [...topMenus, ...childMenus]))

    // user_roles
    const userRoles = await prisma.userRole.findMany()
    output.push(generateInsert('user_roles', userRoles))

    // role_permissions
    const rolePermissions = await prisma.rolePermission.findMany()
    output.push(generateInsert('role_permissions', rolePermissions))

    // role_menus
    const roleMenus = await prisma.roleMenu.findMany()
    output.push(generateInsert('role_menus', roleMenus))

  } catch (error) {
    console.error('Export error:', error)
    throw error
  }

  // 重新启用外键约束
  output.push('-- Re-enable foreign key checks')
  output.push('SET session_replication_role = DEFAULT;')
  output.push('')

  // 写入文件
  const sql = output.join('\n')
  fs.writeFileSync('prisma/export.sql', sql)
  console.log('Data exported to prisma/export.sql')
  console.log(`Total size: ${(sql.length / 1024).toFixed(2)} KB`)
}

exportData()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
