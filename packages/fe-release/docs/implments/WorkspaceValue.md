## `WorkspaceValue` (Module)

**Type:** `module WorkspaceValue`

Concrete [WorkspaceInterface](../interface/WorkspaceInterface.md#workspaceinterface-interface) implementation for release plugins

Holds resolved disk paths (`packagePath`, `manifestPath`) in addition to the
standard workspace fields used across the release pipeline.

Use createWorkspaceValue for construction from monorepo paths, or
[WorkspaceValue.toWorkspace](#toworkspace-method) when all fields are already known.

---

### `WorkspaceValue` (Class)

**Type:** `class WorkspaceValue`

Mutable workspace record used throughout the release pipeline.

[toString](#tostring-method) produces a debug-friendly summary including `(DEP)` for
dependency-release entries and optional tag/version fields.

---

#### `constructor` (Constructor)

**Type:** `(options: WorkspaceValueOptions) => WorkspaceValue`

#### Parameters

| Name      | Type                    | Optional | Default | Since | Deprecated | Description |
| --------- | ----------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `WorkspaceValueOptions` | ❌       | -       | -     | -          |             |

---

#### `changelog` (Property)

**Type:** `string`

The changelog of the workspace

---

#### `dependencyRelease` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Whether this workspace is an internal dependent bumped only because a
dependency was released (not directly changed in git).

Set by the Workspaces plugin when `includeDependencyReleases` is enabled.
Processing rules depend on `changesetVersion.ignoreNonUpdatedPackages`:

- `false`: included in changelog template flow and version bump logs
- `true`: tracked for restore only; skipped in changelog generation

---

#### `dependencyReleaseOf` (Property)

**Type:** `string`

Package name of the direct dependency that caused this `dependencyRelease`.

Set by Workspaces when appending dependents. ChangesetVersion uses it after
`changeset version` to fill `dependencyReleaseTemplate` with the source's
real `newVersion`.

---

#### `lastTag` (Property)

**Type:** `string`

Previous release tag used as the git changelog baseline

---

#### `manifestPath` (Property)

**Type:** `string`

**Default:** `MANIFEST_PATH`

---

#### `name` (Property)

**Type:** `string`

Package name from package.json

---

#### `newVersion` (Property)

**Type:** `string`

Version after `changeset version`, read from package.json on disk.

- Before bump: usually undefined
- After bump: latest version on disk; may equal `version` if unchanged

---

#### `packageJson` (Property)

**Type:** `PackageJson`

The package.json of the workspace

---

#### `packagePath` (Property)

**Type:** `string`

**Default:** `''`

---

#### `path` (Property)

**Type:** `string`

The relative path of the workspace

---

#### `root` (Property)

**Type:** `string`

The absolute path of the workspace

---

#### `tagName` (Property)

**Type:** `string`

Release tag name after version bump (for example `pkg@1.0.1`).

Set by ChangesetVersion.mergeWorkspaces only when `newVersion` differs
from `version`. Not available before `changeset version` completes.

---

#### `version` (Property)

**Type:** `string`

Current version from package.json before bump

---

#### `toString` (Method)

**Type:** `() => string`

---

##### `toString` (CallSignature)

**Type:** `string`

Debug representation for logging workspace lists during release.

---

#### `toWorkspace` (Method)

**Type:** `(workspace: WorkspaceValueOptions) => WorkspaceValue`

#### Parameters

| Name        | Type                    | Optional | Default | Since | Deprecated | Description |
| ----------- | ----------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceValueOptions` | ❌       | -       | -     | -          |             |

---

##### `toWorkspace` (CallSignature)

**Type:** `WorkspaceValue`

#### Parameters

| Name        | Type                    | Optional | Default | Since | Deprecated | Description |
| ----------- | ----------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceValueOptions` | ❌       | -       | -     | -          |             |

---

### `WorkspaceValueOptions` (TypeAlias)

**Type:** `WorkspaceInterface & Object`

---
