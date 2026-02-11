import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import qloverLint, { restrictSpecificGlobals } from '@qlover/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig([
  globalIgnores([
    'dist',
    'node_modules',
    'postcss.config.js',
    'eslint.config.js'
  ]),
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
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        // Note: 'project' is removed here to avoid conflict with projectService in the type-checked config below
        // TypeScript files will get type information from the recommendedTypeChecked config
        tsconfigRootDir: __dirname
      }
    },
    plugins: {
      'unused-imports': unusedImports,
      import: importPlugin,
      prettier: prettierPlugin,
      '@qlover-eslint': qloverLint,
      '@typescript-eslint': tseslint.plugin
    },
    rules: {
      '@qlover-eslint/ts-class-method-return': 'error',
      '@qlover-eslint/ts-class-member-accessibility': 'error',
      '@qlover-eslint/ts-class-override': 'off',
      '@qlover-eslint/require-root-testid': [
        'error',
        {
          exclude: ['/^[A-Z]/']
        }
      ], // 禁用 import 路径解析检查，TypeScript 编译器会处理
      'import/no-unresolved': 'off',
      // 禁用原始的 no-unused-vars，使用 unused-imports 的规则替代
      '@typescript-eslint/no-unused-vars': 'off',
      // 强制使用 import type 导入类型
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
          fixStyle: 'separate-type-imports'
        }
      ],
      // 检查未使用的导入
      'unused-imports/no-unused-imports': 'error',
      // 检查未使用的变量，但允许以下划线开头的变量
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ],
      // import 语句排序规则
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node.js 内置模块
            'external', // 第三方模块
            'internal', // 内部模块（使用 alias 的导入）
            ['parent', 'sibling', 'index'], // 父级和同级模块
            // 'index', // 当前目录下的模块
            // 'object', // 对象导入
            'type' // 类型导入
          ],
          pathGroupsExcludedImportTypes: ['type'],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal'
            }
          ],
          'newlines-between': 'never', // 不同组之间空一行
          alphabetize: {
            order: 'asc', // 按字母顺序排序
            caseInsensitive: true // 排序时忽略大小写
          }
        }
      ],
      // Prettier 配置
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'none',
          endOfLine: 'lf',
          printWidth: 80
        },
        {
          // 仅用于单独部署时对 eslint prettier 插件自动查找 prettierrc 时报错
          // 注意: vscode 等编辑器会失效, 作为单独项目开发时可以去掉
          usePrettierrc: false
        }
      ],
      // 默认禁用 export default
      'import/no-default-export': 'error'
    }
  },
  // class override rules
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.app.json',
        tsconfigRootDir: __dirname
      }
    },
    plugins: {
      '@qlover-eslint': qloverLint
    },
    rules: {
      // Enable ts-class-override rule with full type information
      // This rule is disabled in the base config above and only enabled here where
      // type information is available, ensuring accurate detection of override relationships
      '@qlover-eslint/ts-class-override': 'error'
    }
  },
  // 为特定文件允许使用全局变量
  {
    files: ['src/main.tsx', 'src/core/globals.ts'],
    rules: {
      'no-restricted-globals': 'off'
    }
  },
  // 限制 src 目录下不能直接使用特定的浏览器全局变量
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
  // 为特定文件允许使用全局变量
  {
    files: ['src/main.tsx', 'src/core/globals.ts'],
    rules: {
      'no-restricted-globals': 'off'
    }
  },
  // 为特定文件允许 default export
  {
    files: [
      'src/pages/**/*.tsx',
      'src/App.tsx',
      'vite.config.ts',
      'tailwind.config.ts',
      'config/mock/**/*.ts'
    ],
    rules: {
      'import/no-default-export': 'off',
      // 强制 pages 必须使用 default export，禁止 named export
      'import/no-named-export': 'error',
      // 建议使用 default export
      'import/prefer-default-export': 'error'
    }
  }
]);
