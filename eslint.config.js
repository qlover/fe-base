import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import vitest from '@vitest/eslint-plugin';
import qloverEslint, { restrictGlobals } from '@qlover/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from './.prettierrc.js';

const allGlobals = {
  ...globals.browser,
  ...globals.vitest,
  ...vitest.environments.env.globals
};

const nodeGlobals = Object.keys(globals.node);

// Ignore patterns for packages/*.ts when using type-checked config (exclude tests, configs)
const packageTsIgnores = [
  '**/dist/**',
  '**/build/**',
  '**/ts-build/**',
  '**/node_modules/**',
  '**/.nx/**',
  '**/.cache/**',
  '**/coverage/**',
  '**/*.d.ts',
  '**/templates/**',
  '**/tsup.config.ts',
  '**/vite.config.ts',
  '**/vitest.config.ts',
  '**/*.test.ts',
  '**/__mocks__/**',
  '**/__tests__/**',
  '**/*.spec.ts'
];

// Turn off type-checked rules we don't need (only enable ts-class-override)
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
  '@typescript-eslint/no-duplicate-type-constituents': 'off'
};

export default defineConfig([
  globalIgnores([
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/ts-build/**',
    '**/node_modules/**',
    '**/.nx/**',
    '**/.cache/**',
    '**/coverage/**',
    '**/*.d.ts',
    'examples'
  ]),

  {
    name: 'lint-general-js',
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended],
    languageOptions: { globals: { process: true, console: true } },
    plugins: { prettier },
    rules: {
      'prettier/prettier': ['error', prettierConfig],
      'spaced-comment': 'error'
    }
  },

  {
    name: 'lint-general-ts',
    files: ['**/*.{ts,tsx}'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname }
    },
    plugins: {
      '@qlover-eslint': qloverEslint,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...qloverEslint.configs.recommended.rules,
      '@qlover-eslint/require-root-testid': [
        'error',
        { exclude: '/Provider$/' }
      ],
      '@qlover-eslint/ts-class-override': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
          fixStyle: 'separate-type-imports'
        }
      ],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/require-await': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ]
    }
  },

  // Type-checked only for ts-class-override (packages/*.ts, excluding tests/configs)
  {
    name: 'lint-ts-class-override',
    files: ['packages/**/*.ts'],
    ignores: packageTsIgnores,
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: { '@qlover-eslint': qloverEslint },
    rules: {
      '@qlover-eslint/ts-class-override': 'error',
      ...typeCheckedRulesOff
    }
  },

  {
    name: 'lint-tools',
    files: ['tools/**/*.{ts,tsx}', '**/tsup.config.ts'],
    extends: [...tseslint.configs.recommended],
    languageOptions: { globals: globals.node },
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  },

  restrictGlobals(
    {
      name: 'lint-vitest',
      files: [
        'packages/**/__tests__/**/*.{ts,tsx}',
        'packages/**/__mocks__/**/*.{ts,tsx}'
      ],
      extends: [...tseslint.configs.recommended],
      plugins: { vitest },
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node,
          ...vitest.environments.env.globals
        }
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/no-unused-expressions': [
          'error',
          {
            allowShortCircuit: true,
            allowTernary: true,
            allowTaggedTemplates: true
          }
        ]
      }
    },
    {
      allowedGlobals: [
        ...nodeGlobals,
        ...Object.keys(globals.browser),
        ...Object.keys(vitest.environments.env.globals),
        'expectTypeOf'
      ],
      allGlobals
    }
  )
]);
