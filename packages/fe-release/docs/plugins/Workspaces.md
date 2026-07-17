## `Workspaces` (Module)

**Type:** `module Workspaces`

Monorepo workspace discovery and dependency-release tracking

First plugin in the default release pipeline. Detects which packages changed
relative to `sourceBranch`, resolves git tags for changelog baselines, and
optionally appends internal dependents as `dependencyRelease` workspaces.

Discovery flow (`onBefore`):

1. `getProjectWorkspaces()` — scan `packagesDirectories` or `find-workspaces`
2. `getChangedPackages()` — filter by git diff or `changeLabels`
3. `appendDependencyReleaseWorkspaces()` — append dependents via
   `@changesets/get-dependents-graph` when `includeDependencyReleases` is true
4. `getLastTagName()` — resolve per-workspace baseline tag for changelog generation
5. `context.setWorkspaces()` — publish final workspace list to [ReleaseContext](../implments/ReleaseContext.md#default-class)

`dependencyRelease` workspaces are consumed by [ChangesetVersion](./ChangesetVersion.md#changesetversion-module) and
[Github](./Github.md#github-module) to decide whether to generate changelogs, write changeset files,
or restore on-disk bumps after `changeset version`.

**Example:** Limit release to labeled packages

```bash
fe-release --workspaces.change-labels changes:@qlover/fe-release
```

**Example:** Disable dependent workspace appending

```json
{
  "release": {
    "workspaces": {
      "includeDependencyReleases": false
    }
  }
}
```

---

### `default` (Class)

**Type:** `class default`

Discovers changed monorepo packages and prepares [WorkspaceInterface](../interface/WorkspaceInterface.md#workspaceinterface-interface)
entries for downstream release plugins.

---

#### `constructor` (Constructor)

**Type:** `(context: ReleaseContext) => Workspaces`

#### Parameters

| Name      | Type             | Optional | Default | Since | Deprecated | Description |
| --------- | ---------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ReleaseContext` | ❌       | -       | -     | -          |             |

---

#### `nextSkipFlag` (Property)

**Type:** `boolean`

**Default:** `false`

When true, skip the next plugin hook invocation for this plugin instance.

Set after workspaces are resolved (for example when `workspaces` is
pre-configured) to prevent duplicate execution.

---

#### `releaseLabel` (Property)

**Type:** `ReleaseLabel`

---

#### `appendDependencyReleaseWorkspaces` (Method)

**Type:** `(sources: WorkspaceInterface[]) => Promise<WorkspaceInterface[]>`

#### Parameters

| Name      | Type                   | Optional | Default | Since | Deprecated | Description |
| --------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `sources` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `appendDependencyReleaseWorkspaces` (CallSignature)

**Type:** `Promise<WorkspaceInterface[]>`

#### Parameters

| Name      | Type                   | Optional | Default | Since | Deprecated | Description |
| --------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `sources` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `enabled` (Method)

**Type:** `(name: string, context: ReleaseContext) => boolean`

#### Parameters

| Name      | Type             | Optional | Default | Since | Deprecated | Description |
| --------- | ---------------- | -------- | ------- | ----- | ---------- | ----------- |
| `name`    | `string`         | ❌       | -       | -     | -          |             |
| `context` | `ReleaseContext` | ❌       | -       | -     | -          |             |

---

##### `enabled` (CallSignature)

**Type:** `boolean`

#### Parameters

| Name      | Type             | Optional | Default | Since | Deprecated | Description |
| --------- | ---------------- | -------- | ------- | ----- | ---------- | ----------- |
| `name`    | `string`         | ❌       | -       | -     | -          |             |
| `context` | `ReleaseContext` | ❌       | -       | -     | -          |             |

---

#### `generateTagName` (Method)

**Type:** `(workspace: WorkspaceInterface) => string`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---

##### `generateTagName` (CallSignature)

**Type:** `string`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---

#### `getChangedPackages` (Method)

**Type:** `(packagesPaths: string[], changeLabels: string[]) => Promise<string[]>`

#### Parameters

| Name            | Type       | Optional | Default | Since | Deprecated | Description |
| --------------- | ---------- | -------- | ------- | ----- | ---------- | ----------- |
| `packagesPaths` | `string[]` | ❌       | -       | -     | -          |             |
| `changeLabels`  | `string[]` | ✅       | -       | -     | -          |             |

---

##### `getChangedPackages` (CallSignature)

**Type:** `Promise<string[]>`

#### Parameters

| Name            | Type       | Optional | Default | Since | Deprecated | Description |
| --------------- | ---------- | -------- | ------- | ----- | ---------- | ----------- |
| `packagesPaths` | `string[]` | ❌       | -       | -     | -          |             |
| `changeLabels`  | `string[]` | ✅       | -       | -     | -          |             |

---

#### `getGitWorkspaces` (Method)

**Type:** `() => Promise<string[]>`

---

##### `getGitWorkspaces` (CallSignature)

**Type:** `Promise<string[]>`

---

#### `getLastTagName` (Method)

**Type:** `(workspace: WorkspaceInterface) => Promise<string \| undefined>`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---

##### `getLastTagName` (CallSignature)

**Type:** `Promise<string \| undefined>`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---

#### `getProjectWorkspaces` (Method)

**Type:** `() => WorkspaceInterface[]`

---

##### `getProjectWorkspaces` (CallSignature)

**Type:** `WorkspaceInterface[]`

---

#### `getWorkspaces` (Method)

**Type:** `() => Promise<WorkspaceInterface[]>`

---

##### `getWorkspaces` (CallSignature)

**Type:** `Promise<WorkspaceInterface[]>`

---

#### `nextSkip` (Method)

**Type:** `() => void`

---

##### `nextSkip` (CallSignature)

**Type:** `void`

Skip the next workspace

- has publishPath
- has workspace

---

#### `onBefore` (Method)

**Type:** `() => Promise<void>`

---

##### `onBefore` (CallSignature)

**Type:** `Promise<void>`

---

#### `readGithubEventBaseSha` (Method)

**Type:** `() => string \| undefined`

---

##### `readGithubEventBaseSha` (CallSignature)

**Type:** `string \| undefined`

---

#### `resolveCompareRef` (Method)

**Type:** `() => string`

---

##### `resolveCompareRef` (CallSignature)

**Type:** `string`

Left side of `git diff <compareRef>...HEAD` for changed package detection.

Priority:

1. Explicit `workspaces.compareRef` / `--workspaces.compare-ref`
2. Merged PR base SHA from `GITHUB_EVENT_PATH` (needed after merge-to-master,
   where `origin/master...HEAD` is empty)
3. `origin/<sourceBranch>`

---

#### `setWorkspaces` (Method)

**Type:** `(workspaces: WorkspaceInterface[]) => void`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `setWorkspaces` (CallSignature)

**Type:** `void`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `shouldIncludeDependencyReleases` (Method)

**Type:** `() => boolean`

---

##### `shouldIncludeDependencyReleases` (CallSignature)

**Type:** `boolean`

---

### `WorkspacesProps` (Interface)

**Type:** `interface WorkspacesProps`

---

#### `changeLabels` (Property)

**Type:** `string[]`

The change labels

from `changePackagesLabel`

---

#### `changePackagesLabel` (Property)

**Type:** `string`

**Default:** `'changes:${name}'`

Template for package change labels in monorepos

Core concept:
Defines the naming pattern for labels that identify
which packages have changed in monorepo releases,
enabling targeted review and deployment.

Label usage:

- Applied to PRs when specific packages change
- Enables package-specific review processes
- Supports selective deployment strategies
- Improves monorepo change tracking
- Facilitates team collaboration and review

Template variables:

- `${name}`: Package name for label identification

**Example:** Basic change label

```typescript
const config: FeReleaseConfig = {
  changePackagesLabel: 'changes:${name}'
};
```

**Example:** Custom change label

```typescript
const config: FeReleaseConfig = {
  changePackagesLabel: 'package:${name}'
};
```

---

#### `compareRef` (Property)

**Type:** `string`

Git ref used as the left side of `git diff <compareRef>...HEAD`
when detecting changed packages.

Defaults to `origin/<sourceBranch>`, then falls back to the merged PR base
SHA from `GITHUB_EVENT_PATH` when running after a GitHub Actions PR merge
into the same branch (where `origin/<sourceBranch>...HEAD` is empty).

**Example:**

```ts
`'abc1234'` or `'origin/master'`
```

---

#### `includeDependencyReleases` (Property)

**Type:** `boolean`

**Default:** `ts
true
`

Include internal dependents in the release workspace list.

When enabled (default), packages that depend on a changed source are appended
with `dependencyRelease: true`. This list is used for:

- changelog / version logging when `changesetVersion.ignoreNonUpdatedPackages`
  is `false`
- `git restore` targeting when `changesetVersion.ignoreNonUpdatedPackages`
  is `true`

---

#### `packagesDirectories` (Property)

**Type:** `string[]`

**Default:** `[]`

Directories containing packages for monorepo releases

Core concept:
Specifies the directories that contain packages for
monorepo release management, enabling selective
package discovery and release coordination.

Directory patterns:

- Supports glob patterns for flexible matching
- Enables selective package inclusion
- Supports nested directory structures
- Facilitates monorepo organization
- Enables workspace-specific configurations

Use cases:

- Monorepo package discovery
- Selective package releases
- Workspace-specific configurations
- Multi-package coordination
- Dependency-aware releases

**Example:** Basic package directories

```typescript
const config: FeReleaseConfig = {
  packagesDirectories: ['packages/*']
};
```

**Example:** Multiple package directories

```typescript
const config: FeReleaseConfig = {
  packagesDirectories: ['packages/*', 'apps/*', 'libs/*']
};
```

---

#### `skipCheckPackage` (Property)

**Type:** `boolean`

**Default:** `false`

Whether to skip checking the package.json file

---

#### `tagMatch` (Property)

**Type:** `string`

**Default:** `'${name}@*'`

Glob-style pattern for matching historical release tags

---

#### `tagTemplate` (Property)

**Type:** `string`

**Default:** `'${name}@${version}'`

Template for generating release tag names after version bump

Template variables support [WorkspaceInterface](../interface/WorkspaceInterface.md#workspaceinterface-interface) properties.

---
