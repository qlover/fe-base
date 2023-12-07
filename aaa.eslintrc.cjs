module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },

  extends: [
    "standard",
    "plugin:prettier/recommended",
    "eslint-config-standard-with-typescript",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["unused-imports", "@typescript-eslint", "prettier"],
  ignorePatterns: ["*.d.ts"],
  rules: {
    "prettier/prettier": "error",
    // 未使用的声明
    "no-unused-vars": "off", // or "@typescript-eslint/no-unused-vars": "off",
    "unused-imports/no-unused-imports": "error",
    // 禁用 useEffect dep 监听警告
    "react-hooks/exhaustive-deps": 0,
    "no-use-before-define": "error",
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          ["internal", "parent", "sibling", "index"],
          "unknown",
        ],
        pathGroups: [
          {
            pattern: "@app/**",
            group: "external",
            position: "after",
          },
        ],
        pathGroupsExcludedImportTypes: ["builtin"],
        "newlines-between": "always",
      },
    ],
  },
};
