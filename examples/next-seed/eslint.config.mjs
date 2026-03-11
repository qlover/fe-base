import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import qloverEslint from '@qlover/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import unusedImports from 'eslint-plugin-unused-imports';
import { configs } from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const typeCheckedRulesOff = {
  '@typescript-eslint/ban-ts-comment': 'off',
  '@typescript-eslint/restrict-template-expressions': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unnecessary-type-assertion': 'off',
  '@typescript-eslint/no-redundant-type-constituents': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  '@typescript-eslint/no-empty-object-type': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-argument': 'off',
  '@typescript-eslint/no-unsafe-enum-comparison': 'off',
  '@typescript-eslint/no-unsafe-literal-comparison': 'off',
  '@typescript-eslint/no-unsafe-nullish-coalescing': 'off',
  '@typescript-eslint/no-unsafe-optional-chaining': 'off',
  '@typescript-eslint/unbound-method': 'off',
  '@typescript-eslint/await-thenable': 'off',
  '@typescript-eslint/no-floating-promises': 'off',
  '@typescript-eslint/no-misused-promises': 'off',
  '@typescript-eslint/require-await': 'off',
  '@typescript-eslint/no-base-to-string': 'off',
  '@typescript-eslint/prefer-promise-reject-errors': 'off',
  '@typescript-eslint/no-duplicate-type-constituents': 'off',
  '@typescript-eslint/no-unused-vars': 'off',
  '@typescript-eslint/only-throw-error': 'off'
};

const eslintConfig = defineConfig([
  globalIgnores([
    'node_modules/**',
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts'
  ]),
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended'
  ),
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname
      }
    }
  },
  // Only register plugins not already provided by compat.extends (import, prettier come from compat)
  {
    plugins: {
      'unused-imports': unusedImports,
      '@qlover-eslint': qloverEslint
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
          alwaysTryTypes: true
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      }
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
      ],
      // 禁用原始的 no-unused-vars，使用 unused-imports 的规则替代
      '@typescript-eslint/no-unused-vars': 'off',
      // 强制使用 import type 导入类型
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
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
            ['parent', 'sibling'], // 父级和同级模块
            'index', // 当前目录下的模块
            'object', // 对象导入
            'type' // 类型导入
          ],
          // pathGroups aligned with tsconfig.json paths
          pathGroups: [
            { pattern: '@/**', group: 'internal', position: 'after' },
            { pattern: '@shared/**', group: 'internal', position: 'after' },
            { pattern: '@config/**', group: 'internal', position: 'after' },
            { pattern: '@schemas/**', group: 'internal', position: 'after' },
            { pattern: '@interfaces/**', group: 'internal', position: 'after' },
            { pattern: '@server/**', group: 'internal', position: 'after' }
          ],
          // "newlines-between": "always", // 不同组之间空一行
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
          endOfLine: 'lf'
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
  // TypeScript with type checking for ts-class-override (src, server, shared)
  {
    files: ['src/**/*.{ts,tsx}', 'server/**/*.ts', 'shared/**/*.{ts,tsx}'],
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/*.d.ts',
      '**/*.config.{ts,js,mjs}',
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
      '**/__tests__/**',
      '**/__mocks__/**'
    ],
    extends: [...configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { project: './tsconfig.json', tsconfigRootDir: __dirname }
    },
    plugins: { '@qlover-eslint': qloverEslint },
    rules: {
      '@qlover-eslint/ts-class-override': 'error',
      ...typeCheckedRulesOff
    }
  },
  // 为特定文件允许 default export
  {
    files: [
      'src/app/**/page.tsx',
      'src/app/**/layout.tsx',
      'src/app/**/not-found.tsx',
      'src/i18n/request.ts',
      'src/middleware.ts',
      'src/pages/**/*.tsx',
      'src/app/manifest.ts',
      'src/proxy.ts',
      '**/*.config.*'
    ],
    rules: {
      'import/no-default-export': 'off'
    }
  }
]);

export default eslintConfig;
