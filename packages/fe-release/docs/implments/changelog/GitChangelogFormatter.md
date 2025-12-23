## `GitChangelogFormatter` (Module)

**Type:** `module GitChangelogFormatter`

Formats Git commits into readable changelog entries

This module provides functionality for formatting Git commits into
a structured changelog format, with support for conventional commits,
PR links, and custom templates.

Core Features:

- Conventional commit formatting
- PR and commit linking
- Type-based grouping
- Custom templates
- Markdown formatting

**Example:** Basic usage

```typescript
const formatter = new GitChangelogFormatter({
  shell,
  repoUrl: 'https://github.com/org/repo',
  types: [
    { type: 'feat', section: '### Features' },
    { type: 'fix', section: '### Bug Fixes' }
  ]
});

const changelog = formatter.format(commits);
// ### Features
// - **api:** new endpoint ([abc123](https://github.com/org/repo/commit/abc123)) (#123)
//
// ### Bug Fixes
// - **core:** fix memory leak ([def456](https://github.com/org/repo/commit/def456))
```

**Example:** Custom template

```typescript
const formatter = new GitChangelogFormatter({
  shell,
  formatTemplate: '* ${commitlint.message} ${prLink}',
  types: [{ type: 'feat', section: '## New' }]
});

const changelog = formatter.format(commits);
// ## New
// * add user authentication (#124)
```

---

### `GitChangelogFormatter` (Class)

**Type:** `class GitChangelogFormatter`

Core class for formatting Git commits into changelog entries

Implements ChangelogFormatter interface to provide standardized
changelog generation with support for:

- Conventional commit formatting
- Type-based grouping
- PR and commit linking
- Custom templates
- Markdown formatting

**Example:** Basic usage

```typescript
const formatter = new GitChangelogFormatter({
  shell,
  repoUrl: 'https://github.com/org/repo',
  types: [
    { type: 'feat', section: '### Features' },
    { type: 'fix', section: '### Bug Fixes' }
  ]
});

const changelog = formatter.format(commits);
```

**Example:** Custom formatting

```typescript
const formatter = new GitChangelogFormatter({
  shell,
  formatTemplate: '* ${commitlint.message}',
  types: [{ type: 'feat', section: '## New' }],
  commitBody: true // Include commit body
});
```

---

#### `new GitChangelogFormatter` (Constructor)

**Type:** `(options: Options & Object) => GitChangelogFormatter`

#### Parameters

| Name      | Type               | Optional | Default | Since | Deprecated | Description                                     |
| --------- | ------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `options` | `Options & Object` | ❌       | -       | -     | -          | Configuration options including shell interface |

---

#### `options` (Property)

**Type:** `Options & Object`

Configuration options including shell interface

---

#### `foramtLink` (Method)

**Type:** `(target: string, url: string) => string`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description               |
| -------- | -------- | -------- | ------- | ----- | ---------- | ------------------------- |
| `target` | `string` | ❌       | -       | -     | -          | Text to display           |
| `url`    | `string` | ✅       | -       | -     | -          | Optional URL for the link |

---

##### `foramtLink` (CallSignature)

**Type:** `string`

Formats a target string as a Markdown link

Creates a Markdown-formatted link with optional URL.
If no URL is provided, formats as a plain reference.

**Returns:**

Formatted Markdown link

**Example:** With URL

```typescript
const link = formatter.foramtLink(
  'abc123',
  'https://github.com/org/repo/commit/abc123'
);
// '([abc123](https://github.com/org/repo/commit/abc123))'
```

**Example:** Without URL

```typescript
const link = formatter.foramtLink('abc123');
// '(abc123)'
```

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description               |
| -------- | -------- | -------- | ------- | ----- | ---------- | ------------------------- |
| `target` | `string` | ❌       | -       | -     | -          | Text to display           |
| `url`    | `string` | ✅       | -       | -     | -          | Optional URL for the link |

---

#### `format` (Method)

**Type:** `(commits: CommitValue[], options: Options) => string[]`

#### Parameters

| Name      | Type            | Optional | Default | Since | Deprecated | Description                      |
| --------- | --------------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `commits` | `CommitValue[]` | ❌       | -       | -     | -          | Array of commit values to format |
| `options` | `Options`       | ✅       | -       | -     | -          | Optional formatting options      |

---

##### `format` (CallSignature)

**Type:** `string[]`

Formats an array of commits into changelog entries

Groups commits by type and formats them according to the
configured template and options. Supports commit body
inclusion and type-based sections.

**Returns:**

Array of formatted changelog lines

**Example:** Basic formatting

```typescript
const changelog = formatter.format([
  {
    base: { hash: 'abc123' },
    commitlint: {
      type: 'feat',
      scope: 'api',
      message: 'new endpoint'
    }
  }
]);
// [
//   '### Features',
//   '- **api:** new endpoint ([abc123](...))'
// ]
```

**Example:** With commit body

```typescript
const changelog = formatter.format(
  [
    {
      commitlint: {
        type: 'fix',
        message: 'memory leak',
        body: 'Fixed memory allocation\nAdded cleanup'
      }
    }
  ],
  { commitBody: true }
);
// [
//   '### Bug Fixes',
//   '- memory leak',
//   '  Fixed memory allocation',
//   '  Added cleanup'
// ]
```

#### Parameters

| Name      | Type            | Optional | Default | Since | Deprecated | Description                      |
| --------- | --------------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `commits` | `CommitValue[]` | ❌       | -       | -     | -          | Array of commit values to format |
| `options` | `Options`       | ✅       | -       | -     | -          | Optional formatting options      |

---

#### `formatCommit` (Method)

**Type:** `(commit: CommitValue, options: Options) => string`

#### Parameters

| Name      | Type          | Optional | Default | Since | Deprecated | Description                 |
| --------- | ------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `commit`  | `CommitValue` | ❌       | -       | -     | -          | Commit value to format      |
| `options` | `Options`     | ✅       | -       | -     | -          | Optional formatting options |

---

##### `formatCommit` (CallSignature)

**Type:** `string`

Formats a single commit into a changelog entry

Applies the configured template to a commit, including
scope formatting, PR links, and commit hash links.

**Returns:**

Formatted changelog entry

**Example:** Basic formatting

```typescript
const entry = formatter.formatCommit({
  base: { hash: 'abc123' },
  commitlint: {
    type: 'feat',
    scope: 'api',
    message: 'new endpoint'
  }
});
// '- **api:** new endpoint ([abc123](...))'
```

**Example:** With PR number

```typescript
const entry = formatter.formatCommit({
  base: { hash: 'def456' },
  commitlint: {
    message: 'fix bug'
  },
  prNumber: '123'
});
// '- fix bug ([def456](...)) (#123)'
```

#### Parameters

| Name      | Type          | Optional | Default | Since | Deprecated | Description                 |
| --------- | ------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `commit`  | `CommitValue` | ❌       | -       | -     | -          | Commit value to format      |
| `options` | `Options`     | ✅       | -       | -     | -          | Optional formatting options |

---

#### `formatCommitLink` (Method)

**Type:** `(target: string, url: string) => string`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                |
| -------- | -------- | -------- | ------- | ----- | ---------- | -------------------------- |
| `target` | `string` | ❌       | -       | -     | -          | Commit hash to display     |
| `url`    | `string` | ✅       | -       | -     | -          | Optional URL to the commit |

---

##### `formatCommitLink` (CallSignature)⚠️

**Type:** `string`

Formats a commit hash as a Markdown link

**Returns:**

Formatted Markdown link

**Example:**

```typescript
const link = formatter.formatCommitLink(
  'abc123',
  'https://github.com/org/repo/commit/abc123'
);
// '([abc123](https://github.com/org/repo/commit/abc123))'
```

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                |
| -------- | -------- | -------- | ------- | ----- | ---------- | -------------------------- |
| `target` | `string` | ❌       | -       | -     | -          | Commit hash to display     |
| `url`    | `string` | ✅       | -       | -     | -          | Optional URL to the commit |

---

#### `formatScope` (Method)

**Type:** `(scope: string) => string`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description     |
| ------- | -------- | -------- | ------- | ----- | ---------- | --------------- |
| `scope` | `string` | ❌       | -       | -     | -          | Scope to format |

---

##### `formatScope` (CallSignature)

**Type:** `string`

Formats a commit scope in Markdown

Wraps the scope in bold syntax and adds a colon.

**Returns:**

Formatted scope in Markdown

**Example:**

```typescript
const scope = formatter.formatScope('api');
// '**api:**'
```

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description     |
| ------- | -------- | -------- | ------- | ----- | ---------- | --------------- |
| `scope` | `string` | ❌       | -       | -     | -          | Scope to format |

---

### `Options` (Interface)

**Type:** `interface Options`

Configuration options for changelog formatting

Extends GitChangelogOptions with repository URL support
for generating links to commits and pull requests.

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

#### `repoUrl` (Property)

**Type:** `string`

Repository URL for generating links

**Example:**

```ts
'https://github.com/org/repo';
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
