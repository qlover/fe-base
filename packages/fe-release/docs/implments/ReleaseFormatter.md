## `ReleaseFormatter` (Module)

**Type:** `module ReleaseFormatter`

Template-based formatting for release branches, commits, and PRs

Centralizes string formatting for the GitHub release flow. Uses
TemplateEngine from `@qlover/scripts-context` with ES6-style
`${ path }` placeholders and variables from <a href="#branchnametplvars-typealias" class="tsd-kind-type-alias">BranchNameTplVars</a>.

Responsibilities:

- **Branch/tag names**: `getReleaseBranch()` from `branchName` / `releaseTagName` templates
- **Commit message**: `getCommitMessage()` with optional `less` / `more` templates when
  workspace count exceeds 3
- **PR content**: `getPRTitle()` and `getPRBody()` with single- vs multi-workspace changelog
  formatting via `batchPRBody`

Defaults are sourced from `releaseJson.github` in defaults.
<a href="../plugins/Github.md#github-module" class="tsd-kind-module">Github</a> constructs an instance and calls `setConfig()` in `onBefore`
with runtime context (`repoName`, `releaseId`, `env`, etc.).

**Example:** Branch name template variables

```typescript
// Template: release/${repoName}-${releaseId}
// Variables: repoName, releaseId, timestamp, authorName, env, count, spaces
formatter.getReleaseBranch(workspaces);
```

**Example:** Multi-workspace PR body

```typescript
formatter.getPRBody(workspaces, releaseBranchResult, templateContext);
```

---

### `ReleaseFormatter` (Class)

**Type:** `class ReleaseFormatter`

Formats release branch names, commit messages, and PR title/body from templates.

Inject a shared TemplateEngine instance (typically from
ReleaseContext.getTemplateEngine) so formatting stays consistent
across plugins.

---

#### `new ReleaseFormatter` (Constructor)

**Type:** `(templateEngine: TemplateEngine, config: ReleaseFormatterConfig) => ReleaseFormatter`

#### Parameters

| Name             | Type                     | Optional | Default | Since | Deprecated | Description |
| ---------------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `templateEngine` | `TemplateEngine`         | ❌       | -       | -     | -          |             |
| `config`         | `ReleaseFormatterConfig` | ❌       | -       | -     | -          |             |

---

#### `config` (Property)

**Type:** `ReleaseFormatterConfig`

---

#### `templateEngine` (Property)

**Type:** `TemplateEngine`

---

#### `defaultBranchNameTpl` (Accessor)

**Type:** `accessor defaultBranchNameTpl`

---

#### `defaultReleaseTagNameTpl` (Accessor)

**Type:** `accessor defaultReleaseTagNameTpl`

---

#### `buildBranchNameVars` (Method)

**Type:** `(workspaces: WorkspaceInterface[]) => BranchNameTplVars`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `buildBranchNameVars` (CallSignature)

**Type:** `BranchNameTplVars`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `buildPRTemplateVars` (Method)

**Type:** `(workspaces: WorkspaceInterface[], releaseBranchResult: ReleaseBranchResult, context: TemplateContext) => Record<string, unknown>`

#### Parameters

| Name                  | Type                   | Optional | Default | Since | Deprecated | Description |
| --------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces`          | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |
| `releaseBranchResult` | `ReleaseBranchResult`  | ❌       | -       | -     | -          |             |
| `context`             | `TemplateContext`      | ❌       | -       | -     | -          |             |

---

##### `buildPRTemplateVars` (CallSignature)

**Type:** `Record<string, unknown>`

#### Parameters

| Name                  | Type                   | Optional | Default | Since | Deprecated | Description |
| --------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces`          | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |
| `releaseBranchResult` | `ReleaseBranchResult`  | ❌       | -       | -     | -          |             |
| `context`             | `TemplateContext`      | ❌       | -       | -     | -          |             |

---

#### `formatPRChangelog` (Method)

**Type:** `(workspaces: WorkspaceInterface[]) => string`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `formatPRChangelog` (CallSignature)

**Type:** `string`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `formatPRTagName` (Method)

**Type:** `(workspaces: WorkspaceInterface[], releaseBranchResult: ReleaseBranchResult) => string`

#### Parameters

| Name                  | Type                   | Optional | Default | Since | Deprecated | Description |
| --------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces`          | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |
| `releaseBranchResult` | `ReleaseBranchResult`  | ❌       | -       | -     | -          |             |

---

##### `formatPRTagName` (CallSignature)

**Type:** `string`

#### Parameters

| Name                  | Type                   | Optional | Default | Since | Deprecated | Description |
| --------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces`          | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |
| `releaseBranchResult` | `ReleaseBranchResult`  | ❌       | -       | -     | -          |             |

---

#### `getCommitMessage` (Method)

**Type:** `(workspaces: WorkspaceInterface[]) => string`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `getCommitMessage` (CallSignature)

**Type:** `string`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `getCommitMessageTpl` (Method)

**Type:** `(count: number) => string`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description |
| ------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `count` | `number` | ✅       | -       | -     | -          |             |

---

##### `getCommitMessageTpl` (CallSignature)

**Type:** `string`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description |
| ------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `count` | `number` | ✅       | -       | -     | -          |             |

---

#### `getPRBody` (Method)

**Type:** `(workspaces: WorkspaceInterface[], releaseBranchResult: ReleaseBranchResult, context: TemplateContext) => string`

#### Parameters

| Name                  | Type                   | Optional | Default | Since | Deprecated | Description |
| --------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces`          | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |
| `releaseBranchResult` | `ReleaseBranchResult`  | ❌       | -       | -     | -          |             |
| `context`             | `TemplateContext`      | ❌       | -       | -     | -          |             |

---

##### `getPRBody` (CallSignature)

**Type:** `string`

#### Parameters

| Name                  | Type                   | Optional | Default | Since | Deprecated | Description |
| --------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces`          | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |
| `releaseBranchResult` | `ReleaseBranchResult`  | ❌       | -       | -     | -          |             |
| `context`             | `TemplateContext`      | ❌       | -       | -     | -          |             |

---

#### `getPRTitle` (Method)

**Type:** `(releaseBranchResult: ReleaseBranchResult, context: TemplateContext, workspaces: WorkspaceInterface[]) => string`

#### Parameters

| Name                  | Type                   | Optional | Default | Since | Deprecated | Description |
| --------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `releaseBranchResult` | `ReleaseBranchResult`  | ❌       | -       | -     | -          |             |
| `context`             | `TemplateContext`      | ❌       | -       | -     | -          |             |
| `workspaces`          | `WorkspaceInterface[]` | ✅       | `[]`    | -     | -          |             |

---

##### `getPRTitle` (CallSignature)

**Type:** `string`

#### Parameters

| Name                  | Type                   | Optional | Default | Since | Deprecated | Description |
| --------------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `releaseBranchResult` | `ReleaseBranchResult`  | ❌       | -       | -     | -          |             |
| `context`             | `TemplateContext`      | ❌       | -       | -     | -          |             |
| `workspaces`          | `WorkspaceInterface[]` | ✅       | `[]`    | -     | -          |             |

---

#### `getReleaseBranch` (Method)

**Type:** `(workspaces: WorkspaceInterface[]) => ReleaseBranchResult`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

##### `getReleaseBranch` (CallSignature)

**Type:** `ReleaseBranchResult`

#### Parameters

| Name         | Type                   | Optional | Default | Since | Deprecated | Description |
| ------------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspaces` | `WorkspaceInterface[]` | ❌       | -       | -     | -          |             |

---

#### `setConfig` (Method)

**Type:** `(config: Partial<ReleaseFormatterConfig>) => void`

#### Parameters

| Name     | Type                              | Optional | Default | Since | Deprecated | Description |
| -------- | --------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `config` | `Partial<ReleaseFormatterConfig>` | ❌       | -       | -     | -          |             |

---

##### `setConfig` (CallSignature)

**Type:** `void`

#### Parameters

| Name     | Type                              | Optional | Default | Since | Deprecated | Description |
| -------- | --------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `config` | `Partial<ReleaseFormatterConfig>` | ❌       | -       | -     | -          |             |

---

### `ReleaseFormatterConfig` (Interface)

**Type:** `interface ReleaseFormatterConfig`

---

#### `PRBody` (Property)

**Type:** `string`

**Default:** `ts
from release.json
`

Pull request body template

---

#### `PRTitle` (Property)

**Type:** `string`

**Default:** `ts
{@link DEFAULT_PR_TITLE}
`

Pull request title template

---

#### `authorName` (Property)

**Type:** `string`

Author name

---

#### `batchPRBody` (Property)

**Type:** `string`

**Default:** `ts
from release.json
`

Template for each workspace section in a multi-workspace PR body

---

#### `branchName` (Property)

**Type:** `string`

**Default:** `release/${repoName}-${releaseId}`

The branch name for batch release

Template variables: see <a href="#branchnametplvars-typealias" class="tsd-kind-type-alias">BranchNameTplVars</a>

---

#### `commitMessage` (Property)

**Type:** `string \| Object`

**Default:** `'chore(release): ${spaces}'`

Commit message template used when creating the release branch

When configured as an object, supports `less` and `more` templates:

- `less`: used when workspace count is 3 or fewer
- `more`: used when workspace count exceeds 3

Supports conventional commit structure: subject, body, and footer.

**Object form is experimental.**

**Example:** Conventional commit layout

```
<type>(<scope>): <subject>    <-- Header/Subject (required)
                              <-- blank line
<body>                        <-- detailed description (optional)
                              <-- blank line
<footer>                      <-- issue refs or BREAKING CHANGE (optional)
```

**Example:** Full template string

```
\`\`\`
chore(release): bump ${worksapce[0].name} to v${worksapce[0].newVersion} and others
  -
\`\`\`
```

By default, lists all package names and versions in the commit message.

---

#### `env` (Property)

**Type:** `string`

Release environment

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

#### `releaseTagName` (Property)

**Type:** `string`

**Default:** `release-tag-${count}-patch-${releaseId}`

The tag name for batch release

Template variables: see <a href="#branchnametplvars-typealias" class="tsd-kind-type-alias">BranchNameTplVars</a>

---

#### `repoName` (Property)

**Type:** `string`

Repository name

---

### `BranchNameTplVars` (TypeAlias)

**Type:** `Object`

---

#### `authorName` (Property)

**Type:** `string`

Author name

---

#### `count` (Property)

**Type:** `number`

Number of workspaces in this release

---

#### `env` (Property)

**Type:** `string`

Release environment (for example `production`)

---

#### `releaseId` (Property)

**Type:** `string`

Unique ID for the current release run

---

#### `repoName` (Property)

**Type:** `string`

Repository name

---

#### `spaces` (Property)

**Type:** `string`

Formatted workspace summary for templates

Typically a comma-separated list of `pkgName@version` entries.
Capped at the first 3 workspaces for display brevity.

---

#### `timestamp` (Property)

**Type:** `string`

Timestamp string used in templates

---

### `ReleaseBranchResult` (TypeAlias)

**Type:** `Object`

---

#### `releaseBranch` (Property)

**Type:** `string`

Release branch name to create and push

---

#### `releaseTagName` (Property)

**Type:** `string`

Tag name associated with the release branch

---
