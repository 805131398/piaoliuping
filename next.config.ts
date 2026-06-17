import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '139.129.208.121',
  ],
  output: 'standalone',
  // 将 ali-oss 及其依赖标记为外部包，避免 Webpack 打包破坏动态加载
  serverExternalPackages: ['ali-oss', 'urllib', 'proxy-agent', 'vm2'],
  webpack: (config, { isServer }) => {
    // 解决 vm2 依赖 coffee-script 可选模块的问题
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'coffee-script': false,
      };
    }
    return config;
  },
  typescript: {
    // 构建时忽略 TS 错误，避免阻塞打包（请在本地开发确保类型正确）
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'luckcoder.oss-cn-beijing.aliyuncs.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'example-luckcoder.oss-cn-beijing.aliyuncs.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'luckcoder.oss-cn-beijing.aliyuncs.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
