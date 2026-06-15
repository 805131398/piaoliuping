import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const generalRules = {
  // React 相关规则 - 保持重要规则
  "react-hooks/exhaustive-deps": "warn", // 保持警告，但允许构建
  "react-hooks/error-boundaries": "off",
  "react-hooks/refs": "off",
  "react-hooks/set-state-in-effect": "off",
  "react-hooks/use-memo": "off",
  "react/no-unescaped-entities": "off",
  "react/jsx-no-target-blank": "off",

  // Next.js 相关规则 - 大幅放宽规则
  "@next/next/no-img-element": "off", // 禁用 img 元素检查
  "@next/next/no-html-link-for-pages": "off",

  // 通用规则 - 大幅放宽规则
  "no-console": "off", // 完全允许 console
  "no-debugger": "error",
  "prefer-const": "warn",
  "no-var": "error",

  // 代码风格 - 关闭或改为警告
  "semi": "off", // 关闭分号检查
  "quotes": "off", // 关闭引号检查
  "comma-dangle": "off", // 关闭尾随逗号检查

  // 可访问性规则 - 大幅放宽规则
  "jsx-a11y/alt-text": "off", // 禁用 alt 属性检查
};

const typescriptRules = {
  // TypeScript 相关规则 - 大幅放宽规则
  "@typescript-eslint/no-explicit-any": "off", // 完全禁用 any 类型检查
  "@typescript-eslint/no-unused-vars": [
    "warn",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      ignoreRestSiblings: true,
    },
  ],
  "@typescript-eslint/no-non-null-assertion": "off", // 禁用非空断言检查
  "@typescript-eslint/no-empty-object-type": "off", // 禁用空对象类型检查
  "@typescript-eslint/ban-ts-comment": "off", // 允许 @ts-ignore 等注释
  "@typescript-eslint/no-this-alias": "off", // 允许 this 别名
};

const nextConfig = nextCoreWebVitals.map((config) => {
  if (config.name === "next") {
    return {
      ...config,
      rules: {
        ...config.rules,
        ...generalRules,
      },
    };
  }

  if (config.name === "next/typescript") {
    return {
      ...config,
      rules: {
        ...config.rules,
        ...typescriptRules,
      },
    };
  }

  return config;
});

const nextTypescriptConfig = nextTypescript.map((config) => {
  return config;
});

const typescriptPluginConfig =
  nextTypescript.find((config) => config.plugins?.["@typescript-eslint"]) ??
  nextCoreWebVitals.find((config) => config.plugins?.["@typescript-eslint"]);

const reactPluginConfig = nextCoreWebVitals.find(
  (config) => config.plugins?.["react-hooks"] && config.plugins?.["@next/next"],
);

const eslintConfig = [
  // 全局忽略，避免无意义的文件被 ESLint 扫描
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/public/**",
      "**/*.min.js",
      "**/*.css",
      "**/*.scss",
      "**/*.svg",
      "**/*.png",
      "**/*.jpg",
      "**/*.jpeg",
      "**/*.gif",
      "**/*.webp",
      "**/*.ico",
      "mini-app-ui/**",
    ],
  },
  ...nextConfig,
  ...nextTypescriptConfig,
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"],
    plugins: reactPluginConfig?.plugins,
    rules: generalRules,
  },
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    plugins: typescriptPluginConfig?.plugins,
    rules: typescriptRules,
  },
];

export default eslintConfig;
