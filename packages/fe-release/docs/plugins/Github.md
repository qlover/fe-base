## `Github` (Module)

**Type:** `module Github`

GitHub changelog enrichment, release PR, and GitHub Release plugin

Third plugin in the default release pipeline (after [Workspaces](./Workspaces.md#workspaces-module) and
[ChangesetVersion](./ChangesetVersion.md#changesetversion-module)). Extends [GitBase](./GitBase.md#default-class) for git operations and
delegates GitHub API calls to [GithubManager](../implments/GithubManager.md#githubmanager-class).

Pipeline phases:

- **onBefore**: validate GitHub token; seed [ReleaseFormatter](../implments/ReleaseFormatter.md#releaseformatter-class) context
- **onExec**: enrich workspace changelogs with PR/commit links via [GithubChangelog](../implments/changelog/GithubChangelog.md#githubchangelog-class)
- **onSuccess**:
  - `createPR` — create release branch, commit, push, and open PR (unless skipped)
  - `createRelease` — create a GitHub Release per workspace (tag + changelog body)

Release branch flow (`createPR`):

1. `ReleaseFormatter.getReleaseBranch()` — derive branch and tag names from templates
2. Create branch from `sourceBranch`, commit version/changelog changes, push
3. Open PR with formatted title/body and optional labels
4. Auto-merge when `autoMergeReleasePr` is enabled

GitHub Release flow (`createRelease`):

1. Filter workspaces with `tagName`, skipping `dependencyRelease` and
   paths matched by [GithubProps.ignoreReleasePaths](#ignorereleasepaths-property)
2. Call [GithubManager.createRelease](../implments/GithubManager.md#createrelease-method) with workspace changelog as notes

**Example:** Skip PR creation (local dry-run)

```bash
fe-release --github.skip-create-release-pr --dry-run
```

**Example:** Publish + GitHub Releases (ignore examples)

```bash
fe-release --changesetVersion.mode publish \
  --github.mode createRelease \
  --github.ignore-release-paths examples
```

**Example:** fe-config label and merge settings

```json
{
  "release": {
    "github": {
      "autoMergeReleasePr": false,
      "label": { "name": "CI-Release" },
      "ignoreReleasePaths": ["examples"]
    }
  }
}
```

---

### `default` (Class)

**Type:** `class default`

GitHub integration plugin for changelog enrichment, release PR, and GitHub Releases.

Skips `dependencyRelease` workspaces during changelog enrichment because
their changelogs are pre-filled by [Workspaces](./Workspaces.md#workspaces-module) or intentionally
ignored when `changesetVersion.ignoreNonUpdatedPackages` is enabled.

---

#### `constructor` (Constructor)

**Type:** `(context: ReleaseContext, props: GithubProps) => Github`

#### Parameters

| Name      | Type             | Optional | Default | Since | Deprecated | Description |
| --------- | ---------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ReleaseContext` | ❌       | -       | -     | -          |             |
| `props`   | `GithubProps`    | ✅       | `{}`    | -     | -          |             |

---

#### `githubManager` (Property)

**Type:** `GithubManager`

---

#### `pather` (Property)

**Type:** `Pather`

**Default:** `{}`

---

#### `releaseFormatter` (Property)

**Type:** `ReleaseFormatter`

---

#### `ignoreReleasePaths` (Accessor)

**Type:** `accessor ignoreReleasePaths`

---

#### `mode` (Accessor)

**Type:** `accessor mode`

---

#### `commit` (Method)

**Type:** `(message: string, args: string[]) => Promise<string>`

#### Parameters

| Name      | Type       | Optional | Default | Since | Deprecated | Description                     |
| --------- | ---------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `message` | `string`   | ❌       | -       | -     | -          | Commit message                  |
| `args`    | `string[]` | ✅       | `[]`    | -     | -          | Additional Git commit arguments |

---

##### `commit` (CallSignature)

**Type:** `Promise<string>`

Creates a Git commit

Creates a new Git commit with the specified message and optional
additional arguments. The message is automatically JSON-stringified
to handle special characters properly.

**Returns:**

Promise resolving to command output

**Example:** Basic commit

```typescript
await plugin.commit('feat: add new feature');
```

**Example:** Commit with arguments

```typescript
await plugin.commit('fix: update deps', ['--no-verify']);
```

**Example:** Commit with special characters

```typescript
await plugin.commit('fix: handle "quotes" & symbols');
// Message is automatically escaped
```

#### Parameters

| Name      | Type       | Optional | Default | Since | Deprecated | Description                     |
| --------- | ---------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `message` | `string`   | ❌       | -       | -     | -          | Commit message                  |
| `args`    | `string[]` | ✅       | `[]`    | -     | -          | Additional Git commit arguments |

---

#### `createBranch` (Method)

**Type:** `(newBranch: string, sourceBranch: string, currentBranch: string) => Promise<void>`

#### Parameters

| Name            | Type     | Optional | Default | Since | Deprecated | Description                    |
| --------------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `newBranch`     | `string` | ❌       | -       | -     | -          | The name of the new branch     |
| `sourceBranch`  | `string` | ❌       | -       | -     | -          | The name of the source branch  |
| `currentBranch` | `string` | ❌       | -       | -     | -          | The name of the current branch |

---

##### `createBranch` (CallSignature)

**Type:** `Promise<void>`

Creates a local branch from the current branch

#### Parameters

| Name            | Type     | Optional | Default | Since | Deprecated | Description                    |
| --------------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `newBranch`     | `string` | ❌       | -       | -     | -          | The name of the new branch     |
| `sourceBranch`  | `string` | ❌       | -       | -     | -          | The name of the source branch  |
| `currentBranch` | `string` | ❌       | -       | -     | -          | The name of the current branch |

---

#### `createGithubReleases` (Method)

**Type:** `(workspaces: WorkspaceInterface[]) => Promise<void>`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `createGithubReleases` (CallSignature)

**Type:** `Promise<void>`

Create a GitHub Release for each eligible workspace.

Release notes use the enriched workspace changelog from `onExec`.

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `createReleaseBranch` (Method)

**Type:** `(workspaces: WorkspaceInterface[]) => Promise<ReleaseBranchResult>`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `createReleaseBranch` (CallSignature)

**Type:** `Promise<ReleaseBranchResult>`

Create the release branch, commit changes, push, and return branch/tag names.

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `createReleasePR` (Method)

**Type:** `(workspaces: WorkspaceInterface[], releaseBranchResult: ReleaseBranchResult) => Promise<string>`

#### Parameters

| Name                  | Type                   | Optional | Default | Since | Deprecated | Description |
| --------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces`          | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |
| `releaseBranchResult` | `ReleaseBranchResult`  | ❌       | -       | -     | -          |             |

---

##### `createReleasePR` (CallSignature)

**Type:** `Promise<string>`

#### Parameters

| Name                  | Type                   | Optional | Default | Since | Deprecated | Description |
| --------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces`          | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |
| `releaseBranchResult` | `ReleaseBranchResult`  | ❌       | -       | -     | -          |             |

---

#### `getCurrentBranch` (Method)

**Type:** `() => Promise<string>`

---

##### `getCurrentBranch` (CallSignature)

**Type:** `Promise<string>`

Gets the current Git branch name

Retrieves the name of the currently checked out Git branch.
Includes a small delay to ensure Git's internal state is updated.

**Returns:**

Promise resolving to branch name

**Throws:**

Error if branch name cannot be retrieved

---

#### `getGitRepositoryInfo` (Method)

**Type:** `() => Promise<GitRepositoryInfoType>`

---

##### `getGitRepositoryInfo` (CallSignature)

**Type:** `Promise<GitRepositoryInfoType>`

Retrieves repository owner and name from Git remote URL.

This method uses the protected `parseRemoteUrl` to extract the owner and name.
By default, it uses the `git-url-parse` library, which supports GitHub, GitLab,
Gitee, Bitbucket, and many other Git hosting services.

Subclasses can override `parseRemoteUrl` to implement custom parsing logic.

**Returns:**

An object containing repository name and owner name

**Throws:**

Will throw an error if repository information cannot be determined

---

#### `getReleaseWorkspaces` (Method)

**Type:** `(workspaces: WorkspaceInterface[]) => WorkspaceInterface[]`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `getReleaseWorkspaces` (CallSignature)

**Type:** `WorkspaceInterface[]`

Workspaces that should receive a GitHub Release in createRelease mode.

Requires `tagName`. Skips dependency-release packages and paths matched
by [GithubProps.ignoreReleasePaths](#ignorereleasepaths-property). Private packages are included
when they have a tag.

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `getRemoteUrl` (Method)

**Type:** `() => Promise<string>`

---

##### `getRemoteUrl` (CallSignature)

**Type:** `Promise<string>`

Gets the Git remote URL

Retrieves the URL of the 'origin' remote from Git configuration.

**Returns:**

Promise resolving to remote URL

**Throws:**

Error if remote URL cannot be retrieved

---

#### `handleReleasePullRequest` (Method)

**Type:** `(workspaces: WorkspaceInterface[], releaseBranchResult: ReleaseBranchResult) => Promise<void>`

#### Parameters

| Name                  | Type                   | Optional | Default | Since | Deprecated | Description |
| --------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces`          | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |
| `releaseBranchResult` | `ReleaseBranchResult`  | ❌       | -       | -     | -          |             |

---

##### `handleReleasePullRequest` (CallSignature)

**Type:** `Promise<void>`

Create the release PR and optionally auto-merge it.

When `skipCreateReleasePR` is enabled, only logs a PR preview and exits.

#### Parameters

| Name                  | Type                   | Optional | Default | Since | Deprecated | Description |
| --------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces`          | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |
| `releaseBranchResult` | `ReleaseBranchResult`  | ❌       | -       | -     | -          |             |

---

#### `hasWorkingTreeChanges` (Method)

**Type:** `() => Promise<boolean>`

---

##### `hasWorkingTreeChanges` (CallSignature)

**Type:** `Promise<boolean>`

Checks whether the working tree has staged or unstaged changes

---

#### `isGitRepository` (Method)

**Type:** `() => Promise<boolean>`

---

##### `isGitRepository` (CallSignature)

**Type:** `Promise<boolean>`

Checks if the current directory is a Git repository

**Returns:**

Promise resolving to boolean

---

#### `isIgnoredReleasePath` (Method)

**Type:** `(workspace: WorkspaceInterface) => boolean`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---

##### `isIgnoredReleasePath` (CallSignature)

**Type:** `boolean`

Whether this workspace path is under an ignoreReleasePaths entry.

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          |             |

---

#### `logReleasePRPreview` (Method)

**Type:** `(workspaces: WorkspaceInterface[], releaseBranchResult: ReleaseBranchResult) => void`

#### Parameters

| Name                  | Type                   | Optional | Default | Since | Deprecated | Description |
| --------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces`          | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |
| `releaseBranchResult` | `ReleaseBranchResult`  | ❌       | -       | -     | -          |             |

---

##### `logReleasePRPreview` (CallSignature)

**Type:** `void`

#### Parameters

| Name                  | Type                   | Optional | Default | Since | Deprecated | Description |
| --------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces`          | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |
| `releaseBranchResult` | `ReleaseBranchResult`  | ❌       | -       | -     | -          |             |

---

#### `onBefore` (Method)

**Type:** `() => Promise<void>`

---

##### `onBefore` (CallSignature)

**Type:** `Promise<void>`

Plugin initialization hook

Runs before plugin execution to set up repository context:

1. Checks if the current directory is a Git repository
2. Retrieves repository information (owner, name)
3. Gets current branch and switches to it (if needed)
4. Updates context with repository info

**Throws:**

Error if repository information cannot be retrieved

---

#### `onExec` (Method)

**Type:** `() => Promise<void>`

---

##### `onExec` (CallSignature)

**Type:** `Promise<void>`

---

#### `onSuccess` (Method)

**Type:** `() => Promise<void>`

---

##### `onSuccess` (CallSignature)

**Type:** `Promise<void>`

---

#### `parseRemoteUrl` (Method)

**Type:** `(remoteUrl: string) => GitUrl`

#### Parameters

| Name        | Type     | Optional | Default | Since | Deprecated | Description                                                   |
| ----------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------- |
| `remoteUrl` | `string` | ❌       | -       | -     | -          | The full remote URL (e.g., https://github.com/owner/repo.git) |

---

##### `parseRemoteUrl` (CallSignature)

**Type:** `GitUrl`

Parses a Git remote URL to extract repository owner and name.

This method is protected and can be overridden by subclasses to provide
custom parsing logic for private Git servers or other edge cases.

The default implementation uses `git-url-parse` which supports most common
Git hosting services (GitHub, GitLab, Gitee, Bitbucket, etc.).

**Returns:**

An object containing `owner` and `name` of the repository.

**Throws:**

Error if the URL cannot be parsed.

#### Parameters

| Name        | Type     | Optional | Default | Since | Deprecated | Description                                                   |
| ----------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------- |
| `remoteUrl` | `string` | ❌       | -       | -     | -          | The full remote URL (e.g., https://github.com/owner/repo.git) |

---

#### `pushBranch` (Method)

**Type:** `(branch: string) => Promise<void>`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                    |
| -------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `branch` | `string` | ❌       | -       | -     | -          | The name of the branch to push |

---

##### `pushBranch` (CallSignature)

**Type:** `Promise<void>`

Pushes a branch to the origin remote

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                    |
| -------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `branch` | `string` | ❌       | -       | -     | -          | The name of the branch to push |

---

### `GithubProps` (Interface)

**Type:** `interface GithubProps`

Base configuration for Git-related plugins

Extends ScriptPluginProps with generic options.

**Example:**

```typescript
const config: GitBaseProps = {
  timeout: 5000
};
```

---

#### `authorName` (Property)

**Type:** `string`

Author name

---

#### `autoGenerate` (Property)

**Type:** `boolean`

---

#### `autoMergeReleasePr` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Whether to auto-merge the created release PR

---

#### `batchPRBody` (Property)

**Type:** `string`

**Default:** `ts
from release.json
`

Template for each workspace section in the PR body

Used for both single- and multi-workspace releases.
Supports `${changeTypeSection}` (Patch/Minor/Major Changes).

---

#### `branchName` (Property)

**Type:** `string`

**Default:** `release/${repoName}-${releaseId}`

The branch name for batch release

Template variables: see [BranchNameTplVars](#branchnametplvars-typealias)

---

#### `commitArgs` (Property)

**Type:** `string[]`

**Default:** `ts
[]
`

---

#### `commitMessage` (Property)

**Type:** `string`

**Default:** `ts
'chore(tag): ${name} v${version}'
`

---

#### `discussionCategoryName` (Property)

**Type:** `string`

---

#### `draft` (Property)

**Type:** `boolean`

---

#### `env` (Property)

**Type:** `string`

Release environment

---

#### `ignoreReleasePaths` (Property)

**Type:** `string[]`

**Default:** `[]`

Workspace path prefixes to skip when creating GitHub Releases.

Matched with segment-aware path containment (e.g. `examples` skips
`examples/react-seed`). Applies only in `createRelease` mode.

CLI: `--github.ignore-release-paths`
fe-config: `release.github.ignoreReleasePaths`

**Example:**

```json
{ "ignoreReleasePaths": ["examples", "apps/docs"] }
```

---

#### `increment` (Property)

**Type:** `string`

**Default:** `ts
'patch'
`

Semver increment used to title changelog sections (patch | minor | major)

---

#### `label` (Property)

**Type:** `GithubLabel`

Configuration for release pull request labels

Core concept:
Defines the label configuration for release pull requests,
enabling automated categorization and visual identification
of release-related PRs.

Label features:

- Automated label application
- Customizable label appearance
- Consistent release identification
- Integration with GitHub labeling system
- Support for custom label descriptions

Label properties:

- name: Label identifier and display name
- color: Hexadecimal color code for visual distinction
- description: Label description for documentation

**Example:** Basic label configuration

```typescript
const config: FeReleaseConfig = {
  label: {
    name: 'release',
    color: '1A7F37',
    description: 'Automated release PR'
  }
};
```

**Example:** Custom label

```typescript
const config: FeReleaseConfig = {
  label: {
    name: 'CI-Release',
    color: '0366D6',
    description: 'Release created by CI/CD'
  }
};
```

---

#### `makeLatest` (Property)

**Type:** `boolean \| "true" \| "false" \| "legacy"`

---

#### `mergeType` (Property)

**Type:** `"squash" \| "merge" \| "rebase"`

**Default:** `'squash'`

PR auto-merge strategy for release pull requests

Core concept:
Defines the merge strategy used when automatically merging
release pull requests, affecting commit history and
repository structure.

Merge strategies:

- merge: Creates merge commit with branch history
- squash: Combines all commits into single commit
- rebase: Replays commits on target branch

Strategy considerations:

- merge: Preserves complete branch history
- squash: Creates clean, linear history
- rebase: Maintains chronological order
- Affects commit message and history structure
- Influences repository maintenance and debugging

**Example:** Squash merge

```typescript
const config: FeReleaseConfig = {
  autoMergeType: 'squash'
};
```

**Example:** Preserve history

```typescript
const config: FeReleaseConfig = {
  autoMergeType: 'merge'
};
```

---

#### `mode` (Property)

**Type:** `GithubMode`

**Default:** `'createPR'`

Plugin work mode

- `createPR`: enrich changelogs in `onExec`, then create release branch and PR in `onSuccess`
- `createRelease`: enrich changelogs in `onExec`, then create GitHub Releases in `onSuccess`

---

#### `PRBody` (Property)

**Type:** `string`

**Default:** `ts
from release.json
`

Pull request body template

---

#### `preRelease` (Property)

**Type:** `boolean`

---

#### `PRTitle` (Property)

**Type:** `string`

**Default:** `releaseJson.github.PRTitle`

Pull request title template (1–2 packages)

---

#### `PRTitleMany` (Property)

**Type:** `string`

**Default:** `releaseJson.github.PRTitleMany`

Pull request title template when releasing more than 2 packages

Falls back to [PRTitle](#prtitle-property) when unset.

---

#### `pushChangeLabels` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

---

#### `releaseId` (Property)

**Type:** `string`

Unique ID for the current release run

---

#### `releaseName` (Property)

**Type:** `string`

**Default:** `ts
'Release ${spaces}'
`

---

#### `releaseNotes` (Property)

**Type:** `string`

---

#### `releaseTagName` (Property)

**Type:** `string`

**Default:** `release-tag-${count}-patch-${releaseId}`

The tag name for batch release

Template variables: see [BranchNameTplVars](#branchnametplvars-typealias)

---

#### `repoName` (Property)

**Type:** `string`

Repository name

---

#### `skip` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Whether to skip this plugin

---

#### `skipCreateReleasePr` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Skip creating the GitHub release pull request.

When enabled, the release branch is still created and pushed,
but no PR is opened via the GitHub API. Useful for local testing.

CLI: `--github.skip-create-release-pr`
fe-config: `release.github.skipCreateReleasePR`

---

#### `timeout` (Property)

**Type:** `number`

Timeout for API requests in milliseconds (generic)

---

#### `tokenRef` (Property)⚠️

**Type:** `string`

Environment variable name for GitHub API token

---

### `GithubLabel` (TypeAlias)

**Type:** `type GithubLabel`

---

#### `color` (Property)

**Type:** `string`

**Default:** `'1A7F37'`

Hexadecimal color code for label appearance

Color format: 6-character hex string without '#'
Used for visual distinction in GitHub interface
Supports standard web color codes

**Example:** Green color

```typescript
color: '1A7F37';
```

**Example:** Blue color

```typescript
color: '0366D6';
```

---

#### `description` (Property)

**Type:** `string`

**Default:** `'Release PR'`

Descriptive text for label documentation

Provides context about the label's purpose
Used in GitHub label management interface
Helps team members understand label usage

**Example:**

```typescript
description: 'Automated release pull request';
```

---

#### `name` (Property)

**Type:** `string`

**Default:** `'CI-Release'`

Label name for identification and display

Used as the primary identifier for the label
Displayed in GitHub PR interface
Should be descriptive and consistent

**Example:**

```typescript
name: 'release';
```

---

### `GithubMode` (TypeAlias)

**Type:** `"createPR" \| "createRelease"`

---
