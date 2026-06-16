import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SYSTEM_MENUS = [
  {
    id: 'menu-dashboard',
    label: '仪表盘',
    type: 'MENU' as const,
    icon: 'LayoutDashboard',
    href: '/admin',
    parentId: null,
    order: 10,
    visible: true,
  },
  {
    id: 'menu-system',
    label: '系统管理',
    type: 'DIRECTORY' as const,
    icon: 'Settings',
    href: null,
    parentId: null,
    order: 20,
    visible: true,
  },
  {
    id: 'menu-drift',
    label: '漂流瓶',
    type: 'DIRECTORY' as const,
    icon: 'Waves',
    href: null,
    parentId: null,
    order: 15,
    visible: true,
  },
  {
    id: 'menu-drift-bottles',
    label: '海笺管理',
    type: 'MENU' as const,
    icon: 'MessageSquareText',
    href: '/admin/drift/bottles',
    parentId: 'menu-drift',
    order: 10,
    visible: true,
  },
  {
    id: 'menu-drift-tags',
    label: '标签管理',
    type: 'MENU' as const,
    icon: 'Tags',
    href: '/admin/drift/tags',
    parentId: 'menu-drift',
    order: 20,
    visible: true,
  },
  {
    id: 'menu-drift-reports',
    label: '举报审核',
    type: 'MENU' as const,
    icon: 'Flag',
    href: '/admin/drift/reports',
    parentId: 'menu-drift',
    order: 30,
    visible: true,
  },
  {
    id: 'menu-drift-skins',
    label: '瓶身风格',
    type: 'MENU' as const,
    icon: 'Palette',
    href: '/admin/drift/skins',
    parentId: 'menu-drift',
    order: 40,
    visible: true,
  },
  {
    id: 'menu-user',
    label: '用户管理',
    type: 'MENU' as const,
    icon: 'Users',
    href: '/admin/users',
    parentId: 'menu-system',
    order: 10,
    visible: true,
  },
  {
    id: 'menu-role',
    label: '角色管理',
    type: 'MENU' as const,
    icon: 'Shield',
    href: '/admin/roles',
    parentId: 'menu-system',
    order: 20,
    visible: true,
  },
  {
    id: 'menu-menu',
    label: '菜单管理',
    type: 'MENU' as const,
    icon: 'Menu',
    href: '/admin/menus',
    parentId: 'menu-system',
    order: 30,
    visible: true,
  },
  {
    id: 'menu-file',
    label: '文件管理',
    type: 'MENU' as const,
    icon: 'FileText',
    href: '/admin/files',
    parentId: 'menu-system',
    order: 40,
    visible: true,
  },
  {
    id: 'menu-config',
    label: '配置管理',
    type: 'MENU' as const,
    icon: 'Settings2',
    href: '/admin/configs',
    parentId: 'menu-system',
    order: 50,
    visible: true,
  },
  {
    id: 'menu-config-categories',
    label: '配置分类',
    type: 'MENU' as const,
    icon: 'FolderTree',
    href: '/admin/config-categories',
    parentId: 'menu-system',
    order: 70,
    visible: true,
  },
]

const CONFIG_CATEGORIES = [
  { value: 'auth', label: '认证配置', description: '登录、鉴权与站点地址配置', order: 10 },
  { value: 'email', label: '邮件配置', description: 'SMTP 邮件发送配置', order: 20 },
  { value: 'storage', label: '存储配置', description: 'OSS 与文件上传配置', order: 30 },
  { value: 'sms', label: '短信配置', description: '短信服务配置', order: 40 },
  { value: 'api', label: '接口配置', description: '公开 API 地址和基础参数', order: 50 },
  { value: 'drift', label: '漂流瓶配置', description: '漂流瓶额度、推荐与内容治理配置', order: 60 },
]

const CONFIG_KEYS = [
  { key: 'auth.secret', value: process.env.AUTH_SECRET || '', description: 'NextAuth/Auth.js 密钥', category: 'auth', isSecret: true },
  { key: 'auth.url', value: process.env.AUTH_URL || 'http://localhost:3000', description: '应用访问地址', category: 'auth', isSecret: false },
  { key: 'auth.trust_host', value: process.env.AUTH_TRUST_HOST || 'true', description: '是否信任 Host 请求头', category: 'auth', isSecret: false },
  { key: 'login.style', value: 'email,phone,credentials', description: '登录方式配置，支持邮箱验证码、手机号验证码、账号密码登录', category: 'auth', isSecret: false },
  { key: 'email.smtp_host', value: process.env.SMTP_HOST || '', description: 'SMTP 主机地址', category: 'email', isSecret: false },
  { key: 'email.smtp_port', value: process.env.SMTP_PORT || '587', description: 'SMTP 端口', category: 'email', isSecret: false },
  { key: 'email.smtp_user', value: process.env.SMTP_USER || '', description: 'SMTP 用户名', category: 'email', isSecret: false },
  { key: 'email.smtp_pass', value: process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '', description: 'SMTP 密码', category: 'email', isSecret: true },
  { key: 'aliyun.oss.region', value: process.env.OSS_REGION || '', description: 'OSS 地域', category: 'storage', isSecret: false },
  { key: 'aliyun.oss.bucket', value: process.env.OSS_BUCKET || '', description: 'OSS Bucket', category: 'storage', isSecret: false },
  { key: 'aliyun.oss.access_key_id', value: process.env.OSS_ACCESS_KEY_ID || '', description: 'OSS Access Key ID', category: 'storage', isSecret: true },
  { key: 'aliyun.oss.access_key_secret', value: process.env.OSS_ACCESS_KEY_SECRET || '', description: 'OSS Access Key Secret', category: 'storage', isSecret: true },
  { key: 'aliyun.oss.host', value: process.env.OSS_HOST || '', description: 'OSS 访问域名', category: 'storage', isSecret: false },
  { key: 'aliyun.sms.access_key_id', value: process.env.ALIYUN_SMS_ACCESS_KEY_ID || '', description: '短信 Access Key ID', category: 'sms', isSecret: true },
  { key: 'aliyun.sms.access_key_secret', value: process.env.ALIYUN_SMS_ACCESS_KEY_SECRET || '', description: '短信 Access Key Secret', category: 'sms', isSecret: true },
  { key: 'aliyun.sms.sign_name', value: process.env.ALIYUN_SMS_SIGN_NAME || '', description: '短信签名', category: 'sms', isSecret: false },
  { key: 'NEXT_PUBLIC_API_URL', value: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', description: '公开 API 基础地址', category: 'api', isSecret: false },
  { key: 'API_RATE_LIMIT', value: process.env.API_RATE_LIMIT || '100', description: '每分钟接口请求上限', category: 'api', isSecret: false },
  { key: 'drift.daily_discover_limit', value: '5', description: '每日默认打捞次数', category: 'drift', isSecret: false },
  { key: 'drift.daily_throw_limit', value: '3', description: '每日默认投递次数', category: 'drift', isSecret: false },
  { key: 'drift.auto_filter_sensitive', value: 'true', description: '是否默认开启敏感内容过滤', category: 'drift', isSecret: false },
]

const PERMISSIONS = [
  { name: '创建用户', resource: 'user', action: 'create' },
  { name: '查看用户', resource: 'user', action: 'read' },
  { name: '更新用户', resource: 'user', action: 'update' },
  { name: '删除用户', resource: 'user', action: 'delete' },
  { name: '创建角色', resource: 'role', action: 'create' },
  { name: '查看角色', resource: 'role', action: 'read' },
  { name: '更新角色', resource: 'role', action: 'update' },
  { name: '删除角色', resource: 'role', action: 'delete' },
  { name: '创建菜单', resource: 'menu', action: 'create' },
  { name: '查看菜单', resource: 'menu', action: 'read' },
  { name: '更新菜单', resource: 'menu', action: 'update' },
  { name: '删除菜单', resource: 'menu', action: 'delete' },
  { name: '创建配置', resource: 'config', action: 'create' },
  { name: '查看配置', resource: 'config', action: 'read' },
  { name: '更新配置', resource: 'config', action: 'update' },
  { name: '删除配置', resource: 'config', action: 'delete' },
  { name: '上传文件', resource: 'file', action: 'create' },
  { name: '查看文件', resource: 'file', action: 'read' },
  { name: '更新文件', resource: 'file', action: 'update' },
  { name: '删除文件', resource: 'file', action: 'delete' },
  { name: '创建漂流瓶', resource: 'drift_bottle', action: 'create' },
  { name: '查看漂流瓶', resource: 'drift_bottle', action: 'read' },
  { name: '更新漂流瓶', resource: 'drift_bottle', action: 'update' },
  { name: '删除漂流瓶', resource: 'drift_bottle', action: 'delete' },
  { name: '创建漂流瓶标签', resource: 'drift_tag', action: 'create' },
  { name: '查看漂流瓶标签', resource: 'drift_tag', action: 'read' },
  { name: '更新漂流瓶标签', resource: 'drift_tag', action: 'update' },
  { name: '删除漂流瓶标签', resource: 'drift_tag', action: 'delete' },
  { name: '查看漂流瓶举报', resource: 'drift_report', action: 'read' },
  { name: '处理漂流瓶举报', resource: 'drift_report', action: 'update' },
  { name: '创建瓶身风格', resource: 'drift_skin', action: 'create' },
  { name: '查看瓶身风格', resource: 'drift_skin', action: 'read' },
  { name: '更新瓶身风格', resource: 'drift_skin', action: 'update' },
  { name: '删除瓶身风格', resource: 'drift_skin', action: 'delete' },
]

const DRIFT_TAGS = [
  { code: 'random', name: '随机', color: '#0077b6', sortOrder: 10, isActive: true },
  { code: 'music', name: '音乐', color: '#f4a261', sortOrder: 20, isActive: true },
  { code: 'tree-hole', name: '树洞', color: '#5d594e', sortOrder: 30, isActive: true },
  { code: 'dreams', name: '梦境', color: '#94ccff', sortOrder: 40, isActive: true },
  { code: 'reflection', name: '回想', color: '#767166', sortOrder: 50, isActive: true },
]

const DRIFT_SKINS = [
  {
    code: 'ocean-whisper',
    name: '海洋耳语',
    description: '透亮的玻璃瓶，内嵌陈旧的羊皮纸，瓶口由天蓝色火漆密封。',
    rarity: 'RARE' as const,
    previewUrl: null,
    themeTokens: {
      primary: '#0077b6',
      accent: '#94ccff',
      texture: 'glass',
    },
    isActive: true,
  },
  {
    code: 'sunset-cork',
    name: '落日晚笺',
    description: '温暖橙光包裹的软木瓶塞，适合寄出温柔的黄昏心事。',
    rarity: 'COMMON' as const,
    previewUrl: null,
    themeTokens: {
      primary: '#f4a261',
      accent: '#ffdcc4',
      texture: 'cork',
    },
    isActive: true,
  },
  {
    code: 'mist-shell',
    name: '海沫贝光',
    description: '带有浅贝壳光泽的半透明瓶身，适合收藏安静的回音。',
    rarity: 'EPIC' as const,
    previewUrl: null,
    themeTokens: {
      primary: '#5d594e',
      accent: '#e9e2d4',
      texture: 'shell',
    },
    isActive: true,
  },
]

const LEGACY_MENU_PREFIXES = [
  '/admin/clocking',
  '/admin/game',
]

const LEGACY_MENU_KEYWORDS = [
  '打卡',
  '题库',
  '答题',
  '排行',
  '奖金',
  '优惠券',
  '订单',
  '会员',
  'VIP',
  '游戏',
  '主题',
  '音效',
  '轮播',
  '广告',
]

const OBSOLETE_MENU_IDS = ['menu-configs']

function isLegacyBusinessMenu(menu: { href: string | null; label: string }) {
  return (
    LEGACY_MENU_PREFIXES.some(prefix => menu.href?.startsWith(prefix) === true)
    || LEGACY_MENU_KEYWORDS.some(keyword => menu.label.includes(keyword))
  )
}

async function seedRolesAndPermissions() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: { description: '系统管理员' },
    create: { name: 'admin', description: '系统管理员' },
  })

  await prisma.role.upsert({
    where: { name: 'user' },
    update: { description: '普通用户' },
    create: { name: 'user', description: '普通用户' },
  })

  await prisma.role.upsert({
    where: { name: 'guest' },
    update: { description: '访客' },
    create: { name: 'guest', description: '访客' },
  })

  const createdPermissions = await Promise.all(
    PERMISSIONS.map(permission =>
      prisma.permission.upsert({
        where: {
          resource_action: {
            resource: permission.resource,
            action: permission.action,
          },
        },
        update: {
          name: permission.name,
        },
        create: permission,
      }),
    ),
  )

  await Promise.all(
    createdPermissions.map(permission =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      }),
    ),
  )
}

async function cleanupLegacyMenus() {
  const legacyMenus = await prisma.menu.findMany()
  const legacyIds = legacyMenus.filter(isLegacyBusinessMenu).map(menu => menu.id)

  if (legacyIds.length > 0) {
    await prisma.menu.deleteMany({
      where: {
        id: { in: legacyIds },
      },
    })
  }
}

async function cleanupObsoleteMenus() {
  await prisma.menu.deleteMany({
    where: {
      id: { in: OBSOLETE_MENU_IDS },
    },
  })
}

async function seedMenus() {
  for (const menu of SYSTEM_MENUS) {
    await prisma.menu.upsert({
      where: { id: menu.id },
      update: {
        label: menu.label,
        type: menu.type,
        icon: menu.icon,
        href: menu.href,
        parentId: menu.parentId,
        order: menu.order,
        visible: menu.visible,
      },
      create: menu,
    })
  }

  const adminRole = await prisma.role.findUnique({
    where: { name: 'admin' },
  })

  if (!adminRole) {
    throw new Error('admin 角色不存在，无法分配菜单')
  }

  await Promise.all(
    SYSTEM_MENUS.map(menu =>
      prisma.roleMenu.upsert({
        where: {
          roleId_menuId: {
            roleId: adminRole.id,
            menuId: menu.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          menuId: menu.id,
        },
      }),
    ),
  )
}

async function seedConfigCategoriesAndConfigs() {
  const categoryMap = new Map<string, string>()

  for (const category of CONFIG_CATEGORIES) {
    const created = await prisma.configCategory.upsert({
      where: { value: category.value },
      update: {
        label: category.label,
        description: category.description,
        order: category.order,
      },
      create: category,
    })
    categoryMap.set(category.value, created.id)
  }

  for (const config of CONFIG_KEYS) {
    await prisma.config.upsert({
      where: { key: config.key },
      update: {
        value: config.value,
        description: config.description,
        categoryId: categoryMap.get(config.category) || null,
        isSecret: config.isSecret,
      },
      create: {
        key: config.key,
        value: config.value,
        description: config.description,
        categoryId: categoryMap.get(config.category) || null,
        isSecret: config.isSecret,
      },
    })
  }
}

async function seedDriftDictionaries() {
  for (const tag of DRIFT_TAGS) {
    await prisma.driftTag.upsert({
      where: { code: tag.code },
      update: {
        name: tag.name,
        color: tag.color,
        sortOrder: tag.sortOrder,
        isActive: tag.isActive,
      },
      create: tag,
    })
  }

  for (const skin of DRIFT_SKINS) {
    await prisma.driftBottleSkin.upsert({
      where: { code: skin.code },
      update: {
        name: skin.name,
        description: skin.description,
        rarity: skin.rarity,
        previewUrl: skin.previewUrl,
        themeTokens: skin.themeTokens,
        isActive: skin.isActive,
      },
      create: skin,
    })
  }
}

async function main() {
  console.log('开始初始化基础系统数据...')

  await seedRolesAndPermissions()
  await cleanupLegacyMenus()
  await cleanupObsoleteMenus()
  await seedMenus()
  await seedConfigCategoriesAndConfigs()
  await seedDriftDictionaries()

  console.log('✅ 基础系统数据初始化完成')
}

main()
  .catch((error) => {
    console.error('❌ Seed 失败:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
