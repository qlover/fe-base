## `@qlover-eslint` (Module)

**Type:** `module @qlover-eslint`

ESLint plugin providing TypeScript and React-specific linting rules for code quality and consistency

This plugin provides a set of ESLint rules designed to enforce code quality, consistency,
and best practices in TypeScript and React projects. The rules focus on:

- Type safety and explicit type declarations
- Code clarity and maintainability
- Testing support and accessibility
- Consistent coding patterns

## Purpose

The primary goals of this plugin are:

1. **Enforce explicit code contracts**: Require explicit type annotations and accessibility modifiers
   to make code intent clear and prevent accidental errors
2. **Improve code maintainability**: Enforce consistent patterns that make code easier to understand
   and maintain over time
3. **Support testing**: Ensure components have proper test identifiers for reliable testing
4. **Prevent common mistakes**: Catch potential issues early through static analysis

## Rules Overview

###

`ts-class-member-accessibility`

Requires explicit accessibility modifiers (
`public`
,
`private`
,
`protected`
) on all class members.
This makes code intent explicit and prevents accidental public exposure of internal members.

**Use case**: Enforce Java/C#-style explicit visibility declarations for better code clarity.

###

`ts-class-method-return`

Ensures class methods have explicit return type annotations. This improves code clarity and
makes method contracts explicit.

**Use case**: Require explicit return types to prevent accidental return type changes and
improve IDE autocomplete.

###

`ts-class-override`

Requires
`@override`
JSDoc comments on methods that override parent methods or implement
interface methods. This makes method relationships explicit and helps catch errors when
parent methods are renamed or removed.

**Use case**: Similar to Java's
`@Override`
annotation, makes inheritance relationships explicit.

###

`require-root-testid`

Enforces the presence of
`data-testid`
attribute on root elements of TSX components.
This is essential for reliable testing and element selection in test suites.

**Use case**: Ensure all components have test identifiers for automated testing.

## Utility Functions

### Global Variable Configuration

The plugin provides utility functions for managing browser global variables in ESLint configuration:

- `disableGlobals`
  : Disable specific global variables using ESLint's native globals configuration
- `restrictSpecificGlobals`
  : Restrict specific globals using
  `no-restricted-globals`
  rule (blacklist mode)
- `restrictGlobals`
  : Restrict all globals except allowed ones (whitelist mode)

**Use case**: Control which browser globals are allowed, encouraging the use of alternatives
(e.g., importing from
`@/core/globals`
instead of using
`window`
directly).

## Basic Usage

### Installation

```bash
npm install --save-dev @qlover/eslint-plugin
```

### Configuration

In your ESLint configuration file (e.g.,
`eslint.config.js`
):

```javascript
import qloverPlugin from '@qlover/eslint-plugin';

export default [
  {
    plugins: {
      '@qlover-eslint': qloverPlugin
    },
    ...qloverPlugin.configs.recommended
  }
];
```

### Using Individual Rules

```javascript
export default [
  {
    plugins: {
      '@qlover-eslint': qloverPlugin
    },
    rules: {
      '@qlover-eslint/ts-class-member-accessibility': 'error',
      '@qlover-eslint/ts-class-method-return': 'error',
      '@qlover-eslint/ts-class-override': 'error',
      '@qlover-eslint/require-root-testid': 'error'
    }
  }
];
```

### Using Utility Functions

```javascript
import { restrictGlobals } from '@qlover/eslint-plugin';
import globals from 'globals';

export default [
  restrictGlobals(
    {
      files: ['src/**/*.{ts,tsx}'],
      languageOptions: { globals: globals.browser },
      rules: {}
    },
    {
      allowedGlobals: ['console', 'setTimeout'],
      message: 'Do not use ${name} directly, import from @/core/globals'
    }
  )
];
```

## Recommended Configuration

The plugin provides a
`recommended`
configuration that enables all rules with sensible defaults.
This is a good starting point for most projects:

```javascript
import qloverPlugin from '@qlover/eslint-plugin';

export default [...qloverPlugin.configs.recommended];
```

## When to Use This Plugin

This plugin is particularly useful for:

- **Large TypeScript projects** where code consistency is critical
- **Teams migrating from Java/C#** who want similar explicit visibility patterns
- **Projects with strict type safety requirements**
- **React projects** that need reliable test identifiers
- **Projects using global variable injection** patterns (via utility functions)

## Related Documentation

- [Rule Documentation](./docs/rules/)

**See:**

[ESLint Plugin Documentation](https://eslint.org/docs/latest/extend/plugins)

---
