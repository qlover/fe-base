## `src/utils/globals-config` (Module)

**Type:** `module src/utils/globals-config`

---

### `DisableGlobalsOptions` (Interface)

**Type:** `interface DisableGlobalsOptions`

Configuration options for disabling specific global variables

This interface is used with
`disableGlobals`
function to configure which global
variables should be disabled in ESLint configuration.

---

#### `disabledGlobals` (Property)

**Type:** `string[]`

**Default:** `[]`

List of global variable names to disable

These global variables will be set to
`'off'`
in ESLint's
`languageOptions.globals`
,
which means ESLint will not recognize them as valid globals and will report
errors if they are used without declaration.

**Example:**

```typescript
disabledGlobals: ['window', 'document', 'localStorage'];
```

---

### `RestrictGlobalsOptions` (Interface)

**Type:** `interface RestrictGlobalsOptions`

Configuration options for restricting globals (whitelist mode)

This interface is used with
`restrictGlobals`
function to configure which
global variables are allowed. All global variables not in the allowed list
will be restricted.

---

#### `allGlobals` (Property)

**Type:** `Record<string, unknown>`

**Default:** `Extracted from `

All browser global variables (e.g., globals.browser)

This should contain all the global variables that are available in the environment.
If not provided, the function will automatically extract them from

`config.languageOptions.globals`
.

It's recommended to let the function extract from
`config.languageOptions.globals`

automatically, but you can provide this explicitly if needed.

**Example:**

```typescript
import globals from 'globals';
allGlobals: globals.browser;
```

---

#### `allowedGlobals` (Property)

**Type:** `string[]`

**Default:** `[]`

List of global variable names that are allowed

Only these global variables will be allowed. All other global variables
(from
`allGlobals`
or
`config.languageOptions.globals`
) will be restricted.
This is a whitelist approach - everything is restricted except what's explicitly allowed.

**Example:**

```typescript
allowedGlobals: ['console', 'setTimeout', 'clearTimeout'];
```

---

#### `customMessages` (Property)

**Type:** `Record<string, string>`

**Default:** `{}`

Custom messages for specific global variables

Allows you to provide different error messages for different global variables.
The key is the global variable name, and the value is the custom error message
that will be shown when that specific variable is used.

These custom messages take precedence over the
`message`
option.

**Example:**

```typescript
customMessages: {
  window: 'Do not use window object directly, use global window from @/core/globals',
  document: 'Do not use document directly, use global document from @/core/globals',
  localStorage: 'Do not use localStorage directly, use storage from @/core/globals'
}
```

---

#### `message` (Property)

**Type:** `string \| Object`

**Default:** `'Do not use ${name} directly, import from @/core/globals or use an allowed alternative'`

Custom error message template or function

Supports two formats:

- String template with
  `${name}`
  placeholder that will be replaced with the variable name
- Function that receives the variable name and returns a custom message

If not provided, a default message will be used.

**Example:**

```typescript
// String template
message: 'Do not use ${name} directly, import from @/core/globals';

// Function
message: (name) =>
  `Global variable "${name}" is not allowed, use allowed alternatives`;
```

---

### `RestrictSpecificGlobalsOptions` (Interface)

**Type:** `interface RestrictSpecificGlobalsOptions`

Configuration options for restricting specific global variables (blacklist mode)

This interface is used with
`restrictSpecificGlobals`
function to configure
which specific global variables should be restricted. Only the specified
variables will be restricted, all others remain allowed.

---

#### `customMessages` (Property)

**Type:** `Record<string, string>`

**Default:** `{}`

Custom messages for specific global variables

Allows you to provide different error messages for different global variables.
The key is the global variable name, and the value is the custom error message
that will be shown when that specific variable is used.

These custom messages take precedence over the
`message`
option.

**Example:**

```typescript
customMessages: {
  window: 'Do not use window object directly, use global window from @/core/globals',
  document: 'Do not use document directly, use global document from @/core/globals'
}
```

---

#### `message` (Property)

**Type:** `string \| Object`

**Default:** `'Do not use ${name} directly, import from @/core/globals or use an allowed alternative'`

Custom error message template or function

Supports two formats:

- String template with
  `${name}`
  placeholder that will be replaced with the variable name
- Function that receives the variable name and returns a custom message

If not provided, a default message will be used.

**Example:**

```typescript
// String template
message: 'Do not use ${name} directly, import from @/core/globals';

// Function
message: (name) => `Global variable "${name}" is not allowed`;
```

---

#### `restrictedGlobals` (Property)

**Type:** `string[]`

**Default:** `[]`

List of global variable names to restrict

Only these specified variables will be restricted. All other global variables
will remain allowed. This is useful when you only want to restrict a few
specific globals rather than restricting everything.

**Example:**

```typescript
restrictedGlobals: ['window', 'document', 'localStorage'];
```

---

### `disableGlobals` (Function)

**Type:** `(config: Config<RulesRecord>, options: DisableGlobalsOptions) => Linter.Config`

#### Parameters

| Name      | Type                    | Optional | Default | Since | Deprecated | Description                           |
| --------- | ----------------------- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `config`  | `Config<RulesRecord>`   | ❌       | -       | -     | -          | ESLint configuration object to modify |
| `options` | `DisableGlobalsOptions` | ✅       | `{}`    | -     | -          | Configuration options                 |

---

#### `disableGlobals` (CallSignature)

**Type:** `Linter.Config`

Disable specific global variables using ESLint's native globals configuration

This is the most concise way to disable global variables. It directly sets
the specified globals to
`'off'`
in ESLint's
`languageOptions.globals`
,
which means ESLint will not recognize them as valid globals and will report
errors if they are used without declaration.

**Use cases:**

- When you want to completely disable certain browser globals
- When you want ESLint to treat these variables as undefined
- When you prefer ESLint's native globals configuration over rules

**Comparison with other functions:**

- `disableGlobals`
  : Sets globals to
  `'off'`
- ESLint won't recognize them at all
- `restrictSpecificGlobals`
  : Uses
  `no-restricted-globals`
  rule - allows custom error messages
- `restrictGlobals`
  : Whitelist mode - restricts everything except allowed ones

**Returns:**

Modified ESLint configuration object with disabled globals set to
`'off'`

**Example:** Basic usage

```typescript
import globals from 'globals';
import { disableGlobals } from '@your-plugin/utils';

export default disableGlobals(
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    rules: {}
  },
  {
    disabledGlobals: ['window', 'document', 'localStorage']
  }
);
```

**Example:** Disable multiple globals

```typescript
disableGlobals(config, {
  disabledGlobals: [
    'window',
    'document',
    'localStorage',
    'sessionStorage',
    'navigator'
  ]
});
```

#### Parameters

| Name      | Type                    | Optional | Default | Since | Deprecated | Description                           |
| --------- | ----------------------- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `config`  | `Config<RulesRecord>`   | ❌       | -       | -     | -          | ESLint configuration object to modify |
| `options` | `DisableGlobalsOptions` | ✅       | `{}`    | -     | -          | Configuration options                 |

---

### `restrictGlobals` (Function)

**Type:** `(config: Config<RulesRecord>, options: RestrictGlobalsOptions) => Linter.Config`

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                           |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `config`  | `Config<RulesRecord>`    | ❌       | -       | -     | -          | ESLint configuration object to modify |
| `options` | `RestrictGlobalsOptions` | ✅       | `{}`    | -     | -          | Configuration options                 |

---

#### `restrictGlobals` (CallSignature)

**Type:** `Linter.Config`

Automatically generate no-restricted-globals rule to restrict all browser global variables
that are not explicitly allowed (whitelist mode)

This function implements a whitelist approach: it restricts all global variables except
those explicitly listed in
`allowedGlobals`
. It automatically extracts all available
globals from the configuration and restricts everything that's not in the allowed list.

**Use cases:**

- When you want to restrict most globals and only allow a few (whitelist approach)
- When you want to enforce using alternatives (e.g., import from @/core/globals) for most globals
- When you want to automatically restrict all browser globals except a small allowed set

**Comparison with other functions:**

- `disableGlobals`
  : Sets globals to
  `'off'`
- ESLint won't recognize them at all
- `restrictSpecificGlobals`
  : Blacklist mode - only restricts specified ones
- `restrictGlobals`
  : Whitelist mode - restricts everything except allowed ones

**Returns:**

Modified ESLint configuration object with
`no-restricted-globals`
rule configured

**Example:** Basic usage (recommended - auto-extract from config)

```typescript
import globals from 'globals';
import { restrictGlobals } from '@your-plugin/utils';

export default restrictGlobals(
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    rules: {}
  },
  {
    allowedGlobals: ['console', 'setTimeout', 'clearTimeout'],
    message: 'Do not use ${name} directly, import from @/core/globals'
  }
);
```

**Example:** With custom messages for specific variables

```typescript
restrictGlobals(config, {
  allowedGlobals: ['console', 'setTimeout'],
  message: 'Do not use ${name}',
  customMessages: {
    window: 'Do not use window, import from @/core/globals',
    document: 'Do not use document, import from @/core/globals',
    localStorage: 'Do not use localStorage, use storage from @/core/globals'
  }
});
```

**Example:** Using function for message

```typescript
restrictGlobals(config, {
  allowedGlobals: ['console'],
  message: (name) =>
    `Global variable "${name}" is not allowed. Use alternative from @/core/globals`
});
```

**Example:** Explicitly providing allGlobals

```typescript
import globals from 'globals';

restrictGlobals(config, {
  allowedGlobals: ['console'],
  allGlobals: globals.browser
});
```

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                           |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `config`  | `Config<RulesRecord>`    | ❌       | -       | -     | -          | ESLint configuration object to modify |
| `options` | `RestrictGlobalsOptions` | ✅       | `{}`    | -     | -          | Configuration options                 |

---

### `restrictSpecificGlobals` (Function)

**Type:** `(config: Config<RulesRecord>, options: RestrictSpecificGlobalsOptions) => Linter.Config`

#### Parameters

| Name      | Type                             | Optional | Default | Since | Deprecated | Description                           |
| --------- | -------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `config`  | `Config<RulesRecord>`            | ❌       | -       | -     | -          | ESLint configuration object to modify |
| `options` | `RestrictSpecificGlobalsOptions` | ✅       | `{}`    | -     | -          | Configuration options                 |

---

#### `restrictSpecificGlobals` (CallSignature)

**Type:** `Linter.Config`

Restrict specific browser global variables (blacklist mode, using no-restricted-globals rule)

This function restricts only the specified global variables while allowing all others.
It uses ESLint's
`no-restricted-globals`
rule, which provides better error messages
compared to
`disableGlobals`
.

**Use cases:**

- When you only want to restrict a few specific globals (blacklist approach)
- When you need custom error messages for restricted globals
- When you want to guide developers to use alternatives (e.g., import from @/core/globals)

**Comparison with other functions:**

- `disableGlobals`
  : Sets globals to
  `'off'`
- ESLint won't recognize them at all
- `restrictSpecificGlobals`
  : Uses
  `no-restricted-globals`
  rule - only restricts specified ones
- `restrictGlobals`
  : Whitelist mode - restricts everything except allowed ones

**Returns:**

Modified ESLint configuration object with
`no-restricted-globals`
rule configured

**Example:** Basic usage with custom message

```typescript
import globals from 'globals';
import { restrictSpecificGlobals } from '@your-plugin/utils';

export default restrictSpecificGlobals(
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    rules: {}
  },
  {
    restrictedGlobals: ['window', 'document', 'localStorage'],
    message: 'Do not use ${name} directly, import from @/core/globals'
  }
);
```

**Example:** With custom messages for specific variables

```typescript
restrictSpecificGlobals(config, {
  restrictedGlobals: ['window', 'document', 'localStorage'],
  message: 'Do not use ${name} directly',
  customMessages: {
    window:
      'Do not use window object directly, use global window from @/core/globals',
    document:
      'Do not use document directly, use global document from @/core/globals',
    localStorage:
      'Do not use localStorage directly, use storage from @/core/globals'
  }
});
```

**Example:** Using function for message

```typescript
restrictSpecificGlobals(config, {
  restrictedGlobals: ['window', 'document'],
  message: (name) =>
    `Global variable "${name}" is restricted. Use alternative from @/core/globals`
});
```

#### Parameters

| Name      | Type                             | Optional | Default | Since | Deprecated | Description                           |
| --------- | -------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `config`  | `Config<RulesRecord>`            | ❌       | -       | -     | -          | ESLint configuration object to modify |
| `options` | `RestrictSpecificGlobalsOptions` | ✅       | `{}`    | -     | -          | Configuration options                 |

---
