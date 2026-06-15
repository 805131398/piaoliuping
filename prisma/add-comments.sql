-- 为表和字段添加中文注释
-- 注意：这个脚本不会改变表名，只添加注释

-- User 表
COMMENT ON TABLE "User" IS '用户表';
COMMENT ON COLUMN "User"."id" IS '用户ID';
COMMENT ON COLUMN "User"."name" IS '用户名';
COMMENT ON COLUMN "User"."email" IS '邮箱';
COMMENT ON COLUMN "User"."emailVerified" IS '邮箱验证时间';
COMMENT ON COLUMN "User"."image" IS '头像URL';
COMMENT ON COLUMN "User"."phone" IS '手机号';
COMMENT ON COLUMN "User"."openid" IS '微信小程序 openid';
COMMENT ON COLUMN "User"."unionid" IS '微信开放平台 unionid';
COMMENT ON COLUMN "User"."avatarSeed" IS '头像种子';
COMMENT ON COLUMN "User"."avatarStyle" IS '头像风格';
COMMENT ON COLUMN "User"."avatarType" IS '头像类型';
COMMENT ON COLUMN "User"."isActive" IS '是否激活';
COMMENT ON COLUMN "User"."createdAt" IS '创建时间';
COMMENT ON COLUMN "User"."updatedAt" IS '更新时间';

-- Account 表
COMMENT ON TABLE "Account" IS '第三方账号关联表';
COMMENT ON COLUMN "Account"."id" IS '账号ID';
COMMENT ON COLUMN "Account"."userId" IS '用户ID';
COMMENT ON COLUMN "Account"."type" IS '账号类型';
COMMENT ON COLUMN "Account"."provider" IS '提供商';
COMMENT ON COLUMN "Account"."providerAccountId" IS '提供商账号ID';
COMMENT ON COLUMN "Account"."refresh_token" IS '刷新令牌';
COMMENT ON COLUMN "Account"."access_token" IS '访问令牌';
COMMENT ON COLUMN "Account"."expires_at" IS '过期时间戳';
COMMENT ON COLUMN "Account"."token_type" IS '令牌类型';
COMMENT ON COLUMN "Account"."scope" IS '授权范围';
COMMENT ON COLUMN "Account"."id_token" IS 'ID令牌';
COMMENT ON COLUMN "Account"."session_state" IS '会话状态';

-- Session 表
COMMENT ON TABLE "Session" IS '会话表';
COMMENT ON COLUMN "Session"."id" IS '会话ID';
COMMENT ON COLUMN "Session"."sessionToken" IS '会话令牌';
COMMENT ON COLUMN "Session"."userId" IS '用户ID';
COMMENT ON COLUMN "Session"."expires" IS '过期时间';

-- VerificationToken 表
COMMENT ON TABLE "VerificationToken" IS '验证令牌表';
COMMENT ON COLUMN "VerificationToken"."identifier" IS '标识符';
COMMENT ON COLUMN "VerificationToken"."token" IS '令牌';
COMMENT ON COLUMN "VerificationToken"."expires" IS '过期时间';

-- Menu 表
COMMENT ON TABLE "Menu" IS '菜单表';
COMMENT ON COLUMN "Menu"."id" IS '菜单ID';
COMMENT ON COLUMN "Menu"."label" IS '菜单名称';
COMMENT ON COLUMN "Menu"."type" IS '菜单类型';
COMMENT ON COLUMN "Menu"."icon" IS '图标';
COMMENT ON COLUMN "Menu"."href" IS '链接地址';
COMMENT ON COLUMN "Menu"."parentId" IS '父级菜单ID';
COMMENT ON COLUMN "Menu"."order" IS '排序';
COMMENT ON COLUMN "Menu"."visible" IS '是否可见';
COMMENT ON COLUMN "Menu"."createdAt" IS '创建时间';
COMMENT ON COLUMN "Menu"."updatedAt" IS '更新时间';

-- Role 表
COMMENT ON TABLE "Role" IS '角色表';
COMMENT ON COLUMN "Role"."id" IS '角色ID';
COMMENT ON COLUMN "Role"."name" IS '角色名称';
COMMENT ON COLUMN "Role"."description" IS '角色描述';
COMMENT ON COLUMN "Role"."createdAt" IS '创建时间';
COMMENT ON COLUMN "Role"."updatedAt" IS '更新时间';

-- Permission 表
COMMENT ON TABLE "Permission" IS '权限表';
COMMENT ON COLUMN "Permission"."id" IS '权限ID';
COMMENT ON COLUMN "Permission"."name" IS '权限名称';
COMMENT ON COLUMN "Permission"."description" IS '权限描述';
COMMENT ON COLUMN "Permission"."resource" IS '资源名称，如：user, role, menu';
COMMENT ON COLUMN "Permission"."action" IS '操作类型，如：create, read, update, delete';
COMMENT ON COLUMN "Permission"."createdAt" IS '创建时间';
COMMENT ON COLUMN "Permission"."updatedAt" IS '更新时间';

-- UserRole 表
COMMENT ON TABLE "UserRole" IS '用户角色关联表';
COMMENT ON COLUMN "UserRole"."id" IS '关联ID';
COMMENT ON COLUMN "UserRole"."userId" IS '用户ID';
COMMENT ON COLUMN "UserRole"."roleId" IS '角色ID';
COMMENT ON COLUMN "UserRole"."createdAt" IS '创建时间';

-- RolePermission 表
COMMENT ON TABLE "RolePermission" IS '角色权限关联表';
COMMENT ON COLUMN "RolePermission"."id" IS '关联ID';
COMMENT ON COLUMN "RolePermission"."roleId" IS '角色ID';
COMMENT ON COLUMN "RolePermission"."permissionId" IS '权限ID';
COMMENT ON COLUMN "RolePermission"."createdAt" IS '创建时间';

-- RoleMenu 表
COMMENT ON TABLE "RoleMenu" IS '角色菜单关联表';
COMMENT ON COLUMN "RoleMenu"."id" IS '关联ID';
COMMENT ON COLUMN "RoleMenu"."roleId" IS '角色ID';
COMMENT ON COLUMN "RoleMenu"."menuId" IS '菜单ID';
COMMENT ON COLUMN "RoleMenu"."createdAt" IS '创建时间';

-- ConfigCategory 表
COMMENT ON TABLE "ConfigCategory" IS '配置分类表';
COMMENT ON COLUMN "ConfigCategory"."id" IS '分类ID';
COMMENT ON COLUMN "ConfigCategory"."value" IS '分类标识，如 auth, email, storage';
COMMENT ON COLUMN "ConfigCategory"."label" IS '分类显示名称，如 "认证配置"';
COMMENT ON COLUMN "ConfigCategory"."description" IS '分类描述';
COMMENT ON COLUMN "ConfigCategory"."order" IS '排序';
COMMENT ON COLUMN "ConfigCategory"."createdAt" IS '创建时间';
COMMENT ON COLUMN "ConfigCategory"."updatedAt" IS '更新时间';

-- Config 表
COMMENT ON TABLE "Config" IS '系统配置参数表';
COMMENT ON COLUMN "Config"."id" IS '配置ID';
COMMENT ON COLUMN "Config"."key" IS '配置键';
COMMENT ON COLUMN "Config"."value" IS '配置值';
COMMENT ON COLUMN "Config"."description" IS '配置描述';
COMMENT ON COLUMN "Config"."categoryId" IS '关联分类ID';
COMMENT ON COLUMN "Config"."isSecret" IS '是否为敏感信息';
COMMENT ON COLUMN "Config"."createdAt" IS '创建时间';
COMMENT ON COLUMN "Config"."updatedAt" IS '更新时间';

-- UserStats 表
COMMENT ON TABLE "UserStats" IS '用户游戏统计表';
COMMENT ON COLUMN "UserStats"."id" IS '统计ID';
COMMENT ON COLUMN "UserStats"."userId" IS '用户ID';
COMMENT ON COLUMN "UserStats"."totalPops" IS '总戳泡数';
COMMENT ON COLUMN "UserStats"."todayPops" IS '今日戳泡数';
COMMENT ON COLUMN "UserStats"."streakDays" IS '连续天数';
COMMENT ON COLUMN "UserStats"."level" IS '等级';
COMMENT ON COLUMN "UserStats"."experience" IS '经验值';
COMMENT ON COLUMN "UserStats"."lastPlayedAt" IS '最后游玩时间';
COMMENT ON COLUMN "UserStats"."updatedAt" IS '更新时间';

-- GameMode 表
COMMENT ON TABLE "GameMode" IS '游戏模式表';
COMMENT ON COLUMN "GameMode"."id" IS '模式ID';
COMMENT ON COLUMN "GameMode"."code" IS '模式代码，如：classic, endless, zen, challenge';
COMMENT ON COLUMN "GameMode"."name" IS '模式名称';
COMMENT ON COLUMN "GameMode"."description" IS '模式描述';
COMMENT ON COLUMN "GameMode"."icon" IS '图标（emoji 或图片 URL）';
COMMENT ON COLUMN "GameMode"."color" IS '主题色（十六进制）';
COMMENT ON COLUMN "GameMode"."bgGradient" IS '背景渐变（CSS 渐变字符串）';

-- GameRecord 表
COMMENT ON TABLE "GameRecord" IS '游戏记录表';
COMMENT ON COLUMN "GameRecord"."id" IS '记录ID';
COMMENT ON COLUMN "GameRecord"."userId" IS '用户ID';
COMMENT ON COLUMN "GameRecord"."modeId" IS '模式ID';
COMMENT ON COLUMN "GameRecord"."score" IS '分数';
COMMENT ON COLUMN "GameRecord"."duration" IS '游戏时长（秒）';
COMMENT ON COLUMN "GameRecord"."playedAt" IS '游玩时间';

-- UserSetting 表
COMMENT ON TABLE "UserSetting" IS '用户设置表';
COMMENT ON COLUMN "UserSetting"."id" IS '设置ID';
COMMENT ON COLUMN "UserSetting"."userId" IS '用户ID';
COMMENT ON COLUMN "UserSetting"."soundEnabled" IS '是否开启声音';
COMMENT ON COLUMN "UserSetting"."themeId" IS '主题ID';
COMMENT ON COLUMN "UserSetting"."updatedAt" IS '更新时间';
