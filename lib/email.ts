import nodemailer from "nodemailer";
import { prisma } from "./prisma";

/**
 * 从数据库获取邮件配置
 * 优先从数据库读取，失败时回退到环境变量
 */
async function getEmailConfig() {
  try {
    const configs = await prisma.config.findMany({
      where: {
        category: { value: "email" },
      },
    });

    const configMap: Record<string, string> = {};
    configs.forEach((config) => {
      if (config.value) {
        configMap[config.key] = config.value;
      }
    });

    // 数据库配置键名
    const host = configMap['email.smtp_host'] || process.env.SMTP_HOST;
    const port = parseInt(configMap['email.smtp_port'] || process.env.SMTP_PORT || "587");
    const user = configMap['email.smtp_user'] || process.env.SMTP_USER;
    const password = configMap['email.smtp_pass'] || process.env.SMTP_PASS;

    // 调试日志
    console.log('📧 邮件配置:', {
      host,
      port,
      user,
      password: password ? '***' : '(空)',
      source: configMap['email.smtp_host'] ? '数据库' : '环境变量'
    });

    return {
      host,
      port,
      user,
      password,
      from: user,
    };
  } catch (error) {
    console.warn('从数据库读取邮件配置失败，使用环境变量', error);
    // 回退到环境变量
    return {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASS,
      from: process.env.SMTP_USER,
    };
  }
}

/**
 * 创建邮件传输器
 */
async function createTransporter() {
  const config = await getEmailConfig();

  if (!config.host || !config.user || !config.password) {
    throw new Error(
      "邮件配置不完整。请在数据库配置管理中设置邮件配置，或在 .env 文件中取消注释 SMTP 相关配置：\n" +
      "SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS"
    );
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465, // true for 465, false for other ports
    auth: {
      user: config.user,
      pass: config.password,
    },
    // 添加超时和重试配置
    connectionTimeout: 10000, // 10秒连接超时
    greetingTimeout: 10000, // 10秒问候超时
    socketTimeout: 10000, // 10秒socket超时
    // TLS 配置
    tls: {
      rejectUnauthorized: false, // 开发环境允许自签名证书
    },
    // 调试模式
    debug: true,
    logger: true,
  });
}

/**
 * 发送测试邮件
 */
export async function sendTestEmail(to: string) {
  try {
    const config = await getEmailConfig();
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: `"系统测试" <${config.from}>`,
      to: to,
      subject: "邮件配置测试",
      text: "这是一封测试邮件，如果您收到此邮件，说明邮件配置正常。",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">邮件配置测试</h2>
          <p>您好，</p>
          <p>这是一封测试邮件。如果您收到此邮件，说明您的邮件服务配置正常。</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            发送时间: ${new Date().toLocaleString("zh-CN")}
          </p>
        </div>
      `,
    });

    return {
      success: true,
      messageId: info.messageId,
      message: "测试邮件发送成功",
    };
  } catch (error: any) {
    console.error("发送测试邮件失败:", error);
    throw new Error(error.message || "发送测试邮件失败");
  }
}

/**
 * 发送普通邮件
 */
export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}) {
  try {
    const config = await getEmailConfig();
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: `"系统通知" <${config.from}>`,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error("发送邮件失败:", error);
    throw new Error(error.message || "发送邮件失败");
  }
}
