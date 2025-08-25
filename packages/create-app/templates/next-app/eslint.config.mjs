import { dirname } from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:import/recommended",
    "plugin:import/typescript"
  ),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    plugins: {
      "unused-imports": unusedImports,
      "import": importPlugin
    },
    rules: {
      // 禁用原始的 no-unused-vars，使用 unused-imports 的规则替代
      "@typescript-eslint/no-unused-vars": "off",
      // 检查未使用的导入
      "unused-imports/no-unused-imports": "error",
      // 检查未使用的变量，但允许以下划线开头的变量
      "unused-imports/no-unused-vars": [
        "error",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_"
        }
      ],
      // import 语句排序规则
      "import/order": [
        "error",
        {
          "groups": [
            "builtin",    // Node.js 内置模块
            "external",   // 第三方模块
            "internal",   // 内部模块（使用 alias 的导入）
            ["parent", "sibling"], // 父级和同级模块
            "index",     // 当前目录下的模块
            "object",    // 对象导入
            "type"       // 类型导入
          ],
          "pathGroups": [
            {
              "pattern": "@/**",
              "group": "internal",
              "position": "after"
            }
          ],
          // "newlines-between": "always", // 不同组之间空一行
          "alphabetize": {
            "order": "asc",           // 按字母顺序排序
            "caseInsensitive": true   // 排序时忽略大小写
          }
        }
      ]
    },
  },
];

export default eslintConfig;
