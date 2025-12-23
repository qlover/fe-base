## `src/utils/pather` (Module)

**Type:** `module src/utils/pather`

---

### `Pather` (Class)

**Type:** `class Pather`

Cross-platform path utility

Significance: Provides reliable path normalization and comparison across Windows & POSIX.
Core idea: Always operate on a fully normalized local-style path before any comparison.
Main function: Convert mixed style paths to the host format and expose helpers such as

`startsWith`
,
`containsPath`
, and
`isSubPath`
.
Main purpose: Make path handling predictable in toolchains that manipulate both Windows
and POSIX paths.

**Example:**

```ts
const pather = new Pather();
pather.isSubPath('src\\utils', 'src'); // true on every platform
```

---

#### `new Pather` (Constructor)

**Type:** `() => Pather`

---

#### `containsPath` (Method)

**Type:** `(sourcePath: string, targetPath: string) => boolean`

#### Parameters

| Name         | Type     | Optional | Default | Since | Deprecated | Description        |
| ------------ | -------- | -------- | ------- | ----- | ---------- | ------------------ |
| `sourcePath` | `string` | ❌       | -       | -     | -          | Path to search in  |
| `targetPath` | `string` | ❌       | -       | -     | -          | Path to search for |

---

##### `containsPath` (CallSignature)

**Type:** `boolean`

Segment-aware path containment check

Checks if sourcePath contains targetPath as a complete path segment.
Unlike simple substring matching, this ensures proper path boundaries.
For example, 'src/abc' does not contain 'src/a' even though 'src/a'
is a substring.

Features:

- Cross-platform path handling
- Proper segment boundary checking
- Trailing separator normalization
- Exact match support

**Returns:**

True if sourcePath contains targetPath as a segment

**Example:** Basic usage

```typescript
const pather = new Pather();

pather.containsPath('src/utils/file.ts', 'utils'); // true
pather.containsPath('src/utils/file.ts', 'src/utils'); // true
pather.containsPath('src/utils/file.ts', 'til'); // false
```

**Example:** Segment boundaries

```typescript
pather.containsPath('src/abc/file.ts', 'src/a'); // false
pather.containsPath('src/abc/file.ts', 'src/abc'); // true
```

**Example:** Trailing separators

```typescript
pather.containsPath('src/utils/', 'utils'); // true
pather.containsPath('src/utils', 'utils/'); // true
pather.containsPath('src/utils/', 'utils/'); // true
```

#### Parameters

| Name         | Type     | Optional | Default | Since | Deprecated | Description        |
| ------------ | -------- | -------- | ------- | ----- | ---------- | ------------------ |
| `sourcePath` | `string` | ❌       | -       | -     | -          | Path to search in  |
| `targetPath` | `string` | ❌       | -       | -     | -          | Path to search for |

---

#### `isSubPath` (Method)

**Type:** `(sourcePath: string, targetPath: string) => boolean`

#### Parameters

| Name         | Type     | Optional | Default | Since | Deprecated | Description                     |
| ------------ | -------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `sourcePath` | `string` | ❌       | -       | -     | -          | string - Candidate child path.  |
| `targetPath` | `string` | ❌       | -       | -     | -          | string - Candidate parent path. |

---

##### `isSubPath` (CallSignature)

**Type:** `boolean`

Check if
`sourcePath`
is inside (or equal to)
`targetPath`
.
The comparison is segment-aware so
`src/ab`
is **not** considered inside
`src/a`
.

**Returns:**

boolean Whether
`sourcePath`
is within
`targetPath`
.

#### Parameters

| Name         | Type     | Optional | Default | Since | Deprecated | Description                     |
| ------------ | -------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `sourcePath` | `string` | ❌       | -       | -     | -          | string - Candidate child path.  |
| `targetPath` | `string` | ❌       | -       | -     | -          | string - Candidate parent path. |

---

#### `startsWith` (Method)

**Type:** `(sourcePath: string, targetPath: string) => boolean`

#### Parameters

| Name         | Type     | Optional | Default | Since | Deprecated | Description          |
| ------------ | -------- | -------- | ------- | ----- | ---------- | -------------------- |
| `sourcePath` | `string` | ❌       | -       | -     | -          | Path to check        |
| `targetPath` | `string` | ❌       | -       | -     | -          | Prefix path to match |

---

##### `startsWith` (CallSignature)

**Type:** `boolean`

Normalized path prefix check

Checks if sourcePath starts with targetPath after normalization.
Handles cross-platform path separators and trailing separators.

**Returns:**

True if sourcePath starts with targetPath

**Example:** Basic usage

```typescript
const pather = new Pather();

pather.startsWith('src/utils/file.ts', 'src'); // true
pather.startsWith('src\\utils\\file.ts', 'src'); // true
pather.startsWith('lib/utils/file.ts', 'src'); // false
```

**Example:** Trailing separators

```typescript
pather.startsWith('src/utils', 'src/'); // true
pather.startsWith('src/utils/', 'src'); // true
pather.startsWith('src2/utils', 'src'); // false
```

#### Parameters

| Name         | Type     | Optional | Default | Since | Deprecated | Description          |
| ------------ | -------- | -------- | ------- | ----- | ---------- | -------------------- |
| `sourcePath` | `string` | ❌       | -       | -     | -          | Path to check        |
| `targetPath` | `string` | ❌       | -       | -     | -          | Prefix path to match |

---

#### `toLocalPath` (Method)

**Type:** `(sourcePath: string) => string`

#### Parameters

| Name         | Type     | Optional | Default | Since | Deprecated | Description                 |
| ------------ | -------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `sourcePath` | `string` | ❌       | -       | -     | -          | string - Path to normalize. |

---

##### `toLocalPath` (CallSignature)

**Type:** `string`

Convert any style path (Windows / POSIX / mixed) to the current platform format.

- Replaces every
  `/`
  ,
  `\\`
  ,
  `//`
  , etc. with the local
  `path.sep`
  .
- Collapses duplicate separators.
- Resolves
  `.`
  and
  `..`
  via
  `path.normalize`
  .

**Returns:**

string The normalized local path.

**Example:**

```ts
const pather = new Pather();
pather.toLocalPath('src\\a//b');
// => 'src/a/b' on POSIX, 'src\\a\\b' on Windows
```

#### Parameters

| Name         | Type     | Optional | Default | Since | Deprecated | Description                 |
| ------------ | -------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `sourcePath` | `string` | ❌       | -       | -     | -          | string - Path to normalize. |

---
