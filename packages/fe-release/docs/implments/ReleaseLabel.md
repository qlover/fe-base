## `ReleaseLabel` (Module)

**Type:** `module ReleaseLabel`

Release label management and file change detection

This module provides utilities for managing release labels and detecting
which packages have changed based on file paths. It supports custom
comparison logic and label formatting.

Core Features:

- File change detection
- Package path matching
- Label generation
- Custom comparison logic

**Example:** Basic usage

```typescript
const label = new ReleaseLabel({
  changePackagesLabel: 'changed:${name}',
  packagesDirectories: ['packages/a', 'packages/b']
});

// Find changed packages
const changed = label.pick(['packages/a/src/index.ts']);
// ['packages/a']

// Generate labels
const labels = label.toChangeLabels(changed);
// ['changed:packages/a']
```

**Example:** Custom comparison

```typescript
const label = new ReleaseLabel({
  changePackagesLabel: 'changed:${name}',
  packagesDirectories: ['packages/a'],
  compare: (file, pkg) => file.includes(pkg)
});

const changed = label.pick(['src/packages/a/index.ts']);
// ['packages/a']
```

---

### `ReleaseLabel` (Class)

**Type:** `class ReleaseLabel`

Core class for managing release labels and change detection

Provides utilities for detecting changed packages and generating
appropriate labels. Supports custom comparison logic and label
formatting.

Features:

- File change detection
- Package path matching
- Label generation
- Custom comparison logic

**Example:** Basic usage

```typescript
const label = new ReleaseLabel({
  changePackagesLabel: 'changed:${name}',
  packagesDirectories: ['packages/a', 'packages/b']
});

// Find changed packages
const changed = label.pick(['packages/a/src/index.ts']);

// Generate labels
const labels = label.toChangeLabels(changed);
```

**Example:** Custom comparison

```typescript
const label = new ReleaseLabel({
  changePackagesLabel: 'changed:${name}',
  packagesDirectories: ['packages/a'],
  compare: (file, pkg) => file.includes(pkg)
});

const changed = label.pick(['src/packages/a/index.ts']);
```

---

#### `new ReleaseLabel` (Constructor)

**Type:** `(options: ReleaseLabelOptions) => ReleaseLabel`

#### Parameters

| Name      | Type                  | Optional | Default | Since | Deprecated | Description                                |
| --------- | --------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `options` | `ReleaseLabelOptions` | ❌       | -       | -     | -          | Configuration options for label management |

---

#### `compare` (Method)

**Type:** `(changedFilePath: string, packagePath: string) => boolean`

#### Parameters

| Name              | Type     | Optional | Default | Since | Deprecated | Description                          |
| ----------------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------------ |
| `changedFilePath` | `string` | ❌       | -       | -     | -          | Path of the changed file             |
| `packagePath`     | `string` | ❌       | -       | -     | -          | Path of the package to check against |

---

##### `compare` (CallSignature)

**Type:** `boolean`

Compares a changed file path against a package path

Uses custom comparison function if provided, otherwise
checks if the file path starts with the package path.

**Returns:**

True if the file belongs to the package

**Example:**

```typescript
// Default comparison
label.compare('packages/a/src/index.ts', 'packages/a');
// true

// Custom comparison
const label = new ReleaseLabel({
  ...options,
  compare: (file, pkg) => file.includes(pkg)
});
label.compare('src/packages/a/index.ts', 'packages/a');
// true
```

#### Parameters

| Name              | Type     | Optional | Default | Since | Deprecated | Description                          |
| ----------------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------------ |
| `changedFilePath` | `string` | ❌       | -       | -     | -          | Path of the changed file             |
| `packagePath`     | `string` | ❌       | -       | -     | -          | Path of the package to check against |

---

#### `pick` (Method)

**Type:** `(changedFiles: string[] \| Set<string>, packages: string[]) => string[]`

#### Parameters

| Name           | Type                      | Optional | Default | Since | Deprecated | Description                              |
| -------------- | ------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `changedFiles` | `string[] \| Set<string>` | ❌       | -       | -     | -          | Array or Set of changed file paths       |
| `packages`     | `string[]`                | ✅       | `[]`    | -     | -          | Optional array of package paths to check |

---

##### `pick` (CallSignature)

**Type:** `string[]`

Identifies packages affected by changed files

Checks each changed file against package paths to determine
which packages have been modified.

**Returns:**

Array of affected package paths

**Example:**

```typescript
// Check against default packages
label.pick(['packages/a/src/index.ts']);
// ['packages/a']

// Check specific packages
label.pick(
  ['packages/a/index.ts', 'packages/b/test.ts'],
  ['packages/a', 'packages/c']
);
// ['packages/a']

// Using Set of files
label.pick(new Set(['packages/a/index.ts']));
// ['packages/a']
```

#### Parameters

| Name           | Type                      | Optional | Default | Since | Deprecated | Description                              |
| -------------- | ------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `changedFiles` | `string[] \| Set<string>` | ❌       | -       | -     | -          | Array or Set of changed file paths       |
| `packages`     | `string[]`                | ✅       | `[]`    | -     | -          | Optional array of package paths to check |

---

#### `toChangeLabel` (Method)

**Type:** `(packagePath: string, label: string) => string`

#### Parameters

| Name          | Type     | Optional | Default | Since | Deprecated | Description                    |
| ------------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `packagePath` | `string` | ❌       | -       | -     | -          | Path of the package            |
| `label`       | `string` | ✅       | -       | -     | -          | Optional custom label template |

---

##### `toChangeLabel` (CallSignature)

**Type:** `string`

Generates a change label for a single package

Replaces ${name} placeholder in the label template with
the package path.

**Returns:**

Formatted change label

**Example:**

```typescript
// Default label template
label.toChangeLabel('packages/a');
// 'changed:packages/a'

// Custom label template
label.toChangeLabel('packages/a', 'modified:${name}');
// 'modified:packages/a'
```

#### Parameters

| Name          | Type     | Optional | Default | Since | Deprecated | Description                    |
| ------------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `packagePath` | `string` | ❌       | -       | -     | -          | Path of the package            |
| `label`       | `string` | ✅       | -       | -     | -          | Optional custom label template |

---

#### `toChangeLabels` (Method)

**Type:** `(packages: string[], label: string) => string[]`

#### Parameters

| Name       | Type       | Optional | Default | Since | Deprecated | Description                    |
| ---------- | ---------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `packages` | `string[]` | ❌       | -       | -     | -          | Array of package paths         |
| `label`    | `string`   | ✅       | -       | -     | -          | Optional custom label template |

---

##### `toChangeLabels` (CallSignature)

**Type:** `string[]`

Generates change labels for multiple packages

Maps each package path to a formatted change label.

**Returns:**

Array of formatted change labels

**Example:**

```typescript
// Default label template
label.toChangeLabels(['packages/a', 'packages/b']);
// ['changed:packages/a', 'changed:packages/b']

// Custom label template
label.toChangeLabels(['packages/a', 'packages/b'], 'modified:${name}');
// ['modified:packages/a', 'modified:packages/b']
```

#### Parameters

| Name       | Type       | Optional | Default | Since | Deprecated | Description                    |
| ---------- | ---------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `packages` | `string[]` | ❌       | -       | -     | -          | Array of package paths         |
| `label`    | `string`   | ✅       | -       | -     | -          | Optional custom label template |

---

### `ReleaseLabelOptions` (Interface)

**Type:** `interface ReleaseLabelOptions`

---

#### `changePackagesLabel` (Property)

**Type:** `string`

The change packages label

---

#### `compare` (Property)

**Type:** `ReleaseLabelCompare`

---

#### `packagesDirectories` (Property)

**Type:** `string[]`

The packages directories

---

### `ReleaseLabelCompare` (TypeAlias)

**Type:** `Object`

Function type for custom file path comparison

Used to determine if a changed file belongs to a package.
Default implementation checks if the file path starts with
the package path.

**Returns:**

True if the file belongs to the package

---
