/**
 * Prettier config. Self-contained so this seed works standalone.
 * Base options match repo root .prettierrc.js so "prettier" at root and
 * "eslint --fix" here stay in sync when used inside fe-base.
 * @type {import('prettier').Options}
 */
export default {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'none',
  bracketSpacing: true,
  bracketSameLine: true,
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: [
    '<BUILTIN_MODULES>',
    '<THIRD_PARTY_MODULES>',
    '^@plasmo/(.*)$',
    '^@plasmohq/(.*)$',
    '^~(.*)$',
    '^[./]'
  ]
};
