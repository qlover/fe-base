import type { TSESLint } from '@typescript-eslint/utils';
import tsClassMethodReturn, {
  RULE_NAME
} from './rules/ts-class-method-return';

const configs: {
  recommended: TSESLint.Linter.ConfigType;
} = {
  recommended: {
    plugins: ['@qlover-eslint'],
    rules: {
      [`@qlover-eslint/${RULE_NAME}`]: 'error'
    }
  }
};

const rules = {
  [RULE_NAME]: tsClassMethodReturn
} as const;

export default {
  configs,
  rules
};
