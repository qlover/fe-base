import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import qloverEslint from '@qlover/eslint-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended' // 添加 prettier 推荐配置
  ),
  {
    ignores: [
      // dependencies
      'node_modules/**',
      '.pnp/**',
      '.pnp.js',

      // testing
      'coverage/**',
      'test-results/**',

      // next.js
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',

      // misc
      '*.pem',

      // debug
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',

      // env files
      '.env*',

      // vercel
      '.vercel/**',

      // typescript
      '*.tsbuildinfo',
      'next-env.d.ts',

      // cache
      '.cache/**',
      '.eslintcache',

      // IDE
      '.idea/**',
      '.vscode/**',

      // package manager
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',

      // config files
      '*.config.js',
      '*.config.mjs',
      '*.config.cjs',
      'postcss.config.*',
      'tailwind.config.*',
      'next.config.*',
      'jest.config.*',
      'babel.config.*',

      // static assets
      'public/**',
      '**/*.min.js',
      '**/*.bundle.js',
      '**/vendor/**',

      // generated files
      'coverage/**',
      '.nyc_output/**',
      'storybook-static/**'
    ]
  },
  {
    plugins: {
      'unused-imports': unusedImports,
      import: importPlugin,
      prettier: prettierPlugin,
      '@qlover-eslint': qloverEslint
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json'
        }
      }
    },
    rules: {
      '@qlover-eslint/ts-class-method-return': 'error',
      '@qlover-eslint/require-root-testid': 'error',
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
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'after'
            },
            {
              pattern: '@migrations/**',
              group: 'internal',
              position: 'after'
            },
            {
              pattern: '@config/**',
              group: 'internal',
              position: 'after'
            }
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
      'import/no-default-export': 'error',
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
];

export default eslintConfig;