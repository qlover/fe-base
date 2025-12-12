import type { TSESLint } from '@typescript-eslint/utils';
import {
  tsClassMethodReturn,
  RULE_NAME as TS_CLASS_METHOD_RETURN
} from './rules/ts-class-method-return';
import {
  requireRootTestid,
  RULE_NAME as REQUIRE_ROOT_TESTID
} from './rules/require-root-testid';
import {
  tsClassMemberAccessibility,
  RULE_NAME as TS_CLASS_MEMBER_ACCESSIBILITY
} from './rules/ts-class-member-accessibility';

// Export utility functions for ESLint globals configuration
export {
  disableGlobals,
  restrictSpecificGlobals,
  restrictGlobals
} from './utils/globals-config';

export type {
  DisableGlobalsOptions,
  RestrictSpecificGlobalsOptions,
  RestrictGlobalsOptions
} from './utils/globals-config';

const configs: {
  recommended: TSESLint.Linter.ConfigType;
} = {
  recommended: {
    plugins: ['@qlover-eslint'],
    rules: {
      [`@qlover-eslint/${TS_CLASS_METHOD_RETURN}`]: 'error',
      [`@qlover-eslint/${REQUIRE_ROOT_TESTID}`]: 'error',
      [`@qlover-eslint/${TS_CLASS_MEMBER_ACCESSIBILITY}`]: 'error'
    }
  }
};

const rules = {
  [TS_CLASS_METHOD_RETURN]: tsClassMethodReturn,
  [REQUIRE_ROOT_TESTID]: requireRootTestid,
  [TS_CLASS_MEMBER_ACCESSIBILITY]: tsClassMemberAccessibility
} as const;

export default {
  configs,
  rules
};
