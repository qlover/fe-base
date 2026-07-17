import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import qloverEslint, { restrictSpecificGlobals } from '@qlover/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintTsconfig = './tsconfig.eslint.json';

const eslintConfig = defineConfig([
  globalIgnores([
    'node_modules/**',
    'dist/**',
    'build/**',
    'config/**',
    'babel.config.js',
    'postcss.config.js',
    'project.config.json',
    'project.private.config.json',
    'eslint.config.mjs'
  ]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.extends(
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended'
  ),
  {
    files: ['**/*.{ts,tsx}'],
    ...reactHooks.configs.flat.recommended,
    ...reactRefresh.configs.vite
  },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname
      }
    }
  },
  {
    plugins: {
      'unused-imports': unusedImports,
      '@qlover-eslint': qloverEslint
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: eslintTsconfig,
          alwaysTryTypes: false
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
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'off',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
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
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
            'object',
            'type'
          ],
          pathGroups: [
            { pattern: '@/**', group: 'internal', position: 'after' },
            { pattern: '@schemas/**', group: 'internal', position: 'after' },
            { pattern: '@interfaces/**', group: 'internal', position: 'after' }
          ],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          }
        }
      ],
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'none',
          endOfLine: 'lf',
          printWidth: 80
        },
        {
          usePrettierrc: false
        }
      ],
      'import/no-default-export': 'error',
      '@typescript-eslint/no-empty-object-type': 'off',
      'import/no-unresolved': 'off'
    }
  },
  {
    files: ['src/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXExpressionContainer > JSXEmptyExpression',
          message:
            'Avoid JSX block comments `{/* ... */}` and empty JSX expressions; use file-top JSDoc or line comments outside JSX.'
        }
      ]
    }
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.d.ts',
      '**/*.config.{ts,js,mjs}',
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
      '**/__tests__/**',
      '**/__mocks__/**'
    ],
    languageOptions: {
      parserOptions: {
        project: eslintTsconfig,
        tsconfigRootDir: __dirname
      }
    },
    plugins: { '@qlover-eslint': qloverEslint },
    rules: {
      '@qlover-eslint/ts-class-override': 'error',
      '@typescript-eslint/no-empty-object-type': 'off'
    }
  },
  // Mini-program: ban direct browser globals under src
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
      message: '❌ Prefer Taro APIs / injected services over browser globals.'
    }
  ),
  {
    files: [
      'src/app.tsx',
      'src/app.config.ts',
      'src/globals.ts',
      'src/pages/**/*.config.ts',
      'src/pages/**/*.tsx'
    ],
    rules: {
      'no-restricted-globals': 'off'
    }
  },
  {
    files: [
      'src/app.tsx',
      'src/app.config.ts',
      'src/pages/**/*.tsx',
      'src/pages/**/*.config.ts'
    ],
    rules: {
      'import/no-default-export': 'off',
      'import/no-named-export': 'error',
      'import/prefer-default-export': 'error'
    }
  },
  {
    files: ['*.config.*', '**/*.config.*'],
    rules: {
      'import/no-default-export': 'off'
    }
  }
]);

export default eslintConfig;
