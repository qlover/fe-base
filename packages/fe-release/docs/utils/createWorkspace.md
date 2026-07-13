## `createWorkspace` (Module)

**Type:** `module createWorkspace`

Workspace factory and path helpers for fe-release

Replaces the legacy `WorkspaceCreator` module. Provides utilities to:

- Resolve `package.json` paths inside a monorepo root
- Read workspace manifests from disk
- Build <a href="../implments/WorkspaceValue.md#workspacevalue-module" class="tsd-kind-module">WorkspaceValue</a> instances for plugins
- Format workspace names and version summaries for logging

**Example:** Create a workspace from a relative path

```typescript
const workspace = createWorkspaceValue({
  path: 'packages/fe-release',
  rootPath: process.cwd()
});
```

---

### `WorkspaceManifestSource` (TypeAlias)

**Type:** `Object`

---

#### `manifest_path` (Property)

**Type:** `string`

**Default:** `package.json`

---

#### `path` (Property)

**Type:** `string`

Relative path from monorepo root to the workspace directory

---

#### `root` (Property)

**Type:** `string`

Absolute workspace root; derived from `rootPath` + `path` when omitted

---

#### `rootPath` (Property)

**Type:** `string`

Monorepo root used to resolve relative `path` values

---

### `WorkspacePackageOnDisk` (TypeAlias)

**Type:** `Object`

---

#### `manifestPath` (Property)

**Type:** `string`

---

#### `packageJson` (Property)

**Type:** `Record<string, unknown>`

---

#### `packagePath` (Property)

**Type:** `string`

---

#### `root` (Property)

**Type:** `string`

---

#### `version` (Property)

**Type:** `string`

---

### `createWorkspaceValue` (Function)

**Type:** `(workspace: Partial<WorkspaceValue> & WorkspaceManifestSource) => WorkspaceValue`

#### Parameters

| Name        | Type                                                | Optional | Default | Since | Deprecated | Description |
| ----------- | --------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `Partial<WorkspaceValue> & WorkspaceManifestSource` | ❌       | -       | -     | -          |             |

---

#### `createWorkspaceValue` (CallSignature)

**Type:** `WorkspaceValue`

Build a <a href="../implments/WorkspaceValue.md#workspacevalue-class" class="tsd-kind-class">WorkspaceValue</a> from partial workspace data and disk manifest.

Reads `package.json` from disk when `packageJson` is not provided.

**Throws:**

Error when `path` is missing

#### Parameters

| Name        | Type                                                | Optional | Default | Since | Deprecated | Description |
| ----------- | --------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `Partial<WorkspaceValue> & WorkspaceManifestSource` | ❌       | -       | -     | -          |             |

---

### `readJson` (Function)

**Type:** `(path: string) => Record<string, unknown>`

#### Parameters

| Name   | Type     | Optional | Default | Since | Deprecated | Description |
| ------ | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `path` | `string` | ❌       | -       | -     | -          |             |

---

#### `readJson` (CallSignature)

**Type:** `Record<string, unknown>`

#### Parameters

| Name   | Type     | Optional | Default | Since | Deprecated | Description |
| ------ | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `path` | `string` | ❌       | -       | -     | -          |             |

---

### `readWorkspacePackageFromDisk` (Function)

**Type:** `(options: WorkspaceManifestSource) => WorkspacePackageOnDisk`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `WorkspaceManifestSource` | ❌       | -       | -     | -          |             |

---

#### `readWorkspacePackageFromDisk` (CallSignature)

**Type:** `WorkspacePackageOnDisk`

Read workspace package.json from disk without creating a WorkspaceValue.

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `WorkspaceManifestSource` | ❌       | -       | -     | -          |             |

---

### `resolveWorkspacePackagePath` (Function)

**Type:** `(options: WorkspaceManifestSource) => Pick<WorkspacePackageOnDisk, "root" \| "packagePath" \| "manifestPath">`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `WorkspaceManifestSource` | ❌       | -       | -     | -          |             |

---

#### `resolveWorkspacePackagePath` (CallSignature)

**Type:** `Pick<WorkspacePackageOnDisk, "root" \| "packagePath" \| "manifestPath">`

Resolve absolute workspace root and package.json path from manifest source options.

**Throws:**

Error when `path` is missing

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `WorkspaceManifestSource` | ❌       | -       | -     | -          |             |

---

### `shouldProcessWorkspace` (Function)

**Type:** `(workspace: WorkspaceInterface, ignoreNonUpdatedPackages: boolean) => boolean`

#### Parameters

| Name                       | Type                 | Optional | Default | Since | Deprecated | Description |
| -------------------------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace`                | `WorkspaceInterface` | ❌       | -       | -     | -          |             |
| `ignoreNonUpdatedPackages` | `boolean`            | ❌       | -       | -     | -          |             |

---

#### `shouldProcessWorkspace` (CallSignature)

**Type:** `boolean`

Whether a workspace should participate in changelog/changeset processing.

Returns `false` when `ignoreNonUpdatedPackages` is enabled and the workspace
is a `dependencyRelease` entry (restore-only tracking).

#### Parameters

| Name                       | Type                 | Optional | Default | Since | Deprecated | Description |
| -------------------------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace`                | `WorkspaceInterface` | ❌       | -       | -     | -          |             |
| `ignoreNonUpdatedPackages` | `boolean`            | ❌       | -       | -     | -          |             |

---

### `worksapce2name` (Function)

**Type:** `(worksapce: Pick<WorkspaceInterface, "version" \| "name">) => string`

#### Parameters

| Name        | Type                                            | Optional | Default | Since | Deprecated | Description |
| ----------- | ----------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `worksapce` | `Pick<WorkspaceInterface, "version" \| "name">` | ❌       | -       | -     | -          |             |

---

#### `worksapce2name` (CallSignature)

**Type:** `string`

Format a workspace as `name@version`.

**Example:**

```
pkgname@1.1.0
```

#### Parameters

| Name        | Type                                            | Optional | Default | Since | Deprecated | Description |
| ----------- | ----------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `worksapce` | `Pick<WorkspaceInterface, "version" \| "name">` | ❌       | -       | -     | -          |             |

---

### `workspaceVersionSummary` (Function)

**Type:** `(workspace: WorkspaceInterface) => string`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---

#### `workspaceVersionSummary` (CallSignature)

**Type:** `string`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---
