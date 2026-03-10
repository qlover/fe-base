import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import qloverLint, { restrictSpecificGlobals } from '@qlover/eslint-plugin';
// ✅ 修改 1: 使用 import-x 替代 import
import importPlugin from 'eslint-plugin-import-x';
import prettierPlugin from 'eslint-plugin-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettierConfig from './.prettierrc.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig([
  // 1. 全局忽略文件
  globalIgnores([
    'build',
    'dist',
    'node_modules',
    '.plasmo',
    'postcss.config.js',
    'eslint.config.js'
  ]),

  // 2. 基础 React/TS 推荐配置 (不包含 import 插件，避免过早加载)
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    }
  },

  // 3. 核心配置：包含 parser, plugins 和大部分 rules
  // ✅ 修改 2: 在这里显式定义 parserOptions，确保 sourceType 存在
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        sourceType: 'module' // 关键修复：防止 import-x 报错
        // 注意：这里不设置 project，留给下面的 type-checked 块专门处理，提高性能
      }
    },
    plugins: {
      'unused-imports': unusedImports,
      // ✅ 修改 3: 插件名注册为 'import'，这样下面的 rules 不需要改名字
      import: importPlugin,
      prettier: prettierPlugin,
      '@qlover-eslint': qloverLint,
      '@typescript-eslint': tseslint.plugin
    },
    rules: {
      '@qlover-eslint/ts-class-method-return': 'error',
      '@qlover-eslint/ts-class-member-accessibility': 'error',
      '@qlover-eslint/ts-class-override': 'off', // 在下方 type-checked 块中开启

      // TODO: update to eslint10
      // "@qlover-eslint/require-root-testid": [
      //   "error",
      //   {
      //     exclude: ["/^[A-Z]/"]
      //   }
      // ],

      // 禁用原生 no-unused-vars，使用 unused-imports
      '@typescript-eslint/no-unused-vars': 'off',

      // 强制 type-imports
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
          fixStyle: 'separate-type-imports'
        }
      ],

      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ],

      // Import 排序：交给 Prettier 的 @ianvs/prettier-plugin-sort-imports 统一处理，避免与 Prettier 循环修复
      'import/order': 'off',

      // Prettier
      'prettier/prettier': ['error', prettierConfig],

      // 默认禁用 default export
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message:
            '默认禁用 default export，仅允许在 pages/popup/content 等入口使用'
        }
      ]
    }
  },

  // 4. 类型检查增强配置 (针对 src 目录)
  // ✅ 修改 4: 这里覆盖 parserOptions 时，必须再次包含 sourceType: "module"
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
      }
    },
    plugins: {
      '@qlover-eslint': qloverLint
    },
    rules: {
      // 仅在拥有类型信息时开启此规则
      '@qlover-eslint/ts-class-override': 'error'
    }
  },

  // 5. 全局变量限制策略
  restrictSpecificGlobals(
    {
      files: ['src/**/*.{ts,tsx,js,jsx}'],
      languageOptions: {
        globals: globals.browser
      }
    },
    {
      restrictedGlobals: [
        'window',
        'document',
        'localStorage',
        'sessionStorage',
        'navigator',
        'location',
        'history',
        'console'
      ],
      message: '❌ see(./docs/zh/why-no-globals.md)'
    }
  ),

  // 6. 例外：允许特定文件使用全局变量
  {
    files: [
      'src/main.tsx',
      'src/core/globals.ts',
      'src/popup.tsx',
      'src/content.tsx'
    ],
    rules: {
      'no-restricted-globals': 'off'
    }
  },

  // 7. 例外：允许特定文件使用 default export
  {
    files: [
      'src/pages/**/*.tsx',
      'src/popup.tsx',
      'src/content.tsx',
      'vite.config.ts',
      'tailwind.config.ts'
    ],
    rules: {
      'no-restricted-syntax': 'off',
      // 默认禁用 default export
      'no-restricted-syntax': ['off'],
      'import/prefer-default-export': 'error'
    }
  }
]);
