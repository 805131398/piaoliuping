import NextAuth, { NextAuthConfig, Session } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// 定义回调函数的类型
interface SessionCallbackParams {
  session: Session;
  token: {
    id?: string;
    username?: string;
    email?: string;
    phone?: string;
    name?: string;
    image?: string;
    avatarType?: string;
    avatarStyle?: string;
    avatarSeed?: string;
    roles?: string[];
  };
}

interface JWTCallbackParams {
  token: {
    id?: string;
    username?: string;
    email?: string;
    phone?: string;
    name?: string;
    image?: string;
    avatarType?: string;
    avatarStyle?: string;
    avatarSeed?: string;
  };
  user?: {
    id: string;
    username?: string;
    email?: string;
    phone?: string;
    name?: string;
    image?: string;
    avatarType?: string;
    avatarStyle?: string;
    avatarSeed?: string;
  };
}

function normalizeIdentifier(value?: string) {
  return value?.trim() || "";
}

function isEmailIdentifier(value: string) {
  return value.includes("@");
}


// 1. 先定义并导出 authOptions
export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GitHub,
    Google,
    // 邮箱验证码登录
    Credentials({
      id: "email",
      name: "email",
      credentials: {
        email: { label: "邮箱", type: "email" },
        code: { label: "验证码", type: "text" },
      },
      async authorize(credentials) {
        console.log("开始验证邮箱凭据:", credentials);
        
        if (!credentials?.email || !credentials?.code) {
          console.log("邮箱凭据不完整");
          return null;
        }

        try {
          // 查找验证码
          const verificationToken = await prisma.verificationToken.findFirst({
            where: {
              identifier: credentials.email,
              token: credentials.code,
              expires: {
                gt: new Date(),
              },
            },
          });

          console.log("邮箱验证码查询结果:", verificationToken);

          if (!verificationToken) {
            console.log("邮箱验证码不存在或已过期");
            return null;
          }

          // 删除已使用的验证码
          await prisma.verificationToken.delete({
            where: {
              identifier: credentials.email,
              token: credentials.code as string,
            },
          });

          console.log("邮箱验证码已删除");

          // 查找或创建用户
          let user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          console.log("邮箱用户查询结果:", user);

          if (!user) {
            // 生成随机头像种子
            const avatarSeed = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
            // 从邮箱提取默认昵称（@前面的部分）
            const emailPrefix = (credentials.email as string).split('@')[0];
            // 创建新用户（包含默认头像和昵称）
            user = await prisma.user.create({
              data: {
                email: credentials.email as string,
                emailVerified: new Date(),
                name: emailPrefix, // 使用邮箱前缀作为默认昵称
                avatarType: "system",
                avatarStyle: "lorelei",
                avatarSeed: avatarSeed,
              },
            });
            console.log("新邮箱用户已创建（含默认头像和昵称）:", user);

            // 为新用户创建账户记录
            await prisma.account.create({
              data: {
                userId: user.id,
                type: "credentials",
                provider: "email",
                providerAccountId: credentials.email as string,
              },
            });
            console.log("为新用户创建了邮箱验证码账户记录");
          } else {
            // 检查用户是否已有邮箱验证码的账户记录
            const existingAccount = await prisma.account.findFirst({
              where: {
                userId: user.id,
                provider: "email",
              },
            });

            // 如果没有账户记录，创建一个
            if (!existingAccount) {
              await prisma.account.create({
                data: {
                  userId: user.id,
                  type: "credentials",
                  provider: "email",
                  providerAccountId: credentials.email as string,
                },
              });
              console.log("为用户创建了邮箱验证码账户记录");
            }
          }

          // 重新查询用户以获取最新的头像信息
          const updatedUser = await prisma.user.findUnique({
            where: { id: user.id },
          });
          
          const result = {
            id: user.id,
            email: user.email || "",
            phone: user.phone || "",
            name: user.name || "",
            image: user.image || "",
            avatarType: updatedUser?.avatarType as "system" | "custom" | undefined,
            avatarStyle: updatedUser?.avatarStyle || undefined,
            avatarSeed: updatedUser?.avatarSeed || undefined,
          };

          console.log("返回邮箱用户信息:", result);
          return result;
        } catch (error) {
          console.error("邮箱验证码登录失败:", error);
          return null;
        }
      },
    }),
    // 手机号验证码登录
    Credentials({
      id: "phone_code",
      name: "phone_code",
      credentials: {
        phone: { label: "手机号", type: "tel" },
        code: { label: "验证码", type: "text" },
      },
      async authorize(credentials) {
        console.log("开始验证手机号凭据:", credentials);
        
        if (!credentials?.phone || !credentials?.code) {
          console.log("手机号凭据不完整");
          return null;
        }

        try {
          // 查找验证码
          const verificationToken = await prisma.verificationToken.findFirst({
            where: {
              identifier: credentials.phone,
              token: credentials.code,
              expires: {
                gt: new Date(),
              },
            },
          });

          console.log("手机号验证码查询结果:", verificationToken);

          if (!verificationToken) {
            console.log("手机号验证码不存在或已过期");
            return null;
          }

          // 删除已使用的验证码
          await prisma.verificationToken.delete({
            where: {
              identifier: credentials.phone,
              token: credentials.code as string,
            },
          });

          console.log("手机号验证码已删除");

          // 查找或创建用户
          let user = await prisma.user.findUnique({
            where: { phone: credentials.phone as string },
          });

          console.log("手机号用户查询结果:", user);

          if (!user) {
            // 创建新用户（自动注册）
            user = await prisma.user.create({
              data: {
                phone: credentials.phone as string,
                name: `用户${(credentials.phone as string).slice(-4)}`, // 默认昵称：用户+手机号后4位
                avatarType: "system",
                avatarStyle: "lorelei",
                avatarSeed: credentials.phone as string,
              },
            });
            console.log("新手机号用户已创建:", user);
            
            // 为新用户创建账户记录
            await prisma.account.create({
              data: {
                userId: user.id,
                type: "credentials",
                provider: "phone_code",
                providerAccountId: credentials.phone as string,
              },
            });
            console.log("为新用户创建了手机号验证码账户记录");
          } else {
            // 检查用户是否已有手机号验证码的账户记录
            const existingAccount = await prisma.account.findFirst({
              where: {
                userId: user.id,
                provider: "phone_code",
              },
            });

            // 如果没有账户记录，创建一个
            if (!existingAccount) {
              await prisma.account.create({
                data: {
                  userId: user.id,
                  type: "credentials",
                  provider: "phone_code",
                  providerAccountId: credentials.phone as string,
                },
              });
              console.log("为用户创建了手机号验证码账户记录");
            }
          }

          // 重新查询用户以获取最新的头像信息
          const updatedUser = await prisma.user.findUnique({
            where: { id: user.id },
          });
          
          const result = {
            id: user.id,
            email: user.email || "",
            phone: user.phone || "",
            name: user.name || "",
            image: user.image || "",
            avatarType: updatedUser?.avatarType as "system" | "custom" | undefined,
            avatarStyle: updatedUser?.avatarStyle || undefined,
            avatarSeed: updatedUser?.avatarSeed || undefined,
          };

          console.log("返回手机号用户信息:", result);
          return result;
        } catch (error) {
          console.error("手机号验证码登录失败:", error);
          return null;
        }
      },
    }),
    // 账号密码登录
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        identifier: { label: "账号或邮箱", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        console.log("开始验证账号密码凭据");
        
        const identifier = normalizeIdentifier(credentials?.identifier as string | undefined);

        if (!identifier || !credentials?.password) {
          console.log("账号密码凭据不完整");
          return null;
        }

        try {
          // 查找用户
          const user = await prisma.user.findFirst({
            where: isEmailIdentifier(identifier)
              ? { email: identifier }
              : {
                  OR: [
                    { username: identifier },
                    { email: identifier },
                  ],
                },
          });

          if (!user) {
            console.log("用户不存在:", identifier);
            return null;
          }

          if (!user.password) {
            console.log("用户未设置密码，无法使用密码登录");
            return null;
          }

          // 验证密码
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValid) {
            console.log("密码错误");
            return null;
          }

          console.log("密码验证成功:", user.email);

          return {
            id: user.id,
            username: user.username || "",
            email: user.email || "",
            phone: user.phone || "",
            name: user.name || "",
            image: user.image || "",
            avatarType: user.avatarType as "system" | "custom" | undefined,
            avatarStyle: user.avatarStyle || undefined,
            avatarSeed: user.avatarSeed || undefined,
          };
        } catch (error) {
          console.error("账号密码登录失败:", error);
          return null;
        }
      },
    }),
    // 微信小程序登录（用于 NextAuth signIn 调用）
    Credentials({
      id: "wechat_miniprogram",
      name: "wechat_miniprogram",
      credentials: {
        openid: { label: "OpenID", type: "text" },
        unionid: { label: "UnionID", type: "text" },
        nickName: { label: "昵称", type: "text" },
        avatarUrl: { label: "头像", type: "text" },
      },
      async authorize(credentials) {
        console.log("开始验证微信小程序凭据:", credentials);
        
        if (!credentials?.openid) {
          console.log("微信小程序凭据不完整");
          return null;
        }

        try {
          const openid = credentials.openid as string;
          const unionid = credentials.unionid as string | undefined;
          const nickName = credentials.nickName as string | undefined;
          const avatarUrl = credentials.avatarUrl as string | undefined;

          // 查找或创建用户
          let user = await prisma.user.findUnique({
            where: { openid },
          });

          if (!user) {
            // 如果有 unionid，尝试通过 unionid 查找
            if (unionid) {
              user = await prisma.user.findUnique({
                where: { unionid },
              });
            }

            if (!user) {
              // 创建新用户
              user = await prisma.user.create({
                data: {
                  openid,
                  unionid,
                  name: nickName || `微信用户${openid.slice(-4)}`,
                  image: avatarUrl,
                  avatarType: avatarUrl ? "custom" : "system",
                  avatarStyle: "lorelei",
                  avatarSeed: openid,
                },
              });

              // 创建账户记录
              await prisma.account.create({
                data: {
                  userId: user.id,
                  type: "oauth",
                  provider: "wechat_miniprogram",
                  providerAccountId: openid,
                },
              });

              console.log("新微信用户已创建:", user.id);
            } else {
              // 通过 unionid 找到用户，更新 openid
              user = await prisma.user.update({
                where: { id: user.id },
                data: { openid },
              });
            }
          }

          return {
            id: user.id,
            email: user.email || "",
            phone: user.phone || "",
            name: user.name || "",
            image: user.image || "",
            avatarType: user.avatarType as "system" | "custom" | undefined,
            avatarStyle: user.avatarStyle || undefined,
            avatarSeed: user.avatarSeed || undefined,
          };
        } catch (error) {
          console.error("微信小程序登录失败:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: SessionCallbackParams) {
      // 优先从 JWT token 读取用户信息
      if (token) {
        const userId = token.id || "";
        session.user = {
          ...session.user,
          id: userId,
          username: token.username || "",
          email: token.email || "",
          phone: token.phone || "",
          name: token.name || "",
          image: token.image || "",
          // 确保头像信息始终有默认值
          avatarType: (token.avatarType || "system") as "system" | "custom",
          avatarStyle: token.avatarStyle || "lorelei",
          avatarSeed: token.avatarSeed || userId,
          roles: token.roles || [],
        };

        // 如果 token 中没有头像信息，从数据库补充（兼容旧 token）
        if (!token.avatarType && (token.email || token.phone)) {
          const whereClause = token.email
            ? { email: token.email }
            : { phone: token.phone };
          const dbUser = await prisma.user.findUnique({
            where: whereClause,
            select: { avatarType: true, avatarStyle: true, avatarSeed: true, name: true, image: true }
          });
          if (dbUser) {
            session.user.avatarType = (dbUser.avatarType || "system") as "system" | "custom";
            session.user.avatarStyle = dbUser.avatarStyle || "lorelei";
            session.user.avatarSeed = dbUser.avatarSeed || userId;
            session.user.name = dbUser.name || session.user.name;
            session.user.image = dbUser.image || session.user.image;
          }
        }
      }
      return session;
    },
    async jwt({ token, user, trigger, session }: any) {
      console.log('[Auth JWT] trigger:', trigger);
      console.log('[Auth JWT] user 存在:', !!user);
      console.log('[Auth JWT] token.id:', token?.id);

      if (user) {
        console.log('[Auth JWT] 用户登录，设置 token:', user.id, user.email);
        token.id = user.id;
        token.username = user.username || "";
        token.email = user.email || "";
        token.phone = user.phone || "";

        // 登录时从数据库获取完整用户信息（包括头像和角色）
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
              username: true,
              name: true,
              image: true,
              avatarType: true,
              avatarStyle: true,
              avatarSeed: true,
            }
          });
          
          // 单独获取用户角色
          const userRoles = await prisma.userRole.findMany({
            where: { userId: user.id },
            select: { role: { select: { name: true } } }
          });

          if (dbUser) {
            token.username = dbUser.username || user.username || "";
            token.name = dbUser.name || user.name || "";
            token.image = dbUser.image || user.image || "";

            // 如果用户没有头像信息，为其创建默认头像并更新数据库
            if (!dbUser.avatarType || !dbUser.avatarSeed) {
              const defaultAvatarSeed = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  avatarType: "system",
                  avatarStyle: "lorelei",
                  avatarSeed: defaultAvatarSeed,
                },
              });
              token.avatarType = "system";
              token.avatarStyle = "lorelei";
              token.avatarSeed = defaultAvatarSeed;
              console.log("为已存在用户创建了默认头像:", user.id);
            } else {
              token.avatarType = dbUser.avatarType;
              token.avatarStyle = dbUser.avatarStyle || "lorelei";
              token.avatarSeed = dbUser.avatarSeed;
            }
          } else {
            token.username = user.username || "";
            token.name = user.name || "";
            token.image = user.image || "";
            token.avatarType = "system";
            token.avatarStyle = "lorelei";
            token.avatarSeed = user.id;
          }
          token.roles = userRoles.map((ur) => ur.role.name);
        } catch (error) {
          console.error("登录时获取用户信息失败:", error);
          token.name = user.name || "";
          token.image = user.image || "";
          token.avatarType = "system";
          token.avatarStyle = "lorelei";
          token.avatarSeed = user.id;
          token.roles = [];
        }

        token.profileRefreshedAt = Date.now(); // 记录刷新时间
      }

      // 处理客户端 update() 调用
      if (trigger === "update" && session) {
        return { ...token, ...session.user, profileRefreshedAt: Date.now() };
      }

      // 定期从数据库刷新用户资料（每 5 分钟）
      // 解决：在其他设备更新头像或角色后，当前设备刷新页面能看到最新信息
      const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 分钟
      const shouldRefresh = token.id && (
        !token.avatarType || // 没有头像信息
        !token.roles || (Array.isArray(token.roles) && token.roles.length === 0) || // 没有角色信息
        !token.profileRefreshedAt || // 没有刷新时间记录
        Date.now() - token.profileRefreshedAt > REFRESH_INTERVAL // 超过刷新间隔
      );

      if (shouldRefresh) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id },
            select: { avatarType: true, avatarStyle: true, avatarSeed: true, name: true, image: true }
          });
          
          // 同时刷新用户角色
          const userRoles = await prisma.userRole.findMany({
            where: { userId: token.id },
            select: { role: { select: { name: true } } }
          });
          token.roles = userRoles.map((ur) => ur.role.name);
          
          if (dbUser) {
            // 如果数据库有头像信息，使用数据库的值
            if (dbUser.avatarType) {
              token.avatarType = dbUser.avatarType;
              token.avatarStyle = dbUser.avatarStyle;
              token.avatarSeed = dbUser.avatarSeed;
            } else {
              // 数据库也没有头像信息，设置默认值并更新数据库
              const defaultAvatarType = "system";
              const defaultAvatarStyle = "lorelei";
              const defaultAvatarSeed = token.id;

              await prisma.user.update({
                where: { id: token.id },
                data: {
                  avatarType: defaultAvatarType,
                  avatarStyle: defaultAvatarStyle,
                  avatarSeed: defaultAvatarSeed,
                },
              });

              token.avatarType = defaultAvatarType;
              token.avatarStyle = defaultAvatarStyle;
              token.avatarSeed = defaultAvatarSeed;
              console.log("JWT callback: 已为用户设置默认头像信息", token.id);
            }
            token.name = dbUser.name || token.name;
            token.image = dbUser.image || token.image;
            token.profileRefreshedAt = Date.now(); // 更新刷新时间
          }
        } catch (error) {
          console.error("JWT callback: 从数据库获取头像信息失败", error);
        }
      }

      return token;
    },
  },
  events: {
    // 当通过 OAuth (GitHub/Google) 创建新用户时，设置默认头像信息
    async createUser({ user }: { user: { id: string; email?: string | null; name?: string | null; image?: string | null } }) {
      console.log("新用户创建事件触发:", user.id);
      try {
        // 检查用户是否已有头像信息
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { avatarType: true, avatarStyle: true, avatarSeed: true },
        });

        // 如果没有头像信息，设置默认值
        if (!existingUser?.avatarType) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              avatarType: "system",
              avatarStyle: "lorelei",
              avatarSeed: user.id,
            },
          });
          console.log("已为新用户设置默认头像信息:", user.id);
        }
      } catch (error) {
        console.error("设置默认头像信息失败:", error);
      }
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: true,
};

// 2. 用 NextAuth(authOptions) 初始化
export const { auth, handlers, signIn, signOut } = NextAuth(authOptions as unknown as NextAuthConfig); 
