import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
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
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@qlover-eslint': qloverLint
    },
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      '@qlover-eslint/ts-class-override': 'error'
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
        'history'
      ],
      // message: '❌ see(./docs/zh/why-no-globals.md)'
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
      // 强制 pages 必须使用 default export，禁止 named export
      'import/no-named-export': 'error',
      // 建议使用 default export
      'import/prefer-default-export': 'error'
    }
  }
]);
