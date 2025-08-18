import type { TSESLint } from '@typescript-eslint/utils';
import tsClassMethodReturn from './rules/ts-class-method-return.js';

const configs: {
  recommended: TSESLint.Linter.ConfigType;
} = {
  recommended: {
    plugins: ['@qlover-eslint'],
    rules: {
      '@qlover-eslint/ts-class-method-return': 'error'
    }
  }
};

const rules: {
  'ts-class-method-return': TSESLint.RuleModule<string, unknown[]>;
} = {
  'ts-class-method-return': tsClassMethodReturn
};

export default {
  configs,
  rules
};
