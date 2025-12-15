import js from '@eslint/js';
import globals from 'globals';
import vitest from 'eslint-plugin-vitest';
import qloverEslint, { restrictGlobals } from '@qlover/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
// import jsdoc from 'eslint-plugin-jsdoc';
import prettierConfig from './.prettierrc.js';

const allGlobals = {
  ...globals.browser,
  ...globals.vitest,
  ...vitest.environments.env.globals
};

/**
 * @type {import('eslint').Linter.Config[]}
 */
export default tseslint.config([
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      // TODO: open templates later(pnpm lint command very slow)
      'packages/**/templates/**'
    ]
  },

  {
    files: ['packages/**/*.{js,jsx,ts,tsx}', 'make/**/*.{js,jsx,ts,tsx}'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: {
        process: true,
        console: true
      }
    },
    plugins: {
      prettier: prettier
    },
    rules: {
      ...js.configs.recommended.rules,
      'prettier/prettier': ['error', prettierConfig],
      'spaced-comment': 'error'
    }
  },

  {
    files: ['packages/**/*.{ts,tsx}', 'make/**/*.{ts,tsx}'],
    extends: [...tseslint.configs.recommended],
    plugins: {
      '@qlover-eslint': qloverEslint,
      // TODO: open jsdoc later
      // jsdoc: jsdoc
    },
    rules: {
      '@qlover-eslint/ts-class-method-return': 'error',
      '@qlover-eslint/ts-class-member-accessibility': 'error',
      '@qlover-eslint/ts-require-override-comment': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  },

  // fe-corekit common
  restrictGlobals(
    {
      files: ['packages/fe-corekit/**/*.ts'],
      languageOptions: {
        globals: {
          ...globals.node
          // console: null
        }
      },
      rules: {}
    },
    {
      allowedGlobals: Object.keys(globals.node),
      allGlobals
    }
  ),

  // fe-corekit server
  restrictGlobals(
    {
      files: ['packages/corekit-node/**/*.ts'],
      languageOptions: {
        globals: globals.node
      },
      rules: {}
    },
    {
      allowedGlobals: Object.keys(globals.node),
      allGlobals
    }
  ),

  // react tsx
  {
    files: ['packages/**/*.{ts,tsx}'],
    ignores: ['packages/create-app/templates/next-app/src/app/**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ]
    }
  },

  // vitest
  restrictGlobals(
    {
      files: [
        'packages/**/__tests__/**/*.test.ts',
        'packages/**/__tests__/**/*.test.tsx'
      ],
      plugins: {
        vitest
      },
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node,
          ...vitest.environments.env.globals
        }
      },
      rules: {
        // Fix @typescript-eslint/no-unused-expressions rule configuration
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
        ...Object.keys(globals.browser),
        ...Object.keys(globals.node),
        ...Object.keys(vitest.environments.env.globals)
      ],
      allGlobals
    }
  )
]);
