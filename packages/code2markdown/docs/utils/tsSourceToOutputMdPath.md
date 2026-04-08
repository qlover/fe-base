## `src/utils/tsSourceToOutputMdPath` (Module)

**Type:** `module src/utils/tsSourceToOutputMdPath`

---

### `relativeHrefBetweenOutputMdFiles` (Function)

**Type:** `(fromOutputMd: string, toOutputMd: string) => string`

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description |
| -------------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `fromOutputMd` | `string` | ❌       | -       | -     | -          |             |
| `toOutputMd`   | `string` | ❌       | -       | -     | -          |             |

---

#### `relativeHrefBetweenOutputMdFiles` (CallSignature)

**Type:** `string`

Relative href from one output .md file to another (POSIX-style, `./` when needed).

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description |
| -------------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `fromOutputMd` | `string` | ❌       | -       | -     | -          |             |
| `toOutputMd`   | `string` | ❌       | -       | -     | -          |             |

---

### `removeEntryPrefixFromPath` (Function)

**Type:** `(filePath: string, sourcePath: undefined \| string) => string`

#### Parameters

| Name         | Type                  | Optional | Default | Since | Deprecated | Description |
| ------------ | --------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `filePath`   | `string`              | ❌       | -       | -     | -          |             |
| `sourcePath` | `undefined \| string` | ❌       | -       | -     | -          |             |

---

#### `removeEntryPrefixFromPath` (CallSignature)

**Type:** `string`

Strip the configured entry root from a source path (mirrors Formats.removeEntryPrefix).

#### Parameters

| Name         | Type                  | Optional | Default | Since | Deprecated | Description |
| ------------ | --------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `filePath`   | `string`              | ❌       | -       | -     | -          |             |
| `sourcePath` | `undefined \| string` | ❌       | -       | -     | -          |             |

---

### `tsSourcePathToOutputMdPath` (Function)

**Type:** `(filePath: string, options: Object) => string`

#### Parameters

| Name                   | Type      | Optional | Default | Since | Deprecated | Description |
| ---------------------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `filePath`             | `string`  | ❌       | -       | -     | -          |             |
| `options`              | `Object`  | ❌       | -       | -     | -          |             |
| `options.removePrefix` | `boolean` | ✅       | -       | -     | -          |             |
| `options.sourcePath`   | `string`  | ✅       | -       | -     | -          |             |

---

#### `tsSourcePathToOutputMdPath` (CallSignature)

**Type:** `string`

Map a TypeScript source path to the relative markdown output path (as used under generatePath).

#### Parameters

| Name                   | Type      | Optional | Default | Since | Deprecated | Description |
| ---------------------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `filePath`             | `string`  | ❌       | -       | -     | -          |             |
| `options`              | `Object`  | ❌       | -       | -     | -          |             |
| `options.removePrefix` | `boolean` | ✅       | -       | -     | -          |             |
| `options.sourcePath`   | `string`  | ✅       | -       | -     | -          |             |

---
