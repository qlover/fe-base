import { ESLintUtils } from '@typescript-eslint/utils';

export const createEslintRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/qlover/fe-base/blob/master/packages/eslint-plugin/docs/rules/${name}.md`
);
