## `ChangesetVersion` (Module)

**Type:** `module ChangesetVersion`

Changelog generation and changeset version/publish plugin

Second plugin in the default release pipeline (after [Workspaces](./Workspaces.md#workspaces-module),
before [Github](./Github.md#github-module)). Bridges git-based changelog formatting with the
Changesets CLI for monorepo version bumps.

Pipeline phases:

- **onBefore**: validate `.changeset` directory; validate `NPM_TOKEN` when mode includes publish
- **onExec**: generate per-workspace git changelogs (skips `dependencyRelease`
  when `ignoreNonUpdatedPackages` is enabled)
- **onSuccess**: run version and/or publish flow based on `mode`

Publish flow (`mode: 'publish'` or second half of `'both'`):

1. Run `changeset publish` (npm publish + local `git tag` for public packages)
2. Sync workspaces from disk so `tagName` is set from the release version
3. Create local tags for `private` packages (changesets skips tagging them)
4. Push `workspace.tagName` refs that exist locally to `origin`

Version flow (`mode: 'version'` or first half of `'both'`):

1. Write `.changeset/*.md` files for directly changed packages only
2. Run `changeset version` (optionally with `changelog: false` when `onlyVersion`)
3. Optionally `git restore` dependency-release paths when `ignoreNonUpdatedPackages`
4. Sync workspace `newVersion` / `tagName` from disk via `mergeWorkspaces`

**Example:** Version-only release

```typescript
// fe-config.json
{
  "release": {
    "changesetVersion": {
      "mode": "version",
      "increment": "patch"
    }
  }
}
```

**Example:** Ignore internal dependent bumps

```bash
fe-release --changesetVersion.ignore-non-updated-packages
```

**See:**

[ChangesetVersionProps.ignoreNonUpdatedPackages](#ignorenonupdatedpackages-property) for dependency-release behavior

---

### `default` (Class)

**Type:** `class default`

Manages changelog generation, changeset file creation, and Changesets CLI execution.

Coordinates with [Workspaces](./Workspaces.md#workspaces-module) for workspace discovery and
`dependencyRelease` tagging. Downstream [Github](./Github.md#github-module) consumes enriched
changelogs and bumped versions produced here.

---

#### `constructor` (Constructor)

**Type:** `(context: ReleaseContext, props: ChangesetVersionProps) => ChangesetVersion`

#### Parameters

| Name      | Type                    | Optional | Default | Since | Deprecated | Description |
| --------- | ----------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ReleaseContext`        | ❌       | -       | -     | -          |             |
| `props`   | `ChangesetVersionProps` | ✅       | `{}`    | -     | -          |             |

---

#### `changesetConfigPath` (Accessor)

**Type:** `accessor changesetConfigPath`

---

#### `changesetRoot` (Accessor)

**Type:** `accessor changesetRoot`

---

#### `ignoreNonUpdatedPackages` (Accessor)

**Type:** `accessor ignoreNonUpdatedPackages`

---

#### `mode` (Accessor)

**Type:** `accessor mode`

---

#### `collectPushableReleaseTags` (Method)

**Type:** `(workspaces: WorkspaceInterface[]) => string[]`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `collectPushableReleaseTags` (CallSignature)

**Type:** `string[]`

Collect tag names that should be pushed after `changeset publish`.

Includes public packages (tagged by changesets) and private packages
(tagged by [ensurePrivateReleaseTags](#ensureprivatereleasetags-method)). Skips dependency-release
workspaces.

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `ensurePrivateReleaseTags` (Method)

**Type:** `(workspaces: WorkspaceInterface[]) => Promise<void>`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `ensurePrivateReleaseTags` (CallSignature)

**Type:** `Promise<void>`

Create local git tags for private packages after `changeset publish`.

Changesets skips npm publish and tagging for `private: true` packages.
Release still needs those tags as changelog baselines, so create them here.

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `generateChangelog` (Method)

**Type:** `(workspace: WorkspaceInterface) => Promise<WorkspaceInterface>`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---

##### `generateChangelog` (CallSignature)

**Type:** `Promise<WorkspaceInterface>`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---

#### `generateChangesetFile` (Method)

**Type:** `(workspace: WorkspaceInterface) => Promise<void>`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---

##### `generateChangesetFile` (CallSignature)

**Type:** `Promise<void>`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

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

#### `getChangelogWithGit` (Method)

**Type:** `(tagName: string, dir: string) => Promise<string[]>`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description |
| --------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `tagName` | `string` | ❌       | -       | -     | -          |             |
| `dir`     | `string` | ❌       | -       | -     | -          |             |

---

##### `getChangelogWithGit` (CallSignature)

**Type:** `Promise<string[]>`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description |
| --------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `tagName` | `string` | ❌       | -       | -     | -          |             |
| `dir`     | `string` | ❌       | -       | -     | -          |             |

---

#### `getIncrement` (Method)

**Type:** `() => string`

---

##### `getIncrement` (CallSignature)

**Type:** `string`

---

#### `getIncrementLabels` (Method)

**Type:** `() => string[]`

---

##### `getIncrementLabels` (CallSignature)

**Type:** `string[]`

Labels that can override semver increment.

Prefer explicit `workspaces.changeLabels`, then fall back to the PR labels
from `GITHUB_EVENT_PATH` when running in GitHub Actions after a PR merge.

---

#### `getProcessableWorkspaces` (Method)

**Type:** `(workspaces: WorkspaceInterface[]) => WorkspaceInterface[]`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `getProcessableWorkspaces` (CallSignature)

**Type:** `WorkspaceInterface[]`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `listLocalTags` (Method)

**Type:** `() => Promise<Set<string>>`

---

##### `listLocalTags` (CallSignature)

**Type:** `Promise<Set<string>>`

List local git tag names (short refs under `refs/tags/`).

---

#### `logDryRun` (Method)

**Type:** `(message: string) => void`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description |
| --------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `message` | `string` | ❌       | -       | -     | -          |             |

---

##### `logDryRun` (CallSignature)

**Type:** `void`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description |
| --------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `message` | `string` | ❌       | -       | -     | -          |             |

---

#### `mergeWorkspaces` (Method)

**Type:** `(workspaces: WorkspaceInterface[]) => WorkspaceInterface[]`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `mergeWorkspaces` (CallSignature)

**Type:** `WorkspaceInterface[]`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `onBefore` (Method)

**Type:** `() => Promise<void>`

---

##### `onBefore` (CallSignature)

**Type:** `Promise<void>`

---

#### `onExec` (Method)

**Type:** `(_context: ReleaseContext) => Promise<void>`

#### Parameters

| Name       | Type             | Optional | Default | Since | Deprecated | Description |
| ---------- | ---------------- | -------- | ------- | ----- | ---------- | ----------- |
| `_context` | `ReleaseContext` | ❌       | -       | -     | -          |             |

---

##### `onExec` (CallSignature)

**Type:** `Promise<void>`

#### Parameters

| Name       | Type             | Optional | Default | Since | Deprecated | Description |
| ---------- | ---------------- | -------- | ------- | ----- | ---------- | ----------- |
| `_context` | `ReleaseContext` | ❌       | -       | -     | -          |             |

---

#### `onSuccess` (Method)

**Type:** `() => Promise<void>`

---

##### `onSuccess` (CallSignature)

**Type:** `Promise<void>`

---

#### `printWorksapces` (Method)

**Type:** `() => void`

---

##### `printWorksapces` (CallSignature)

**Type:** `void`

---

#### `pushWorkspaceReleaseTags` (Method)

**Type:** `(workspaces: WorkspaceInterface[]) => Promise<void>`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `pushWorkspaceReleaseTags` (CallSignature)

**Type:** `Promise<void>`

Push release tags from synced workspaces' `tagName` fields.

After [syncWorkspaces](#syncworkspaces-method) and [ensurePrivateReleaseTags](#ensureprivatereleasetags-method), push
tags that exist as local refs. Missing public-package tags are skipped
(changeset may have skipped publish); they are not invented here.

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `readGithubEventLabelNames` (Method)

**Type:** `() => string[]`

---

##### `readGithubEventLabelNames` (CallSignature)

**Type:** `string[]`

---

#### `refreshDependencyReleaseChangelogs` (Method)

**Type:** `(workspaces: WorkspaceInterface[]) => WorkspaceInterface[]`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `refreshDependencyReleaseChangelogs` (CallSignature)

**Type:** `WorkspaceInterface[]`

Rebuild `dependencyRelease` changelogs after source packages have `newVersion`.

Workspaces appends dependents before `changeset version`, so the template can
only use a provisional version. Once mergeWorkspaces reads bumped versions
from disk, rewrite each dependent changelog with the real source bump.

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `restoreIgnorePackages` (Method)

**Type:** `() => Promise<void>`

---

##### `restoreIgnorePackages` (CallSignature)

**Type:** `Promise<void>`

---

#### `runChangesetPublish` (Method)

**Type:** `() => Promise<void>`

---

##### `runChangesetPublish` (CallSignature)

**Type:** `Promise<void>`

---

#### `runChangesetVersion` (Method)

**Type:** `(onlyVersion: boolean) => Promise<void>`

#### Parameters

| Name          | Type      | Optional | Default | Since | Deprecated | Description |
| ------------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `onlyVersion` | `boolean` | ✅       | -       | -     | -          |             |

---

##### `runChangesetVersion` (CallSignature)

**Type:** `Promise<void>`

#### Parameters

| Name          | Type      | Optional | Default | Since | Deprecated | Description |
| ------------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `onlyVersion` | `boolean` | ✅       | -       | -     | -          |             |

---

#### `runVersionFlow` (Method)

**Type:** `() => Promise<void>`

---

##### `runVersionFlow` (CallSignature)

**Type:** `Promise<void>`

---

#### `shouldProcessWorkspace` (Method)

**Type:** `(workspace: WorkspaceInterface) => boolean`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---

##### `shouldProcessWorkspace` (CallSignature)

**Type:** `boolean`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---

#### `syncWorkspaces` (Method)

**Type:** `(workspaces: WorkspaceInterface[]) => void`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `syncWorkspaces` (CallSignature)

**Type:** `void`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `validateNpmToken` (Method)

**Type:** `() => Promise<void>`

---

##### `validateNpmToken` (CallSignature)

**Type:** `Promise<void>`

Ensure NPM_TOKEN is available and configured before changeset publish.

Only required for `publish` / `both` modes. Version-only runs (release PR)
do not need an npm auth token.

---

### `ChangesetVersionProps` (Interface)

**Type:** `interface ChangesetVersionProps`

Configuration options for changelog generation

Provides comprehensive options for controlling how changelogs
are generated from Git history, including commit range selection,
formatting, and filtering.

**Example:** Basic usage

```typescript
const options: GitChangelogOptions = {
  from: 'v1.0.0',
  to: 'v2.0.0',
  directory: 'packages/my-pkg',
  noMerges: true
};
```

**Example:** Custom formatting

```typescript
const options: GitChangelogOptions = {
  types: [
    { type: 'feat', section: '### Features' },
    { type: 'fix', section: '### Bug Fixes' }
  ],
  formatTemplate: '* ${commitlint.message} ${prLink}',
  commitBody: true
};
```

---

#### `changesetRoot` (Property)

**Type:** `string`

**Default:** `ts
'.changeset'
`

Root directory of the changeset config

---

#### `commitBody` (Property)

**Type:** `boolean`

**Since:** `2.3.0`

**Default:** `ts
false
`

Whether to include commit message body

When true, includes the full commit message body
in the changelog entry.

**Example:**

```typescript
commitBody: true; // Include full commit message
```

---

#### `dependencyReleaseTemplate` (Property)

**Type:** `string`

**Since:** `5.0.0`

**Default:** `'- Update dependency **${name}** from `

Template for dependency release entries

Used for formatting changelog entries related to dependency updates.
Supports variables:

- ${dep.name}: Dependency name
- ${dep.oldVersion}: Previous version
- ${dep.newVersion}: Updated version

**Example:**

```typescript
dependencyReleaseTemplate: '- Bump **${dep.name}** from `${dep.oldVersion}` to `${dep.newVersion}`';
```

---

#### `directory` (Property)

**Type:** `string`

Directory to collect commits from

Limits commit collection to changes in specified directory.
Useful for monorepo package-specific changelogs.

**Example:**

```typescript
directory: 'packages/my-pkg'; // Only changes in this directory
```

---

#### `fields` (Property)

**Type:** `"hash" \| "abbrevHash" \| "treeHash" \| "abbrevTreeHash" \| "parentHashes" \| "abbrevParentHashes" \| "authorName" \| "authorEmail" \| "authorDate" \| "authorDateRel" \| "committerName" \| "committerEmail" \| "committerDate" \| "committerDateRel" \| "subject" \| "body" \| "rawBody" \| "tag"[]`

**Default:** `ts
["abbrevHash", "hash", "subject", "authorName", "authorDate"]
`

Git commit fields to include

Specifies which Git commit fields to retrieve.

**Example:**

```typescript
fields: ['hash', 'subject', 'authorName'];
```

---

#### `formatTemplate` (Property)

**Type:** `string`

**Default:** `ts
'\n- ${scopeHeader} ${commitlint.message} ${commitLink} ${prLink}'
`

Template for formatting commit entries

Supports variables from CommitValue properties and adds:

- ${scopeHeader}: Formatted scope
- ${commitLink}: Commit hash link
- ${prLink}: PR number link

**Example:**

```typescript
formatTemplate: '* ${commitlint.message} (${commitLink})';
```

---

#### `from` (Property)

**Type:** `string`

Starting tag or commit reference

Defines the start point for collecting commits.
Can be a tag name, commit hash, or branch name.

**Example:**

```typescript
from: 'v1.0.0'; // Start from v1.0.0 tag
from: 'abc123'; // Start from specific commit
```

---

#### `ignoreNonUpdatedPackages` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Control how internal dependency bump side-effects are handled during release.

## Background

When a source package changes, `changeset version` may also bump its internal
dependents (for example, `fe-scripts` depends on `scripts-context`).
Dependents are tracked as `dependencyRelease` workspaces
(see `workspaces.includeDependencyReleases`).

## `false` (default) — keep dependent bumps

1. **Workspaces**: append dependents and set `dependencyRelease: true`
2. **Changelog**: generate git changelog for changed packages; dependents use
   `dependencyReleaseTemplate` changelog
3. **Changeset files**: only created for directly changed packages
4. **`changeset version`**: bumps changed packages and dependents on disk
5. **Result**: `Updated workspaces` includes `(DEP)` entries; dependents may
   be published together

## `true` — ignore dependent bumps (restore after version)

1. **Workspaces**: append dependents for restore targeting (`lastTag` is still resolved)
2. **Changelog / changeset**: skip processing for `dependencyRelease` workspaces
3. **`changeset version`**: runs as usual (changesets may still touch dependents)
4. **Restore**: `git restore` all `dependencyRelease` workspace paths
5. **Result**: only directly changed packages remain bumped; they are the only
   workspaces left for GitHub PR title/body/`release-tag-${count}-*` naming

**See:**

[shouldProcessWorkspace](../utils/createWorkspace.md#shouldprocessworkspace-function) for the per-workspace processing gate

CLI: `--changesetVersion.ignore-non-updated-packages`
Alias: `--changelog.ignore-non-updated-packages`

---

#### `increment` (Property)

**Type:** `string`

**Default:** `ts
'patch'
`

Version increment type for generated changeset files

---

#### `mode` (Property)

**Type:** `ChangesetVersionMode`

**Default:** `ts
'version'
`

Work mode

- `version`: generate git changelog, write changeset files, run `changeset version`
- `publish`: run `changeset publish`
- `both`: run `version` flow first, then `publish`

---

#### `noMerges` (Property)

**Type:** `boolean`

**Default:** `ts
true
`

Whether to exclude merge commits

When true, merge commits are filtered out from the changelog.

**Example:**

```typescript
noMerges: true; // Exclude merge commits
noMerges: false; // Include merge commits
```

---

#### `onlyVersion` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

When true, only bump package.json versions via changesets;
do not write changelog content into CHANGELOG.md

---

#### `skip` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Whether to skip this plugin

---

#### `skipChangeset` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Whether to skip generating changeset files (version mode only)

---

#### `to` (Property)

**Type:** `string`

Ending tag or commit reference

Defines the end point for collecting commits.
Can be a tag name, commit hash, or branch name.

**Example:**

```typescript
to: 'v2.0.0'; // End at v2.0.0 tag
to: 'main'; // End at main branch
```

---

#### `types` (Property)

**Type:** `Object[]`

Commit type configurations

Defines how different commit types should be handled and
formatted in the changelog.

**Example:**

```typescript
types: [
  { type: 'feat', section: '### Features' },
  { type: 'fix', section: '### Bug Fixes' },
  { type: 'chore', hidden: true } // Skip chore commits
];
```

---

### `ChangesetVersionMode` (TypeAlias)

**Type:** `"version" \| "publish" \| "both"`

---
