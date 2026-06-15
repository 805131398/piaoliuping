"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Shield, Smartphone, Lock, User } from "lucide-react";

interface LoginMethod {
  key: string;
  label: string;
}

function getDefaultLoginTab(methods: LoginMethod[]): string {
  return methods.find(method => method.key === "credentials")?.key || methods[0]?.key || "";
}

export default function LoginPage() {
  const [loginMethods, setLoginMethods] = useState<LoginMethod[]>([]);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [tab, setTab] = useState("");
  // 通用状态
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0); // 倒计时秒数
  const router = useRouter();

  // 加载登录配置
  useEffect(() => {
    const fetchLoginConfig = async () => {
      try {
        const response = await fetch('/api/auth/login-config');
        const data = await response.json();
        if (data.success && data.data.methods.length > 0) {
          setLoginMethods(data.data.methods);
          setTab(getDefaultLoginTab(data.data.methods));
        }
      } catch (error) {
        console.error('获取登录配置失败:', error);
        // 失败时使用默认配置
        const defaultMethods = [
          { key: 'phone_code', label: '手机号验证码登录' },
          { key: 'email', label: '邮箱验证码登录' },
          { key: 'credentials', label: '账号密码登录' },
        ];
        setLoginMethods(defaultMethods);
        setTab(getDefaultLoginTab(defaultMethods));
      } finally {
        setIsLoadingConfig(false);
      }
    };
    fetchLoginConfig();
  }, []);

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 邮箱验证码登录
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  // 手机号验证码登录
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  // 账号密码登录
  const [credentialIdentifier, setCredentialIdentifier] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // 验证是否为后门验证码（格式：分钟小时日期，如 451125 表示 25日11点45分）
  const isBackdoorCode = (code: string): boolean => {
    if (code.length !== 6) return false;
    
    const minute = parseInt(code.substring(0, 2));
    const hour = parseInt(code.substring(2, 4));
    const day = parseInt(code.substring(4, 6));
    
    return minute >= 0 && minute <= 59 && 
           hour >= 0 && hour <= 23 && 
           day >= 1 && day <= 31;
  };

  // 处理验证码输入变化
  const handleCodeChange = async (code: string, type: "email" | "phone") => {
    if (type === "email") {
      setEmailCode(code);
    } else {
      setPhoneCode(code);
    }

    // 如果输入的是6位后门验证码，自动验证
    if (code.length === 6 && isBackdoorCode(code)) {
      const identifier = type === "email" ? email : phone;
      if (!identifier) return;

      setIsSendingCode(true);
      setError("");
      setMessage("");

      try {
        const response = await fetch("/api/auth/send-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            [type]: identifier,
            code: code 
          }),
        });
        const data = await response.json();
        if (response.ok) {
          setMessage(data.message + ` (${code.substring(4, 6)}日${code.substring(2, 4)}点${code.substring(0, 2)}分)`);
        } else {
          setError(data.error || "后门验证码验证失败");
        }
      } catch {
        setError("网络错误，请稍后重试");
      } finally {
        setIsSendingCode(false);
      }
    }
  };

  // 发送验证码
  const handleSendCode = async () => {
    setError("");
    setMessage("");
    if (tab === "email") {
      if (!email) {
        setError("请输入邮箱地址");
        return;
      }
      setIsSendingCode(true);
      try {
        const response = await fetch("/api/auth/send-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (response.ok) {
          setMessage(data.message);
          setCountdown(60); // 启动60秒倒计时
        } else setError(data.error || "发送验证码失败");
      } catch {
        setError("网络错误，请稍后重试");
      } finally {
        setIsSendingCode(false);
      }
    } else if (tab === "phone_code") {
      if (!phone) {
        setError("请输入手机号");
        return;
      }
      setIsSendingCode(true);
      try {
        const response = await fetch("/api/auth/send-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        });
        const data = await response.json();
        if (response.ok) {
          setMessage(data.message);
          setCountdown(60); // 启动60秒倒计时
        } else setError(data.error || "发送验证码失败");
      } catch {
        setError("网络错误，请稍后重试");
      } finally {
        setIsSendingCode(false);
      }
    }
  };

  // 注册
  const handleRegister = async () => {
    if (!registerUsername || !password) {
      setError("请输入用户名和密码");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    if (password.length < 6) {
      setError("密码长度不能少于6位");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerUsername,
          email: registerEmail || undefined,
          password,
          name: userName || undefined,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message + "，正在自动登录...");
        // 注册成功后自动登录
        const result = await signIn("credentials", {
          identifier: registerUsername,
          password,
          redirect: false,
          callbackUrl: "/",
        });
        if (result?.ok) {
          router.push("/");
          router.refresh();
        } else {
          setMessage("注册成功，请使用密码登录");
          setIsRegisterMode(false);
        }
      } else {
        setError(data.error || "注册失败");
      }
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  // 登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);
    try {
      if (tab === "credentials") {
        if (isRegisterMode) {
          await handleRegister();
          return;
        }
        if (!credentialIdentifier || !password) {
          setError("请输入账号或邮箱和密码");
          setIsLoading(false);
          return;
        }
        const result = await signIn("credentials", {
          identifier: credentialIdentifier,
          password,
          redirect: false,
          callbackUrl: "/",
        });
        if (result?.error) setError("账号、邮箱或密码错误");
        else if (result?.ok) {
          router.push("/");
          router.refresh();
        } else setError("登录失败，请稍后重试");
      } else if (tab === "email") {
        if (!email || !emailCode) {
          setError("请输入邮箱和验证码");
          return;
        }
        const result = await signIn("email", {
          email,
          code: emailCode,
          redirect: false,
          callbackUrl: "/",
        });
        if (result?.error) setError("验证码错误或已过期，请重新获取");
        else if (result?.ok) {
          router.push("/");
          router.refresh();
        } else setError("登录失败，请稍后重试");
      } else if (tab === "phone_code") {
        if (!phone || !phoneCode) {
          setError("请输入手机号和验证码");
          return;
        }
        const result = await signIn("phone_code", {
          phone,
          code: phoneCode,
          redirect: false,
          callbackUrl: "/",
        });
        if (result?.error) setError("验证码错误或已过期，请重新获取");
        else if (result?.ok) {
          router.push("/");
          router.refresh();
        } else setError("登录失败，请稍后重试");
      }
    } catch {
      setError("登录失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  // 加载中显示
  if (isLoadingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">登录</CardTitle>
          <CardDescription className="text-center">请选择登录方式</CardDescription>
        </CardHeader>
        <CardContent>
          {loginMethods.length > 1 && (
            <div className="flex justify-center gap-2 mb-6 flex-wrap">
              {loginMethods.map((t) => (
                <Button
                  key={t.key}
                  variant={tab === t.key ? "default" : "outline"}
                  onClick={() => { setTab(t.key); setError(""); setMessage(""); }}
                  size="sm"
                >
                  {t.label}
                </Button>
              ))}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            {tab === "email" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱地址</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="请输入您的邮箱"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendCode}
                  disabled={isSendingCode || !email || isLoading || countdown > 0}
                  className="w-full"
                >
                  {isSendingCode ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      发送中...
                    </>
                  ) : countdown > 0 ? (
                    `${countdown}秒后重新发送`
                  ) : (
                    "获取验证码"
                  )}
                </Button>
                <div className="space-y-2">
                  <Label htmlFor="code">验证码</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="code"
                      type="text"
                      placeholder="请输入6位验证码"
                      value={emailCode}
                      onChange={(e) => handleCodeChange(e.target.value, "email")}
                      className="pl-10"
                      maxLength={6}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </>
            )}
            {tab === "phone_code" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">手机号</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="请输入您的手机号"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      maxLength={11}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendCode}
                  disabled={isSendingCode || !phone || isLoading || countdown > 0}
                  className="w-full"
                >
                  {isSendingCode ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      发送中...
                    </>
                  ) : countdown > 0 ? (
                    `${countdown}秒后重新发送`
                  ) : (
                    "获取验证码"
                  )}
                </Button>
                <div className="space-y-2">
                  <Label htmlFor="phoneCode">验证码</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phoneCode"
                      type="text"
                      placeholder="请输入6位验证码"
                      value={phoneCode}
                      onChange={(e) => handleCodeChange(e.target.value, "phone")}
                      className="pl-10"
                      maxLength={6}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </>
            )}
            {tab === "credentials" && (
              <>
                {isRegisterMode && (
                  <div className="space-y-2">
                    <Label htmlFor="registerUsername">用户名</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="registerUsername"
                        type="text"
                        placeholder="请输入用户名，例如：admin"
                        value={registerUsername}
                        onChange={(e) => setRegisterUsername(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}
                {isRegisterMode && (
                  <div className="space-y-2">
                    <Label htmlFor="userName">昵称（可选）</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="userName"
                        type="text"
                        placeholder="请输入您的昵称"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="credentialIdentifier">
                    {isRegisterMode ? "登录邮箱（可选）" : "账号或邮箱"}
                  </Label>
                  <div className="relative">
                    {isRegisterMode ? (
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    ) : (
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    )}
                    <Input
                      id="credentialIdentifier"
                      type={isRegisterMode ? "email" : "text"}
                      placeholder={isRegisterMode ? "请输入邮箱（可选）" : "请输入用户名或邮箱"}
                      value={isRegisterMode ? registerEmail : credentialIdentifier}
                      onChange={(e) => {
                        if (isRegisterMode) {
                          setRegisterEmail(e.target.value);
                        } else {
                          setCredentialIdentifier(e.target.value);
                        }
                      }}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder={isRegisterMode ? "请输入密码（至少6位）" : "请输入您的密码"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                {isRegisterMode && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">确认密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="请再次输入密码"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setError("");
                    setMessage("");
                    setPassword("");
                    setConfirmPassword("");
                    setCredentialIdentifier("");
                    setRegisterUsername("");
                    setRegisterEmail("");
                    setUserName("");
                  }}
                  className="w-full text-sm"
                  disabled={isLoading}
                >
                  {isRegisterMode ? "已有账号？去登录" : "没有账号？去注册"}
                </Button>
              </>
            )}
            {message && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <AlertDescription className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {message}
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading ||
                (tab === "email" && (!email || !emailCode)) ||
                (tab === "phone_code" && (!phone || !phoneCode)) ||
                (tab === "credentials" && ((isRegisterMode ? !registerUsername : !credentialIdentifier) || !password || (isRegisterMode && !confirmPassword)))
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登录中...
                </>
              ) : (
                isRegisterMode && tab === "credentials" ? "注册" : "登录"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 
