import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import qloverLint, { restrictSpecificGlobals } from '@qlover/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite
    ],
    plugins: {
      import: importPlugin
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    }
  },
  {
    files: ['src/**/*.{ts,tsx}'], // 只针对 src 目录
    plugins: {
      import: importPlugin,
      '@qlover-eslint': qloverLint
    },
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.app.json'], // 只使用 tsconfig.app.json
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      '@qlover-eslint/ts-class-override': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
          fixStyle: 'separate-type-imports'
        }
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'type'
          ],
          pathGroupsExcludedImportTypes: ['type'],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal'
            }
          ],
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          }
        }
      ]
    }
  },
  // 为测试文件单独配置
  {
    files: [
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
      '__tests__/**/*.{ts,tsx}'
    ],

    languageOptions: {
      globals: {
        ...globals.vitest,
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        project: ['./tsconfig.test.json'], // 使用 tsconfig.node.json 或创建 tsconfig.test.json
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
          fixStyle: 'separate-type-imports'
        }
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'type'
          ],
          pathGroupsExcludedImportTypes: ['type'],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal'
            }
          ],
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          }
        }
      ]
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
      ]
    }
  ),
  // 为特定文件允许使用全局变量
  {
    files: ['src/main.tsx', 'src/globals.ts'],
    rules: {
      'no-restricted-globals': 'off'
    }
  },
  // 为特定文件允许 default export
  {
    files: ['src/pages/**/*.tsx', 'src/App.tsx', 'vite.config.ts'],
    rules: {
      'import/no-default-export': 'off',
      'import/no-named-export': 'error',
      'import/prefer-default-export': 'error'
    }
  }
]);
