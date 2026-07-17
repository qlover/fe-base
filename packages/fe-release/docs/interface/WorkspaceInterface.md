## `WorkspaceInterface` (Module)

**Type:** `module WorkspaceInterface`

Core data model for a monorepo package in a release run

Represents one publishable workspace discovered by the [Workspaces](../plugins/Workspaces.md#workspaces-module)
plugin and passed through [ChangesetVersion](../plugins/ChangesetVersion.md#changesetversion-module) and [Github](../plugins/Github.md#github-module).

Typical lifecycle fields:

- `version` / `newVersion` — before and after `changeset version`
- `lastTag` — git baseline for changelog generation
- `dependencyRelease` — internal dependent bumped only because a dependency changed

---

### `WorkspaceInterface` (Interface)

**Type:** `interface WorkspaceInterface`

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
