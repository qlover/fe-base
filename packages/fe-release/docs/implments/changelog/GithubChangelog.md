## `GithubChangelog` (Module)

**Type:** `module GithubChangelog`

GitHub-specific changelog generation

This module extends the base changelog functionality with
GitHub-specific features like PR linking, commit filtering
by directory, and workspace-aware changelog generation.

Core Features:

- PR-aware commit gathering
- Directory-based filtering
- GitHub link generation
- Workspace changelog transformation
- Markdown formatting

**Example:** Basic usage

```typescript
const changelog = GithubChangelog.fromContext(context, githubManager);

const commits = await changelog.getFullCommit({
  from: 'v1.0.0',
  directory: 'packages/pkg-a'
});
```

**Example:** Enrich workspace changelog

```typescript
const changelog = GithubChangelog.fromContext(context, githubManager);
const workspace = await changelog.enrichWorkspaceChangelog({
  name: 'pkg-a',
  path: 'packages/a',
  lastTag: 'v1.0.0'
});
// Returns workspace with GitHub links in changelog
```

---

### `GithubChangelog` (Class)

**Type:** `class GithubChangelog`

GitHub-specific changelog generator

Extends the base changelog generator with GitHub-specific
features like PR linking, directory filtering, and workspace
transformation.

Features:

- PR commit aggregation
- Directory-based filtering
- GitHub link generation
- Workspace changelog transformation
- Markdown formatting

**Example:** Basic usage

```typescript
const changelog = GithubChangelog.fromContext(context, githubManager);

const commits = await changelog.getFullCommit({
  from: 'v1.0.0',
  directory: 'packages/pkg-a'
});
```

---

#### `new GithubChangelog` (Constructor)

**Type:** `(options: GithubChangelogProps, githubManager: GithubManager) => GithubChangelog`

#### Parameters

| Name            | Type                   | Optional | Default | Since | Deprecated | Description                  |
| --------------- | ---------------------- | -------- | ------- | ----- | ---------- | ---------------------------- |
| `options`       | `GithubChangelogProps` | ❌       | -       | -     | -          | Changelog generation options |
| `githubManager` | `GithubManager`        | ❌       | -       | -     | -          | GitHub API manager           |

---

#### `githubManager` (Property)

**Type:** `GithubManager`

GitHub API manager

---

#### `options` (Property)

**Type:** `GithubChangelogProps`

Changelog generation options

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

#### `enrichWorkspaceChangelog` (Method)

**Type:** `(workspace: WorkspaceInterface) => Promise<WorkspaceInterface>`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description          |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | -------------------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          | Workspace to process |

---

##### `enrichWorkspaceChangelog` (CallSignature)

**Type:** `Promise<WorkspaceInterface>`

Enriches workspace changelog with GitHub repo content (commit/PR links)

**Returns:**

Promise resolving to updated workspace

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description          |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | -------------------- |
| `workspace` | `WorkspaceInterface` | ❌       | -       | -     | -          | Workspace to process |

---

#### `filterCommitsByDirectory` (Method)

**Type:** `(commits: CommitValue[], directory: string) => Promise<CommitValue[]>`

#### Parameters

| Name        | Type            | Optional | Default | Since | Deprecated | Description                 |
| ----------- | --------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `commits`   | `CommitValue[]` | ❌       | -       | -     | -          | Array of commits to filter  |
| `directory` | `string`        | ❌       | -       | -     | -          | Directory path to filter by |

---

##### `filterCommitsByDirectory` (CallSignature)

**Type:** `Promise<CommitValue[]>`

**Since:** `2.4.0`

Filters commits by directory

Filters commits based on whether they contain changes in
the specified directory. Uses GitHub API to get detailed
commit information.

**Returns:**

Promise resolving to filtered commits

#### Parameters

| Name        | Type            | Optional | Default | Since | Deprecated | Description                 |
| ----------- | --------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `commits`   | `CommitValue[]` | ❌       | -       | -     | -          | Array of commits to filter  |
| `directory` | `string`        | ❌       | -       | -     | -          | Directory path to filter by |

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

#### `getFullCommit` (Method)

**Type:** `(options: GitChangelogOptions) => Promise<CommitValue[]>`

#### Parameters

| Name      | Type                  | Optional | Default | Since | Deprecated | Description       |
| --------- | --------------------- | -------- | ------- | ----- | ---------- | ----------------- |
| `options` | `GitChangelogOptions` | ✅       | -       | -     | -          | Changelog options |

---

##### `getFullCommit` (CallSignature)

**Type:** `Promise<CommitValue[]>`

Gets complete commit information with PR details

Retrieves commits and enhances them with pull request
information. For commits associated with PRs, includes
all PR commits and filters by directory.

When no PR is found, falls back to directory filtering
on the commit itself via GitHub API.

**Returns:**

Promise resolving to enhanced commits

#### Parameters

| Name      | Type                  | Optional | Default | Since | Deprecated | Description       |
| --------- | --------------------- | -------- | ------- | ----- | ---------- | ----------------- |
| `options` | `GitChangelogOptions` | ✅       | -       | -     | -          | Changelog options |

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

#### `fromContext` (Method)

**Type:** `(context: default, githubManager: GithubManager) => GithubChangelog`

#### Parameters

| Name            | Type            | Optional | Default | Since | Deprecated | Description |
| --------------- | --------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context`       | `default`       | ❌       | -       | -     | -          |             |
| `githubManager` | `GithubManager` | ❌       | -       | -     | -          |             |

---

##### `fromContext` (CallSignature)

**Type:** `GithubChangelog`

Creates a GitHub changelog generator from release context

#### Parameters

| Name            | Type            | Optional | Default | Since | Deprecated | Description |
| --------------- | --------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context`       | `default`       | ❌       | -       | -     | -          |             |
| `githubManager` | `GithubManager` | ❌       | -       | -     | -          |             |

---

### `GithubChangelogProps` (Interface)

**Type:** `interface GithubChangelogProps`

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

#### `repoUrl` (Property)

**Type:** `string`

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

### `buildGithubChangelogProps` (Function)

**Type:** `(context: default) => GithubChangelogProps`

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description |
| --------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `default` | ❌       | -       | -     | -          |             |

---

#### `buildGithubChangelogProps` (CallSignature)

**Type:** `GithubChangelogProps`

Builds GitHub changelog options from release context

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description |
| --------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `default` | ❌       | -       | -     | -          |             |

---
