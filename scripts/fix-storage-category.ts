/**
 * 修复配置分类
 * 将旧的 "storage" 分类迁移到 "aliyun_oss"
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixStorageCategory() {
  console.log('🔧 开始检查配置分类...\n')

  try {
    // 1. 查找旧的 storage 分类
    const storageCategory = await prisma.configCategory.findFirst({
      where: { value: 'storage' },
    })

    if (!storageCategory) {
      console.log('✅ 未找到旧的 "storage" 分类，无需修复。')
    } else {
      console.log(`Found old category: ${storageCategory.label} (id: ${storageCategory.id})`)

      // 2. 查找或创建 aliyun_oss 分类
      let ossCategory = await prisma.configCategory.findFirst({
        where: { value: 'aliyun_oss' },
      })

      if (!ossCategory) {
        console.log('创建新的 "aliyun_oss" 分类...')
        ossCategory = await prisma.configCategory.create({
          data: {
            value: 'aliyun_oss',
            label: '阿里云 OSS',
            description: '阿里云对象存储配置',
            order: 6,
          },
        })
      }

      console.log(`Target category: ${ossCategory.label} (id: ${ossCategory.id})`)

      // 3. 迁移配置项
      const result = await prisma.config.updateMany({
        where: { categoryId: storageCategory.id },
        data: { categoryId: ossCategory.id },
      })

      console.log(`\n✅ 已将 ${result.count} 个配置项从 "storage" 迁移到 "aliyun_oss"`)

      // 4. 删除旧分类
      // 先检查是否还有关联的配置（以防万一）
      const remaining = await prisma.config.count({
        where: { categoryId: storageCategory.id },
      })

      if (remaining === 0) {
        await prisma.configCategory.delete({
          where: { id: storageCategory.id },
        })
        console.log('🗑️ 已删除旧的 "storage" 分类')
      } else {
        console.warn(`⚠️ 仍有 ${remaining} 个配置项关联在旧分类上，跳过删除`)
      }
    }

    // 5. 验证当前的 aliyun_oss 配置
    const currentConfigs = await prisma.config.findMany({
      where: {
        category: { value: 'aliyun_oss' },
      },
    })

    console.log('\n📋 当前 "aliyun_oss" 下的配置项:')
    currentConfigs.forEach(c => {
      console.log(`  - ${c.key}: ${c.value ? (c.isSecret ? '******' : c.value) : '(空)'}`)
    })

  } catch (error) {
    console.error('❌ 修复失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixStorageCategory()
