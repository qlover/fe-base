import type { TSESLint } from '@typescript-eslint/utils';
import {
  tsClassMethodReturn,
  RULE_NAME as TS_CLASS_METHOD_RETURN
} from './rules/ts-class-method-return';
import {
  requireRootTestid,
  RULE_NAME as REQUIRE_ROOT_TESTID
} from './rules/require-root-testid';

const configs: {
  recommended: TSESLint.Linter.ConfigType;
} = {
  recommended: {
    plugins: ['@qlover-eslint'],
    rules: {
      [`@qlover-eslint/${TS_CLASS_METHOD_RETURN}`]: 'error',
      [`@qlover-eslint/${REQUIRE_ROOT_TESTID}`]: 'error'
    }
  }
};

const rules = {
  [TS_CLASS_METHOD_RETURN]: tsClassMethodReturn,
  [REQUIRE_ROOT_TESTID]: requireRootTestid
} as const;

export default {
  configs,
  rules
};
