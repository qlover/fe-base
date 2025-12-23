## `CommanderArgs` (Module)

**Type:** `module CommanderArgs`

Command-line argument processing utilities

This module provides utilities for processing and transforming
command-line arguments from Commander.js into structured objects.
It supports dot notation for nested properties and common prefix
grouping.

Core Features:

- Dot notation support
- Common prefix grouping
- Deep object creation
- Type-safe processing

**Example:** Basic usage

```typescript
const args = {
  verbose: true,
  'config.port': 3000,
  'config.host': 'localhost'
};

const processed = reduceOptions(args);
// {
//   verbose: true,
//   config: {
//     port: 3000,
//     host: 'localhost'
//   }
// }
```

**Example:** With common prefix

```typescript
const args = {
  verbose: true,
  port: 3000
};

const processed = reduceOptions(args, 'options');
// {
//   options: {
//     verbose: true,
//     port: 3000
//   }
// }
```

---

### `reduceOptions` (Function)

**Type:** `(opts: OptionValues, commonKey: string) => OptionValues`

#### Parameters

| Name        | Type           | Optional | Default | Since | Deprecated | Description                               |
| ----------- | -------------- | -------- | ------- | ----- | ---------- | ----------------------------------------- |
| `opts`      | `OptionValues` | ❌       | -       | -     | -          | Raw options from Commander.js             |
| `commonKey` | `string`       | ✅       | -       | -     | -          | Optional prefix for non-nested properties |

---

#### `reduceOptions` (CallSignature)

**Type:** `OptionValues`

Processes Commander.js options into a structured object

Takes raw options from Commander.js and transforms them into a
structured object, handling dot notation for nested properties
and optional common prefix grouping.

Features:

- Dot notation parsing (e.g., 'config.port' → { config: { port: value } })
- Common prefix grouping (e.g., { port: 3000 } → { common: { port: 3000 } })
- Deep object creation with lodash/set
- Preserves value types

**Returns:**

Processed options object

**Example:** Basic dot notation

```typescript
const args = {
  'server.port': 3000,
  'server.host': 'localhost',
  verbose: true
};

const result = reduceOptions(args);
// {
//   server: {
//     port: 3000,
//     host: 'localhost'
//   },
//   verbose: true
// }
```

**Example:** With common prefix

```typescript
const args = {
  'config.debug': true,
  port: 3000,
  host: 'localhost'
};

const result = reduceOptions(args, 'server');
// {
//   config: {
//     debug: true
//   },
//   server: {
//     port: 3000,
//     host: 'localhost'
//   }
// }
```

#### Parameters

| Name        | Type           | Optional | Default | Since | Deprecated | Description                               |
| ----------- | -------------- | -------- | ------- | ----- | ---------- | ----------------------------------------- |
| `opts`      | `OptionValues` | ❌       | -       | -     | -          | Raw options from Commander.js             |
| `commonKey` | `string`       | ✅       | -       | -     | -          | Optional prefix for non-nested properties |

---
