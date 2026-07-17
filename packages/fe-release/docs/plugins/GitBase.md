## `GitBase` (Module)

**Type:** `module GitBase`

Base class for Git-related plugins

This module provides a base class for plugins that interact with Git
repositories. It handles common Git operations like branch management,
repository information retrieval, and commit operations.

Core Features:

- Git repository information retrieval (generic, supports GitHub/GitLab/Gitee etc.)
- Branch management
- Commit operations
- Error handling

**Example:** Basic usage

```typescript
class MyGitPlugin extends GitBase<GitBaseProps> {
  async onExec() {
    const branch = await this.getCurrentBranch();
    await this.commit('feat: new feature');
  }
}
```

**Example:** Repository info

```typescript
class RepoPlugin extends GitBase<GitBaseProps> {
  async onExec() {
    const info = await this.getGitRepositoryInfo();
    // {
    //   repoName: 'my-repo',
    //   authorName: 'org-or-group'
    // }
  }
}
```

---

### `default` (Class)

**Type:** `class default<T>`

Base class for Git-related plugins

Provides common functionality for plugins that interact with
Git repositories. Handles repository information,
branch management, and commit operations.

Features:

- Automatic repository info detection (generic)
- Branch management
- Commit creation
- Error handling

**Example:** Basic plugin

```typescript
class CustomGitPlugin extends GitBase<GitBaseProps> {
  async onExec() {
    const branch = await this.getCurrentBranch();
    await this.commit('feat: add feature');
  }
}
```

**Example:** Custom repository parsing (override protected method)

```typescript
class CustomParserPlugin extends GitBase<GitBaseProps> {
  protected parseRemoteUrl(remoteUrl: string) {
    // Custom logic for a private Git server
    const match = remoteUrl.match(/mygit\.com/([^/]+)/([^/.]+)/);
    if (!match) throw new Error('Unsupported URL format');
    return { owner: match[1], name: match[2] };
  }
}
```

---

#### `constructor` (Constructor)

**Type:** `() => GitBase<T>`

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

### `GitBaseProps` (Interface)

**Type:** `interface GitBaseProps`

Base configuration for Git-related plugins

Extends ScriptPluginProps with generic options.

**Example:**

```typescript
const config: GitBaseProps = {
  timeout: 5000
};
```

---

#### `timeout` (Property)

**Type:** `number`

Timeout for API requests in milliseconds (generic)

---

#### `tokenRef` (Property)⚠️

**Type:** `string`

Environment variable name for GitHub API token

---

### `GitRepositoryParsedType` (TypeAlias)

**Type:** `parse.GitUrl`

---
