## `GitChangelog` (Module)

**Type:** `module GitChangelog`

Git-based changelog generation and commit parsing

This module provides functionality for generating changelogs from Git
history, parsing commit messages according to conventional commit format,
and managing commit metadata.

Core Features:

- Git log retrieval
- Conventional commit parsing
- Changelog generation
- Tag resolution
- PR number extraction

**Example:** Basic usage

```typescript
const changelog = new GitChangelog({
  shell,
  logger,
  directory: 'packages/my-pkg'
});

// Get commits between tags
const commits = await changelog.getCommits({
  from: 'v1.0.0',
  to: 'v2.0.0'
});
```

**Example:** Commit parsing

```typescript
const changelog = new GitChangelog({ shell, logger });

// Parse conventional commit
const commit = changelog.parseCommitlint(
  'feat(api): add new endpoint',
  'Detailed description\n\nBREAKING CHANGE: API format changed'
);
// {
//   type: 'feat',
//   scope: 'api',
//   message: 'add new endpoint',
//   body: '  Detailed description\n\n  BREAKING CHANGE: API format changed'
// }
```

---

### `GitChangelog` (Class)

**Type:** `class GitChangelog`

Core class for Git-based changelog generation

Provides functionality for retrieving and parsing Git commit history,
generating changelogs, and managing commit metadata. Implements the
ChangeLogInterface for standardized changelog generation.

Features:

- Git log retrieval with flexible options
- Conventional commit parsing
- Tag resolution and validation
- PR number extraction
- Commit body formatting

**Example:** Basic usage

```typescript
const changelog = new GitChangelog({
  shell,
  logger,
  directory: 'packages/my-pkg'
});

// Get commits with parsed metadata
const commits = await changelog.getCommits({
  from: 'v1.0.0',
  to: 'v2.0.0',
  noMerges: true
});
```

**Example:** Custom commit parsing

```typescript
const changelog = new GitChangelog({ shell, logger });

// Create commit value from hash and message
const commit = changelog.toCommitValue(
  'abc1234',
  'feat(api): new endpoint (#123)'
);
// {
//   base: { hash: 'abc1234', ... },
//   commitlint: { type: 'feat', scope: 'api', ... },
//   prNumber: '123'
// }
```

---

#### `new GitChangelog` (Constructor)

**Type:** `(options: GitChangelogProps) => GitChangelog`

#### Parameters

| Name      | Type                | Optional | Default | Since | Deprecated | Description                                      |
| --------- | ------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `options` | `GitChangelogProps` | ❌       | -       | -     | -          | Configuration options including shell and logger |

---

#### `options` (Property)

**Type:** `GitChangelogProps`

Configuration options including shell and logger

---

#### `createBaseCommit` (Method)

**Type:** `(message: string, target: Partial<BaseCommit>) => BaseCommit`

#### Parameters

| Name      | Type                  | Optional | Default | Since | Deprecated | Description                     |
| --------- | --------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `message` | `string`              | ❌       | -       | -     | -          | Commit message                  |
| `target`  | `Partial<BaseCommit>` | ✅       | -       | -     | -          | Optional additional commit data |

---

##### `createBaseCommit` (CallSignature)

**Type:** `BaseCommit`

Creates a base commit object from message and optional data

Utility method to create a standardized commit object with
basic metadata. Used internally for commit value creation.

**Returns:**

Base commit object

**Example:**

```typescript
const commit = changelog.createBaseCommit('feat: new feature', {
  hash: 'abc123',
  authorName: 'John Doe'
});
```

#### Parameters

| Name      | Type                  | Optional | Default | Since | Deprecated | Description                     |
| --------- | --------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `message` | `string`              | ❌       | -       | -     | -          | Commit message                  |
| `target`  | `Partial<BaseCommit>` | ✅       | -       | -     | -          | Optional additional commit data |

---

#### `getCommits` (Method)

**Type:** `(options: GitChangelogOptions) => Promise<CommitValue[]>`

#### Parameters

| Name      | Type                  | Optional | Default | Since | Deprecated | Description                                 |
| --------- | --------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `options` | `GitChangelogOptions` | ✅       | -       | -     | -          | Configuration options for Git log retrieval |

---

##### `getCommits` (CallSignature)

**Type:** `Promise<CommitValue[]>`

Retrieves and parses Git commits with metadata

Gets commit history and enhances it with parsed conventional
commit information and PR metadata.

**Returns:**

Array of enhanced commit objects with parsed metadata

**Example:** Basic usage

```typescript
const commits = await changelog.getCommits({
  from: 'v1.0.0',
  to: 'v2.0.0'
});
// [
//   {
//     base: { hash: '...', subject: '...' },
//     commitlint: { type: 'feat', scope: 'api', ... },
//     commits: []
//   }
// ]
```

**Example:** Filtered commits

```typescript
const commits = await changelog.getCommits({
  directory: 'packages/my-pkg',
  noMerges: true
});
```

#### Parameters

| Name      | Type                  | Optional | Default | Since | Deprecated | Description                                 |
| --------- | --------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `options` | `GitChangelogOptions` | ✅       | -       | -     | -          | Configuration options for Git log retrieval |

---

#### `getGitLog` (Method)

**Type:** `(options: GitChangelogOptions) => Promise<BaseCommit[]>`

#### Parameters

| Name      | Type                  | Optional | Default | Since | Deprecated | Description                                 |
| --------- | --------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `options` | `GitChangelogOptions` | ✅       | `{}`    | -     | -          | Configuration options for Git log retrieval |

---

##### `getGitLog` (CallSignature)

**Type:** `Promise<BaseCommit[]>`

Retrieves Git commit history with specified options

Fetches commit information between specified tags or commits,
with support for filtering and field selection.

**Returns:**

Array of commit objects with requested fields

**Example:** Basic usage

```typescript
const commits = await changelog.getGitLog({
  from: 'v1.0.0',
  to: 'v2.0.0',
  directory: 'packages/my-pkg',
  noMerges: true
});
```

**Example:** Custom fields

```typescript
const commits = await changelog.getGitLog({
  fields: ['hash', 'subject', 'authorName'],
  directory: 'src'
});
```

#### Parameters

| Name      | Type                  | Optional | Default | Since | Deprecated | Description                                 |
| --------- | --------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `options` | `GitChangelogOptions` | ✅       | `{}`    | -     | -          | Configuration options for Git log retrieval |

---

#### `parseCommitlint` (Method)

**Type:** `(subject: string, rawBody: string) => Commitlint`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description              |
| --------- | -------- | -------- | ------- | ----- | ---------- | ------------------------ |
| `subject` | `string` | ❌       | -       | -     | -          | Commit subject line      |
| `rawBody` | `string` | ✅       | `''`    | -     | -          | Full commit message body |

---

##### `parseCommitlint` (CallSignature)

**Type:** `Commitlint`

Parses a commit message into conventional commit format

Extracts type, scope, message, and body from a commit message
following the conventional commit specification.

Format: type(scope): message

**Returns:**

Parsed conventional commit data

**Example:** Basic commit

```typescript
const commit = changelog.parseCommitlint('feat(api): add new endpoint');
// {
//   type: 'feat',
//   scope: 'api',
//   message: 'add new endpoint'
// }
```

**Example:** With body

```typescript
const commit = changelog.parseCommitlint(
  'fix(core): memory leak',
  'Fixed memory leak in core module\n\nBREAKING CHANGE: API changed'
);
// {
//   type: 'fix',
//   scope: 'core',
//   message: 'memory leak',
//   body: '  Fixed memory leak in core module\n\n  BREAKING CHANGE: API changed'
// }
```

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description              |
| --------- | -------- | -------- | ------- | ----- | ---------- | ------------------------ |
| `subject` | `string` | ❌       | -       | -     | -          | Commit subject line      |
| `rawBody` | `string` | ✅       | `''`    | -     | -          | Full commit message body |

---

#### `resolveTag` (Method)

**Type:** `(tag: string, fallback: string) => Promise<string>`

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description                       |
| ---------- | -------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `tag`      | `string` | ✅       | -       | -     | -          | Tag name to resolve               |
| `fallback` | `string` | ✅       | -       | -     | -          | Fallback value ('root' or 'HEAD') |

---

##### `resolveTag` (CallSignature)

**Type:** `Promise<string>`

Resolves a Git tag or reference to a valid commit reference

Attempts to resolve a tag name to a valid Git reference.
Falls back to root commit or HEAD if tag doesn't exist.

**Returns:**

Resolved Git reference

**Example:** Basic tag resolution

```typescript
const ref = await changelog.resolveTag('v1.0.0');
// 'v1.0.0' if tag exists
// 'HEAD' if tag doesn't exist
```

**Example:** Root commit fallback

```typescript
const ref = await changelog.resolveTag('non-existent-tag', 'root');
// First commit hash if tag doesn't exist
```

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description                       |
| ---------- | -------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `tag`      | `string` | ✅       | -       | -     | -          | Tag name to resolve               |
| `fallback` | `string` | ✅       | -       | -     | -          | Fallback value ('root' or 'HEAD') |

---

#### `tabify` (Method)

**Type:** `(body: string, size: number) => string`

#### Parameters

| Name   | Type     | Optional | Default | Since | Deprecated | Description                          |
| ------ | -------- | -------- | ------- | ----- | ---------- | ------------------------------------ |
| `body` | `string` | ❌       | -       | -     | -          | Text to indent                       |
| `size` | `number` | ✅       | `2`     | -     | -          | Number of spaces to add (default: 2) |

---

##### `tabify` (CallSignature)

**Type:** `string`

**Since:** `2.3.2`

Indents each line of a text block

Adds specified number of spaces to the start of each line
in a multi-line string. Used for formatting commit body text.

**Returns:**

Indented text

**Example:**

```typescript
const text = changelog.tabify('Line 1\nLine 2\nLine 3', 4);
// '    Line 1\n    Line 2\n    Line 3'
```

#### Parameters

| Name   | Type     | Optional | Default | Since | Deprecated | Description                          |
| ------ | -------- | -------- | ------- | ----- | ---------- | ------------------------------------ |
| `body` | `string` | ❌       | -       | -     | -          | Text to indent                       |
| `size` | `number` | ✅       | `2`     | -     | -          | Number of spaces to add (default: 2) |

---

#### `toCommitValue` (Method)

**Type:** `(hash: string, message: string) => CommitValue`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description         |
| --------- | -------- | -------- | ------- | ----- | ---------- | ------------------- |
| `hash`    | `string` | ❌       | -       | -     | -          | Commit hash         |
| `message` | `string` | ❌       | -       | -     | -          | Full commit message |

---

##### `toCommitValue` (CallSignature)

**Type:** `CommitValue`

Creates a complete commit value object from hash and message

Combines commit hash, parsed conventional commit data, and
PR information into a single commit value object.

**Returns:**

Complete commit value object

**Example:** Basic commit

```typescript
const commit = changelog.toCommitValue('abc123', 'feat(api): new endpoint');
// {
//   base: {
//     hash: 'abc123',
//     abbrevHash: 'abc123',
//     subject: 'feat(api): new endpoint'
//   },
//   commitlint: {
//     type: 'feat',
//     scope: 'api',
//     message: 'new endpoint'
//   },
//   commits: []
// }
```

**Example:** PR commit

```typescript
const commit = changelog.toCommitValue(
  'def456',
  'fix(core): memory leak (#123)'
);
// {
//   base: { hash: 'def456', ... },
//   commitlint: { type: 'fix', ... },
//   commits: [],
//   prNumber: '123'
// }
```

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description         |
| --------- | -------- | -------- | ------- | ----- | ---------- | ------------------- |
| `hash`    | `string` | ❌       | -       | -     | -          | Commit hash         |
| `message` | `string` | ❌       | -       | -     | -          | Full commit message |

---

### `GitChangelogProps` (Interface)

**Type:** `interface GitChangelogProps`

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

#### `logger` (Property)

**Type:** `LoggerInterface<unknown>`

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

#### `shell` (Property)

**Type:** `ShellInterface`

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

### `CHANGELOG_ALL_FIELDS` (Variable)

**Type:** `CommitField[]`

**Default:** `[]`

Complete list of available Git commit fields

These fields can be used when retrieving commit information
to specify which data should be included in the output.

**Example:**

```typescript
const commits = await changelog.getGitLog({
  fields: CHANGELOG_ALL_FIELDS
});
```

---
