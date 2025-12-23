## `ChangeLog` (Module)

**Type:** `module ChangeLog`

Core interfaces for changelog generation

This module provides the core interfaces and types for generating
changelogs from Git commit history. It includes types for commit
parsing, formatting, and changelog generation.

Core Components:

- Commit data structures
- Changelog formatting
- Git log options
- Changelog generation

**Example:** Basic usage

```typescript
class MyChangeLog implements ChangeLogInterface {
  async getCommits(options?: GitChangelogOptions): Promise<CommitValue[]> {
    // Implementation
  }
}

class MyFormatter implements ChangelogFormatter {
  format(commits: CommitValue[]): string[] {
    // Implementation
  }
}
```

---

### `ChangeLogInterface` (Interface)

**Type:** `interface ChangeLogInterface`

Interface for changelog generation

Defines the contract for classes that generate changelogs
from Git history.

**Example:**

```typescript
class GitChangelog implements ChangeLogInterface {
  async getCommits(options?: GitChangelogOptions): Promise<CommitValue[]> {
    // Get commits from Git and parse them
    const commits = await gitlog(options);
    return commits.map((commit) => ({
      base: commit,
      commitlint: parseCommit(commit.subject),
      commits: []
    }));
  }
}
```

---

#### `getCommits` (Method)

**Type:** `(options: GitChangelogOptions) => Promise<CommitValue[]>`

#### Parameters

| Name      | Type                  | Optional | Default | Since | Deprecated | Description              |
| --------- | --------------------- | -------- | ------- | ----- | ---------- | ------------------------ |
| `options` | `GitChangelogOptions` | ✅       | -       | -     | -          | Optional Git log options |

---

##### `getCommits` (CallSignature)

**Type:** `Promise<CommitValue[]>`

Retrieves and parses Git commits

**Returns:**

Promise resolving to array of parsed commits

#### Parameters

| Name      | Type                  | Optional | Default | Since | Deprecated | Description              |
| --------- | --------------------- | -------- | ------- | ----- | ---------- | ------------------------ |
| `options` | `GitChangelogOptions` | ✅       | -       | -     | -          | Optional Git log options |

---

### `ChangelogFormatter` (Interface)

**Type:** `interface ChangelogFormatter`

Interface for changelog formatting

Defines the contract for classes that format commit data
into changelog entries.

**Example:**

```typescript
class MarkdownFormatter implements ChangelogFormatter {
  format(commits: CommitValue[]): string[] {
    return commits.map(
      (commit) => `- ${commit.commitlint.message} (#${commit.prNumber})`
    );
  }
}
```

---

#### `format` (Method)

**Type:** `(commits: unknown[], options: Opt) => string[]`

#### Parameters

| Name      | Type        | Optional | Default | Since | Deprecated | Description                 |
| --------- | ----------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `commits` | `unknown[]` | ❌       | -       | -     | -          | Array of commits to format  |
| `options` | `Opt`       | ✅       | -       | -     | -          | Optional formatting options |

---

##### `format` (CallSignature)

**Type:** `string[]`

Formats commits into changelog entries

**Returns:**

Array of formatted changelog lines

#### Parameters

| Name      | Type        | Optional | Default | Since | Deprecated | Description                 |
| --------- | ----------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `commits` | `unknown[]` | ❌       | -       | -     | -          | Array of commits to format  |
| `options` | `Opt`       | ✅       | -       | -     | -          | Optional formatting options |

---

### `CommitTuple` (Interface)

**Type:** `interface CommitTuple`

Raw commit message parsing result

Represents a parsed conventional commit message with its
component parts.

**Example:**

```typescript
const tuple: CommitTuple = {
  raw: 'feat(api): add new endpoint\n\nDetails here',
  type: 'feat',
  scope: 'api',
  message: 'add new endpoint',
  body: 'Details here'
};
```

---

#### `body` (Property)

**Type:** `string`

Optional commit body

---

#### `message` (Property)

**Type:** `string`

Main commit message

---

#### `raw` (Property)

**Type:** `string`

Original commit message

---

#### `scope` (Property)

**Type:** `string`

Commit scope (e.g., 'api', 'core')

---

#### `type` (Property)

**Type:** `string`

Commit type (e.g., 'feat', 'fix')

---

### `CommitValue` (Interface)

**Type:** `interface CommitValue`

Complete commit information

Combines Git commit data, parsed conventional commit info,
and PR metadata into a single value object.

**Example:**

```typescript
const commit: CommitValue = {
  base: {
    hash: 'abc123',
    subject: 'feat(api): new endpoint (#123)'
  },
  commitlint: {
    type: 'feat',
    scope: 'api',
    message: 'new endpoint'
  },
  commits: [],
  prNumber: '123'
};
```

---

#### `base` (Property)

**Type:** `BaseCommit`

Raw Git commit information

---

#### `commitlint` (Property)

**Type:** `Commitlint`

Parsed conventional commit data

---

#### `commits` (Property)

**Type:** `CommitValue[]`

Sub-commits (for merge commits)

---

#### `prNumber` (Property)

**Type:** `string`

Associated pull request number

---

### `Commitlint` (Interface)

**Type:** `interface Commitlint`

Parsed conventional commit data

Represents a commit message parsed according to the
conventional commit specification.

Format: type(scope): message

**Example:**

```typescript
const commit: Commitlint = {
  type: 'feat',
  scope: 'api',
  message: 'add new endpoint',
  body: 'Adds support for new API endpoint\n\nBREAKING CHANGE: API format changed'
};
```

---

#### `body` (Property)

**Type:** `string`

**Since:** `2.3.0`

Commit message body with title removed

---

#### `message` (Property)

**Type:** `string`

Main commit message

---

#### `scope` (Property)

**Type:** `string`

Commit scope (e.g., 'api', 'core')

---

#### `type` (Property)

**Type:** `string`

Commit type (e.g., 'feat', 'fix')

---

### `GitChangelogOptions` (Interface)

**Type:** `interface GitChangelogOptions`

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

### `BaseCommit` (TypeAlias)

**Type:** `type BaseCommit`

Base commit type mapping Git commit fields

Maps all available Git commit fields to optional string values.
Uses the CommitField type from gitlog package to ensure type safety.

Available fields include:

- hash: Full commit hash
- abbrevHash: Abbreviated commit hash
- subject: Commit message subject
- authorName: Author's name
- authorDate: Author date
- And many more from gitlog.CommitField

**Example:**

```typescript
const commit: BaseCommit = {
  hash: 'abc123def456',
  abbrevHash: 'abc123',
  subject: 'feat: new feature',
  authorName: 'John Doe',
  authorDate: '2023-01-01'
};
```

---
