/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Config` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ConfigCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GameMode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GameRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Menu` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoleMenu` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RolePermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSetting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserStats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Config" DROP CONSTRAINT "Config_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GameRecord" DROP CONSTRAINT "GameRecord_modeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GameRecord" DROP CONSTRAINT "GameRecord_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Menu" DROP CONSTRAINT "Menu_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RoleMenu" DROP CONSTRAINT "RoleMenu_menuId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RoleMenu" DROP CONSTRAINT "RoleMenu_roleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RolePermission" DROP CONSTRAINT "RolePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RolePermission" DROP CONSTRAINT "RolePermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserRole" DROP CONSTRAINT "UserRole_roleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserRole" DROP CONSTRAINT "UserRole_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserSetting" DROP CONSTRAINT "UserSetting_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserStats" DROP CONSTRAINT "UserStats_userId_fkey";

-- DropTable
DROP TABLE "public"."Account";

-- DropTable
DROP TABLE "public"."Config";

-- DropTable
DROP TABLE "public"."ConfigCategory";

-- DropTable
DROP TABLE "public"."GameMode";

-- DropTable
DROP TABLE "public"."GameRecord";

-- DropTable
DROP TABLE "public"."Menu";

-- DropTable
DROP TABLE "public"."Permission";

-- DropTable
DROP TABLE "public"."Role";

-- DropTable
DROP TABLE "public"."RoleMenu";

-- DropTable
DROP TABLE "public"."RolePermission";

-- DropTable
DROP TABLE "public"."Session";

-- DropTable
DROP TABLE "public"."User";

-- DropTable
DROP TABLE "public"."UserRole";

-- DropTable
DROP TABLE "public"."UserSetting";

-- DropTable
DROP TABLE "public"."UserStats";

-- DropTable
DROP TABLE "public"."VerificationToken";

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "phone" TEXT,
    "openid" TEXT,
    "unionid" TEXT,
    "avatarSeed" TEXT,
    "avatarStyle" TEXT,
    "avatarType" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."menus" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "public"."MenuType" NOT NULL DEFAULT 'MENU',
    "icon" TEXT,
    "href" TEXT,
    "parentId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role_menus" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."config_categories" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "config_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "description" TEXT,
    "categoryId" TEXT,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalPops" BIGINT NOT NULL DEFAULT 0,
    "todayPops" INTEGER NOT NULL DEFAULT 0,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "lastPlayedAt" DATE,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."game_modes" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "bgGradient" TEXT,

    CONSTRAINT "game_modes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."game_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modeId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "themeId" TEXT NOT NULL DEFAULT 'default',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "public"."users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_openid_key" ON "public"."users"("openid");

-- CreateIndex
CREATE UNIQUE INDEX "users_unionid_key" ON "public"."users"("unionid");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "public"."accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "public"."sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "public"."verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "public"."verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "menus_parentId_idx" ON "public"."menus"("parentId");

-- CreateIndex
CREATE INDEX "menus_order_idx" ON "public"."menus"("order");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "public"."roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "public"."permissions"("name");

-- CreateIndex
CREATE INDEX "permissions_resource_idx" ON "public"."permissions"("resource");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_action_key" ON "public"."permissions"("resource", "action");

-- CreateIndex
CREATE INDEX "user_roles_userId_idx" ON "public"."user_roles"("userId");

-- CreateIndex
CREATE INDEX "user_roles_roleId_idx" ON "public"."user_roles"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON "public"."user_roles"("userId", "roleId");

-- CreateIndex
CREATE INDEX "role_permissions_roleId_idx" ON "public"."role_permissions"("roleId");

-- CreateIndex
CREATE INDEX "role_permissions_permissionId_idx" ON "public"."role_permissions"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON "public"."role_permissions"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "role_menus_roleId_idx" ON "public"."role_menus"("roleId");

-- CreateIndex
CREATE INDEX "role_menus_menuId_idx" ON "public"."role_menus"("menuId");

-- CreateIndex
CREATE UNIQUE INDEX "role_menus_roleId_menuId_key" ON "public"."role_menus"("roleId", "menuId");

-- CreateIndex
CREATE UNIQUE INDEX "config_categories_value_key" ON "public"."config_categories"("value");

-- CreateIndex
CREATE INDEX "config_categories_order_idx" ON "public"."config_categories"("order");

-- CreateIndex
CREATE UNIQUE INDEX "configs_key_key" ON "public"."configs"("key");

-- CreateIndex
CREATE INDEX "configs_categoryId_idx" ON "public"."configs"("categoryId");

-- CreateIndex
CREATE INDEX "configs_key_idx" ON "public"."configs"("key");

-- CreateIndex
CREATE UNIQUE INDEX "user_stats_userId_key" ON "public"."user_stats"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "game_modes_code_key" ON "public"."game_modes"("code");

-- CreateIndex
CREATE INDEX "game_records_userId_idx" ON "public"."game_records"("userId");

-- CreateIndex
CREATE INDEX "game_records_modeId_idx" ON "public"."game_records"("modeId");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_userId_key" ON "public"."user_settings"("userId");

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."menus" ADD CONSTRAINT "menus_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "public"."permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_menus" ADD CONSTRAINT "role_menus_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_menus" ADD CONSTRAINT "role_menus_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "public"."menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."configs" ADD CONSTRAINT "configs_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."config_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_stats" ADD CONSTRAINT "user_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_records" ADD CONSTRAINT "game_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_records" ADD CONSTRAINT "game_records_modeId_fkey" FOREIGN KEY ("modeId") REFERENCES "public"."game_modes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 添加表和字段注释
COMMENT ON TABLE "users" IS '用户表';
COMMENT ON COLUMN "users"."id" IS '用户ID';
COMMENT ON COLUMN "users"."name" IS '用户名';
COMMENT ON COLUMN "users"."email" IS '邮箱';
COMMENT ON COLUMN "users"."emailVerified" IS '邮箱验证时间';
COMMENT ON COLUMN "users"."image" IS '头像URL';
COMMENT ON COLUMN "users"."phone" IS '手机号';
COMMENT ON COLUMN "users"."openid" IS '微信小程序 openid';
COMMENT ON COLUMN "users"."unionid" IS '微信开放平台 unionid';
COMMENT ON COLUMN "users"."avatarSeed" IS '头像种子';
COMMENT ON COLUMN "users"."avatarStyle" IS '头像风格';
COMMENT ON COLUMN "users"."avatarType" IS '头像类型';
COMMENT ON COLUMN "users"."isActive" IS '是否激活';
COMMENT ON COLUMN "users"."createdAt" IS '创建时间';
COMMENT ON COLUMN "users"."updatedAt" IS '更新时间';

COMMENT ON TABLE "accounts" IS '第三方账号关联表';
COMMENT ON COLUMN "accounts"."id" IS '账号ID';
COMMENT ON COLUMN "accounts"."userId" IS '用户ID';
COMMENT ON COLUMN "accounts"."type" IS '账号类型';
COMMENT ON COLUMN "accounts"."provider" IS '提供商';
COMMENT ON COLUMN "accounts"."providerAccountId" IS '提供商账号ID';
COMMENT ON COLUMN "accounts"."refresh_token" IS '刷新令牌';
COMMENT ON COLUMN "accounts"."access_token" IS '访问令牌';
COMMENT ON COLUMN "accounts"."expires_at" IS '过期时间戳';
COMMENT ON COLUMN "accounts"."token_type" IS '令牌类型';
COMMENT ON COLUMN "accounts"."scope" IS '授权范围';
COMMENT ON COLUMN "accounts"."id_token" IS 'ID令牌';
COMMENT ON COLUMN "accounts"."session_state" IS '会话状态';

COMMENT ON TABLE "sessions" IS '会话表';
COMMENT ON COLUMN "sessions"."id" IS '会话ID';
COMMENT ON COLUMN "sessions"."sessionToken" IS '会话令牌';
COMMENT ON COLUMN "sessions"."userId" IS '用户ID';
COMMENT ON COLUMN "sessions"."expires" IS '过期时间';

COMMENT ON TABLE "verification_tokens" IS '验证令牌表';
COMMENT ON COLUMN "verification_tokens"."identifier" IS '标识符';
COMMENT ON COLUMN "verification_tokens"."token" IS '令牌';
COMMENT ON COLUMN "verification_tokens"."expires" IS '过期时间';

COMMENT ON TABLE "menus" IS '菜单表';
COMMENT ON COLUMN "menus"."id" IS '菜单ID';
COMMENT ON COLUMN "menus"."label" IS '菜单名称';
COMMENT ON COLUMN "menus"."type" IS '菜单类型';
COMMENT ON COLUMN "menus"."icon" IS '图标';
COMMENT ON COLUMN "menus"."href" IS '链接地址';
COMMENT ON COLUMN "menus"."parentId" IS '父级菜单ID';
COMMENT ON COLUMN "menus"."order" IS '排序';
COMMENT ON COLUMN "menus"."visible" IS '是否可见';
COMMENT ON COLUMN "menus"."createdAt" IS '创建时间';
COMMENT ON COLUMN "menus"."updatedAt" IS '更新时间';

COMMENT ON TABLE "roles" IS '角色表';
COMMENT ON COLUMN "roles"."id" IS '角色ID';
COMMENT ON COLUMN "roles"."name" IS '角色名称';
COMMENT ON COLUMN "roles"."description" IS '角色描述';
COMMENT ON COLUMN "roles"."createdAt" IS '创建时间';
COMMENT ON COLUMN "roles"."updatedAt" IS '更新时间';

COMMENT ON TABLE "permissions" IS '权限表';
COMMENT ON COLUMN "permissions"."id" IS '权限ID';
COMMENT ON COLUMN "permissions"."name" IS '权限名称';
COMMENT ON COLUMN "permissions"."description" IS '权限描述';
COMMENT ON COLUMN "permissions"."resource" IS '资源名称';
COMMENT ON COLUMN "permissions"."action" IS '操作类型';
COMMENT ON COLUMN "permissions"."createdAt" IS '创建时间';
COMMENT ON COLUMN "permissions"."updatedAt" IS '更新时间';

COMMENT ON TABLE "user_roles" IS '用户角色关联表';
COMMENT ON COLUMN "user_roles"."id" IS '关联ID';
COMMENT ON COLUMN "user_roles"."userId" IS '用户ID';
COMMENT ON COLUMN "user_roles"."roleId" IS '角色ID';
COMMENT ON COLUMN "user_roles"."createdAt" IS '创建时间';

COMMENT ON TABLE "role_permissions" IS '角色权限关联表';
COMMENT ON COLUMN "role_permissions"."id" IS '关联ID';
COMMENT ON COLUMN "role_permissions"."roleId" IS '角色ID';
COMMENT ON COLUMN "role_permissions"."permissionId" IS '权限ID';
COMMENT ON COLUMN "role_permissions"."createdAt" IS '创建时间';

COMMENT ON TABLE "role_menus" IS '角色菜单关联表';
COMMENT ON COLUMN "role_menus"."id" IS '关联ID';
COMMENT ON COLUMN "role_menus"."roleId" IS '角色ID';
COMMENT ON COLUMN "role_menus"."menuId" IS '菜单ID';
COMMENT ON COLUMN "role_menus"."createdAt" IS '创建时间';

COMMENT ON TABLE "config_categories" IS '配置分类表';
COMMENT ON COLUMN "config_categories"."id" IS '分类ID';
COMMENT ON COLUMN "config_categories"."value" IS '分类标识';
COMMENT ON COLUMN "config_categories"."label" IS '分类显示名称';
COMMENT ON COLUMN "config_categories"."description" IS '分类描述';
COMMENT ON COLUMN "config_categories"."order" IS '排序';
COMMENT ON COLUMN "config_categories"."createdAt" IS '创建时间';
COMMENT ON COLUMN "config_categories"."updatedAt" IS '更新时间';

COMMENT ON TABLE "configs" IS '系统配置参数表';
COMMENT ON COLUMN "configs"."id" IS '配置ID';
COMMENT ON COLUMN "configs"."key" IS '配置键';
COMMENT ON COLUMN "configs"."value" IS '配置值';
COMMENT ON COLUMN "configs"."description" IS '配置描述';
COMMENT ON COLUMN "configs"."categoryId" IS '关联分类ID';
COMMENT ON COLUMN "configs"."isSecret" IS '是否为敏感信息';
COMMENT ON COLUMN "configs"."createdAt" IS '创建时间';
COMMENT ON COLUMN "configs"."updatedAt" IS '更新时间';

COMMENT ON TABLE "user_stats" IS '用户游戏统计表';
COMMENT ON COLUMN "user_stats"."id" IS '统计ID';
COMMENT ON COLUMN "user_stats"."userId" IS '用户ID';
COMMENT ON COLUMN "user_stats"."totalPops" IS '总戳泡数';
COMMENT ON COLUMN "user_stats"."todayPops" IS '今日戳泡数';
COMMENT ON COLUMN "user_stats"."streakDays" IS '连续天数';
COMMENT ON COLUMN "user_stats"."level" IS '等级';
COMMENT ON COLUMN "user_stats"."experience" IS '经验值';
COMMENT ON COLUMN "user_stats"."lastPlayedAt" IS '最后游玩时间';
COMMENT ON COLUMN "user_stats"."updatedAt" IS '更新时间';

COMMENT ON TABLE "game_modes" IS '游戏模式表';
COMMENT ON COLUMN "game_modes"."id" IS '模式ID';
COMMENT ON COLUMN "game_modes"."code" IS '模式代码';
COMMENT ON COLUMN "game_modes"."name" IS '模式名称';
COMMENT ON COLUMN "game_modes"."description" IS '模式描述';
COMMENT ON COLUMN "game_modes"."icon" IS '图标';
COMMENT ON COLUMN "game_modes"."color" IS '主题色';
COMMENT ON COLUMN "game_modes"."bgGradient" IS '背景渐变';

COMMENT ON TABLE "game_records" IS '游戏记录表';
COMMENT ON COLUMN "game_records"."id" IS '记录ID';
COMMENT ON COLUMN "game_records"."userId" IS '用户ID';
COMMENT ON COLUMN "game_records"."modeId" IS '模式ID';
COMMENT ON COLUMN "game_records"."score" IS '分数';
COMMENT ON COLUMN "game_records"."duration" IS '游戏时长（秒）';
COMMENT ON COLUMN "game_records"."playedAt" IS '游玩时间';

COMMENT ON TABLE "user_settings" IS '用户设置表';
COMMENT ON COLUMN "user_settings"."id" IS '设置ID';
COMMENT ON COLUMN "user_settings"."userId" IS '用户ID';
COMMENT ON COLUMN "user_settings"."soundEnabled" IS '是否开启声音';
COMMENT ON COLUMN "user_settings"."themeId" IS '主题ID';
COMMENT ON COLUMN "user_settings"."updatedAt" IS '更新时间';
