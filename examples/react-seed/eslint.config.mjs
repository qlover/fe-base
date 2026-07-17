import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import qloverEslint from '@qlover/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import importPlugin from 'eslint-plugin-import-x';
import prettierPlugin from 'eslint-plugin-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintTsconfig = './tsconfig.eslint.json';

const eslintConfig = defineConfig([
  globalIgnores([
    'node_modules/**',
    'dist/**',
    'build/**',
    'vitests.config.ts',
    'vitest.config.*',
    'vite.config.*',
    'eslint.config.mjs'
  ]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    ...reactHooks.configs.flat.recommended,
    ...reactRefresh.configs.vite
  },
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        sourceType: 'module'
      }
    },
    plugins: {
      'unused-imports': unusedImports,
      // Register as `import` so existing `import/*` rule names stay unchanged
      import: importPlugin,
      prettier: prettierPlugin,
      '@qlover-eslint': qloverEslint
    },
    settings: {
      // import-x reads `import-x/*` settings even when registered as `import`
      'import-x/resolver': {
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
            { pattern: '@shared/**', group: 'internal', position: 'after' },
            { pattern: '@config/**', group: 'internal', position: 'after' },
            { pattern: '@schemas/**', group: 'internal', position: 'after' },
            { pattern: '@interfaces/**', group: 'internal', position: 'after' },
            { pattern: '@server/**', group: 'internal', position: 'after' }
          ],
          // Allow pathGroups to remapped unresolved aliases (e.g. @config/*)
          pathGroupsExcludedImportTypes: [],
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
          endOfLine: 'lf'
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
    files: ['src/**/*.{ts,tsx}', 'config/**/*.{ts,tsx}'],
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
      parser: tseslint.parser,
      parserOptions: {
        project: eslintTsconfig,
        tsconfigRootDir: __dirname,
        sourceType: 'module'
      }
    },
    plugins: { '@qlover-eslint': qloverEslint },
    rules: {
      '@qlover-eslint/ts-class-override': 'error',
      '@typescript-eslint/no-empty-object-type': 'off'
    }
  },
  {
    files: [
      'src/pages/**/*.tsx',
      'src/App.tsx',
      '**/*.config.*',
      'config/mock/user.ts'
    ],
    rules: {
      'import/no-default-export': 'off'
    }
  },
  eslintConfigPrettier
]);

export default eslintConfig;
