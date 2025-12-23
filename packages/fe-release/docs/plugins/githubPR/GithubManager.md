## `GithubManager` (Module)

**Type:** `module GithubManager`

GitHub API Integration Manager

This module provides a comprehensive interface for interacting with
GitHub's API, handling pull requests, releases, labels, and other
GitHub-specific operations.

Core Features:

- Pull request management
- Release creation and publishing
- Label management
- Repository information handling
- Authentication and token management
- Error handling and dry run support

**Example:** Basic usage

```typescript
const manager = new GithubManager(context);

// Create PR
const prNumber = await manager.createReleasePR({
  title: 'Release v1.0.0',
  body: 'Release notes...',
  base: 'main',
  head: 'release-1.0.0'
});
```

**Example:** Release creation

```typescript
await manager.createRelease({
  name: 'pkg-a',
  version: '1.0.0',
  tagName: 'v1.0.0',
  changelog: '...'
});
```

---

### `default` (Class)

**Type:** `class default`

GitHub API Integration Manager

Manages interactions with GitHub's API for release automation.
Handles authentication, repository operations, and provides
high-level abstractions for common GitHub workflows.

Features:

- Lazy Octokit initialization
- Token management
- Repository information handling
- Pull request operations
- Release management
- Label handling
- Error handling with retries

**Example:** Basic initialization

```typescript
const manager = new GithubManager(context);
await manager.createReleasePR({
  title: 'Release v1.0.0',
  body: 'Changes...',
  base: 'main',
  head: 'release'
});
```

**Example:** Release workflow

```typescript
const manager = new GithubManager(context);

// Create and merge PR
const prNumber = await manager.createReleasePR(options);
await manager.mergePR(prNumber, 'release-branch');

// Create release
await manager.createRelease({
  name: 'pkg-a',
  tagName: 'v1.0.0',
  changelog: '...'
});
```

---

#### `new default` (Constructor)

**Type:** `(context: default) => default`

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description                              |
| --------- | --------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `context` | `default` | ❌       | -       | -     | -          | Release context containing configuration |

---

#### `autoMergeReleasePR` (Accessor)

**Type:** `accessor autoMergeReleasePR`

---

#### `autoMergeType` (Accessor)

**Type:** `accessor autoMergeType`

---

#### `dryRunPRNumber` (Accessor)

**Type:** `accessor dryRunPRNumber`

---

#### `logger` (Accessor)

**Type:** `accessor logger`

---

#### `octokit` (Accessor)

**Type:** `accessor octokit`

---

#### `shell` (Accessor)

**Type:** `accessor shell`

---

#### `checkedPR` (Method)

**Type:** `(prNumber: string, releaseBranch: string) => Promise<void>`

#### Parameters

| Name            | Type     | Optional | Default | Since | Deprecated | Description         |
| --------------- | -------- | -------- | ------- | ----- | ---------- | ------------------- |
| `prNumber`      | `string` | ❌       | -       | -     | -          | Pull request number |
| `releaseBranch` | `string` | ❌       | -       | -     | -          | Branch to clean up  |

---

##### `checkedPR` (CallSignature)

**Type:** `Promise<void>`

Checks pull request status and cleans up

Verifies pull request status and deletes the release branch
if the PR has been merged. Used for post-merge cleanup.

Process:

1. Verify PR exists and status
2. Delete release branch if PR merged
3. Log cleanup results

**Throws:**

Error if verification or cleanup fails

**Example:**

```typescript
await manager.checkedPR('123', 'release-1.0.0');
// Verifies PR #123 and deletes release-1.0.0 if merged
```

#### Parameters

| Name            | Type     | Optional | Default | Since | Deprecated | Description         |
| --------------- | -------- | -------- | ------- | ----- | ---------- | ------------------- |
| `prNumber`      | `string` | ❌       | -       | -     | -          | Pull request number |
| `releaseBranch` | `string` | ❌       | -       | -     | -          | Branch to clean up  |

---

#### `createRelease` (Method)

**Type:** `(workspace: WorkspaceValue) => Promise<void>`

#### Parameters

| Name        | Type             | Optional | Default | Since | Deprecated | Description                     |
| ----------- | ---------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `workspace` | `WorkspaceValue` | ❌       | -       | -     | -          | Workspace to create release for |

---

##### `createRelease` (CallSignature)

**Type:** `Promise<void>`

Creates a GitHub release

Creates a new GitHub release for a workspace with:

- Formatted release name
- Changelog as release notes
- Proper tag
- Configurable settings (draft, prerelease, etc.)

Handles dry run mode and error cases gracefully.

**Throws:**

Error if tag name is missing or creation fails

**Example:** Basic release

```typescript
await manager.createRelease({
  name: 'pkg-a',
  version: '1.0.0',
  tagName: 'v1.0.0',
  changelog: '...'
});
```

**Example:** Dry run

```typescript
context.dryRun = true;
await manager.createRelease(workspace);
// Logs release info without creating
```

#### Parameters

| Name        | Type             | Optional | Default | Since | Deprecated | Description                     |
| ----------- | ---------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `workspace` | `WorkspaceValue` | ❌       | -       | -     | -          | Workspace to create release for |

---

#### `createReleasePR` (Method)

**Type:** `(options: CreatePROptionsArgs) => Promise<string>`

#### Parameters

| Name      | Type                  | Optional | Default | Since | Deprecated | Description                                |
| --------- | --------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `options` | `CreatePROptionsArgs` | ❌       | -       | -     | -          | The options for creating the pull request. |

---

##### `createReleasePR` (CallSignature)

**Type:** `Promise<string>`

Creates a release pull request.

**Returns:**

The created pull request number.

**Throws:**

If the creation fails or if the pull request already exists.

#### Parameters

| Name      | Type                  | Optional | Default | Since | Deprecated | Description                                |
| --------- | --------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `options` | `CreatePROptionsArgs` | ❌       | -       | -     | -          | The options for creating the pull request. |

---

#### `createReleasePRLabel` (Method)

**Type:** `() => Promise<undefined \| Object>`

---

##### `createReleasePRLabel` (CallSignature)

**Type:** `Promise<undefined \| Object>`

Creates a release pull request label.

**Returns:**

The created label.

**Throws:**

If the label is not valid or if the creation fails.

---

#### `getCommitInfo` (Method)

**Type:** `(commitSha: string) => Promise<Object>`

#### Parameters

| Name        | Type     | Optional | Default | Since | Deprecated | Description |
| ----------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `commitSha` | `string` | ❌       | -       | -     | -          | Commit SHA  |

---

##### `getCommitInfo` (CallSignature)

**Type:** `Promise<Object>`

Gets detailed information about a commit

Retrieves detailed information about a specific commit,
including files changed, author details, and commit message.

**Returns:**

Promise resolving to commit information

**Throws:**

Error if request fails

**Example:**

```typescript
const info = await manager.getCommitInfo('abc123');
console.log(info.commit.message);
console.log(info.files.map((f) => f.filename));
```

#### Parameters

| Name        | Type     | Optional | Default | Since | Deprecated | Description |
| ----------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `commitSha` | `string` | ❌       | -       | -     | -          | Commit SHA  |

---

#### `getGitHubUserInfo` (Method)

**Type:** `() => Omit<PullRequestManagerOptions, "token">`

---

##### `getGitHubUserInfo` (CallSignature)

**Type:** `Omit<PullRequestManagerOptions, "token">`

Gets GitHub repository information

Retrieves the owner and repository name from the context.
This information is required for most GitHub API operations.

**Returns:**

Repository owner and name

**Throws:**

Error if owner or repo name is not set

**Example:**

```typescript
const info = manager.getGitHubUserInfo();
// { owner: 'org-name', repo: 'repo-name' }
```

---

#### `getPullRequest` (Method)

**Type:** `(prNumber: number) => Promise<Object>`

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description         |
| ---------- | -------- | -------- | ------- | ----- | ---------- | ------------------- |
| `prNumber` | `number` | ❌       | -       | -     | -          | Pull request number |

---

##### `getPullRequest` (CallSignature)

**Type:** `Promise<Object>`

Gets pull request information

Retrieves detailed information about a pull request,
including title, body, labels, and review status.

**Returns:**

Promise resolving to pull request information

**Throws:**

Error if request fails

**Example:**

```typescript
const pr = await manager.getPullRequest(123);
console.log(pr.title);
console.log(pr.labels.map((l) => l.name));
console.log(pr.mergeable_state);
```

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description         |
| ---------- | -------- | -------- | ------- | ----- | ---------- | ------------------- |
| `prNumber` | `number` | ❌       | -       | -     | -          | Pull request number |

---

#### `getPullRequestCommits` (Method)

**Type:** `(prNumber: number) => Promise<Object[]>`

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description         |
| ---------- | -------- | -------- | ------- | ----- | ---------- | ------------------- |
| `prNumber` | `number` | ❌       | -       | -     | -          | Pull request number |

---

##### `getPullRequestCommits` (CallSignature)

**Type:** `Promise<Object[]>`

Gets commits from a pull request

Retrieves all commits associated with the specified pull request.
Useful for generating changelogs or analyzing changes.

**Returns:**

Promise resolving to array of commit information

**Throws:**

Error if request fails

**Example:**

```typescript
const commits = await manager.getPullRequestCommits(123);
commits.forEach((commit) => {
  console.log(commit.sha, commit.commit.message);
});
```

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description         |
| ---------- | -------- | -------- | ------- | ----- | ---------- | ------------------- |
| `prNumber` | `number` | ❌       | -       | -     | -          | Pull request number |

---

#### `getToken` (Method)

**Type:** `() => string`

---

##### `getToken` (CallSignature)

**Type:** `string`

Gets GitHub API token

Retrieves the GitHub API token from environment variables.
The token name can be configured via the tokenRef option.

**Returns:**

GitHub API token

**Throws:**

Error if token is not set

**Example:** Default token

```typescript
const token = manager.getToken();
// Uses GITHUB_TOKEN env var
```

**Example:** Custom token

```typescript
context.options.githubPR.tokenRef = 'CUSTOM_TOKEN';
const token = manager.getToken();
// Uses CUSTOM_TOKEN env var
```

---

#### `mergePR` (Method)

**Type:** `(prNumber: string, releaseBranch: string) => Promise<void>`

#### Parameters

| Name            | Type     | Optional | Default | Since | Deprecated | Description         |
| --------------- | -------- | -------- | ------- | ----- | ---------- | ------------------- |
| `prNumber`      | `string` | ❌       | -       | -     | -          | Pull request number |
| `releaseBranch` | `string` | ❌       | -       | -     | -          | Branch to merge     |

---

##### `mergePR` (CallSignature)

**Type:** `Promise<void>`

Merges a pull request

Merges the specified pull request using the configured
merge method. In dry-run mode, logs the merge action
without performing it.

**Throws:**

Error if merge fails

**Example:** Basic merge

```typescript
await manager.mergePR('123', 'release-1.0.0');
// Merges PR #123 using configured merge method
```

**Example:** Dry run

```typescript
context.dryRun = true;
await manager.mergePR('123', 'release-1.0.0');
// Logs merge action without performing it
```

#### Parameters

| Name            | Type     | Optional | Default | Since | Deprecated | Description         |
| --------------- | -------- | -------- | ------- | ----- | ---------- | ------------------- |
| `prNumber`      | `string` | ❌       | -       | -     | -          | Pull request number |
| `releaseBranch` | `string` | ❌       | -       | -     | -          | Branch to merge     |

---

### `PullRequestManagerOptions` (Interface)

**Type:** `interface PullRequestManagerOptions`

---

#### `owner` (Property)

**Type:** `string`

---

#### `repo` (Property)

**Type:** `string`

---

#### `token` (Property)

**Type:** `string`

---

### `CommitInfo` (TypeAlias)

**Type:** `type CommitInfo`

---

### `CreateReleaseOptions` (TypeAlias)

**Type:** `type CreateReleaseOptions`

---

### `PullRequestCommits` (TypeAlias)

**Type:** `type PullRequestCommits`

---

### `PullRequestInfo` (TypeAlias)

**Type:** `type PullRequestInfo`

---
