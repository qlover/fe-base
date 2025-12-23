## `ReleaseParams` (Module)

**Type:** `module ReleaseParams`

Release parameter management and formatting

This module provides utilities for managing and formatting release-related
parameters such as branch names, tag names, PR titles, and PR bodies.
It handles both single-package and multi-package (batch) releases.

Core Features:

- Branch name generation
- Tag name formatting
- PR title and body formatting
- Multi-workspace release support
- Template string processing

**Example:** Single package release

```typescript
const params = new ReleaseParams(logger);

const branchParams = params.getReleaseBranchParams(
  [{ name: 'pkg-a', version: '1.0.0' }],
  { branchName: 'release-${tagName}' }
);
// { tagName: '1.0.0', releaseBranch: 'release-1.0.0' }
```

**Example:** Multi-package release

```typescript
const params = new ReleaseParams(logger);

const branchParams = params.getReleaseBranchParams(
  [
    { name: 'pkg-a', version: '1.0.0' },
    { name: 'pkg-b', version: '2.0.0' }
  ],
  {}
);
// {
//   tagName: 'batch-2-packages-1234567890',
//   releaseBranch: 'batch-pkg-a@1.0.0_pkg-b@2.0.0-2-packages-1234567890'
// }
```

---

### `ReleaseParams` (Class)

**Type:** `class ReleaseParams`

Core class for managing release parameters and formatting

Handles the generation and formatting of release-related parameters
such as branch names, tag names, PR titles, and PR bodies. Supports
both single-package and multi-package (batch) releases.

Features:

- Template-based name generation
- Multi-workspace support
- Configurable separators and limits
- PR content formatting

**Example:** Basic usage

```typescript
const params = new ReleaseParams(logger, {
  maxWorkspace: 5,
  multiWorkspaceSeparator: '-',
  PRTitle: 'Release ${pkgName} ${tagName}'
});

const branchParams = params.getReleaseBranchParams(
  [{ name: 'pkg-a', version: '1.0.0' }],
  { branchName: 'release/${tagName}' }
);
```

**Example:** Custom PR formatting

```typescript
const params = new ReleaseParams(logger, {
  PRTitle: 'Release: ${pkgName} v${tagName}',
  PRBody: '## Changes\n${changelog}'
});

const title = params.getPRTitle(branchParams, context);
const body = params.getPRBody(workspaces, branchParams, context);
```

---

#### `new ReleaseParams` (Constructor)

**Type:** `(logger: LoggerInterface<unknown>, config: Partial<ReleaseParamsConfig>) => ReleaseParams`

#### Parameters

| Name     | Type                           | Optional | Default | Since | Deprecated | Description                      |
| -------- | ------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------- |
| `logger` | `LoggerInterface<unknown>`     | ❌       | -       | -     | -          | Logger instance for debug output |
| `config` | `Partial<ReleaseParamsConfig>` | ✅       | `{}`    | -     | -          | Optional configuration overrides |

---

#### `getBatchReleaseBranchName` (Method)

**Type:** `(releaseName: string, tagName: string, shared: ReleaseContextConfig, length: number) => string`

#### Parameters

| Name          | Type                   | Optional | Default | Since | Deprecated | Description                 |
| ------------- | ---------------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `releaseName` | `string`               | ❌       | -       | -     | -          | Combined name of packages   |
| `tagName`     | `string`               | ❌       | -       | -     | -          | Combined version tag        |
| `shared`      | `ReleaseContextConfig` | ❌       | -       | -     | -          | Shared configuration        |
| `length`      | `number`               | ❌       | -       | -     | -          | Number of packages in batch |

---

##### `getBatchReleaseBranchName` (CallSignature)

**Type:** `string`

Generates a release branch name for multiple packages

Uses the batch branch name template from configuration.
Supports variable interpolation with additional batch-specific
variables.

Template Variables:

- ${pkgName}: Package name
- ${releaseName}: Combined release name
- ${tagName}: Combined tag name
- ${length}: Number of packages
- ${timestamp}: Current timestamp
- All shared config properties

**Returns:**

Formatted batch branch name

**Throws:**

Error if branch name template is not a string

**Example:**

```typescript
// With default template
const branch = params.getBatchReleaseBranchName(
  'pkg-a@1.0.0_pkg-b@2.0.0',
  'batch-2-packages-1234567890',
  {},
  2
);
// 'batch-pkg-a@1.0.0_pkg-b@2.0.0-2-packages-1234567890'

// With custom template
const branch = params.getBatchReleaseBranchName(
  'pkg-a@1.0.0_pkg-b@2.0.0',
  'v1.0.0',
  {},
  2
);
// Custom formatted branch name
```

#### Parameters

| Name          | Type                   | Optional | Default | Since | Deprecated | Description                 |
| ------------- | ---------------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `releaseName` | `string`               | ❌       | -       | -     | -          | Combined name of packages   |
| `tagName`     | `string`               | ❌       | -       | -     | -          | Combined version tag        |
| `shared`      | `ReleaseContextConfig` | ❌       | -       | -     | -          | Shared configuration        |
| `length`      | `number`               | ❌       | -       | -     | -          | Number of packages in batch |

---

#### `getPRBody` (Method)

**Type:** `(composeWorkspaces: WorkspaceValue[], releaseBranchParams: ReleaseBranchParams, context: TemplateContext) => string`

#### Parameters

| Name                  | Type                  | Optional | Default | Since | Deprecated | Description                                 |
| --------------------- | --------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `composeWorkspaces`   | `WorkspaceValue[]`    | ❌       | -       | -     | -          | Array of workspace configurations           |
| `releaseBranchParams` | `ReleaseBranchParams` | ❌       | -       | -     | -          | Release branch parameters                   |
| `context`             | `TemplateContext`     | ❌       | -       | -     | -          | Template context for variable interpolation |

---

##### `getPRBody` (CallSignature)

**Type:** `string`

Generates the body content for the release pull request

Handles both single and multi-package releases, combining
changelogs appropriately. For batch releases, formats each
package's changelog according to the batch template.

Template Variables:

- ${tagName}: Release tag or combined workspace versions
- ${changelog}: Single changelog or combined batch changelogs
- All template context properties

**Returns:**

Formatted PR body content

**Example:** Single package

```typescript
const body = params.getPRBody(
  [
    {
      name: 'pkg-a',
      version: '1.0.0',
      changelog: '- Feature: New functionality\n- Fix: Bug fix'
    }
  ],
  {
    tagName: '1.0.0',
    releaseBranch: 'release-1.0.0'
  },
  context
);
// Custom formatted body with single changelog
```

**Example:** Multiple packages

```typescript
const body = params.getPRBody(
  [
    {
      name: 'pkg-a',
      version: '1.0.0',
      changelog: '- Feature: Package A changes'
    },
    {
      name: 'pkg-b',
      version: '2.0.0',
      changelog: '- Feature: Package B changes'
    }
  ],
  {
    tagName: 'batch-2-packages-1234567890',
    releaseBranch: 'batch-release'
  },
  context
);
// Formatted body with combined changelogs:
// ## pkg-a 1.0.0
// - Feature: Package A changes
//
// ## pkg-b 2.0.0
// - Feature: Package B changes
```

#### Parameters

| Name                  | Type                  | Optional | Default | Since | Deprecated | Description                                 |
| --------------------- | --------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `composeWorkspaces`   | `WorkspaceValue[]`    | ❌       | -       | -     | -          | Array of workspace configurations           |
| `releaseBranchParams` | `ReleaseBranchParams` | ❌       | -       | -     | -          | Release branch parameters                   |
| `context`             | `TemplateContext`     | ❌       | -       | -     | -          | Template context for variable interpolation |

---

#### `getPRTitle` (Method)

**Type:** `(releaseBranchParams: ReleaseBranchParams, context: TemplateContext) => string`

#### Parameters

| Name                  | Type                  | Optional | Default | Since | Deprecated | Description                                 |
| --------------------- | --------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `releaseBranchParams` | `ReleaseBranchParams` | ❌       | -       | -     | -          | Release branch parameters                   |
| `context`             | `TemplateContext`     | ❌       | -       | -     | -          | Template context for variable interpolation |

---

##### `getPRTitle` (CallSignature)

**Type:** `string`

Generates a title for the release pull request

Uses the configured PR title template or falls back to the default.
Supports variable interpolation with release parameters and context.

Template Variables:

- ${tagName}: Release tag name
- ${pkgName}: Package/branch name
- All template context properties

**Returns:**

Formatted PR title

**Example:**

```typescript
// With default template
const title = params.getPRTitle(
  {
    tagName: '1.0.0',
    releaseBranch: 'release-1.0.0'
  },
  {
    env: 'production',
    pkgName: 'my-package'
  }
);
// 'Release production my-package 1.0.0'

// With custom template
const title = params.getPRTitle(
  {
    tagName: '1.0.0',
    releaseBranch: 'release-1.0.0'
  },
  {
    env: 'staging',
    pkgName: 'my-package'
  }
);
// Custom formatted title
```

#### Parameters

| Name                  | Type                  | Optional | Default | Since | Deprecated | Description                                 |
| --------------------- | --------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `releaseBranchParams` | `ReleaseBranchParams` | ❌       | -       | -     | -          | Release branch parameters                   |
| `context`             | `TemplateContext`     | ❌       | -       | -     | -          | Template context for variable interpolation |

---

#### `getReleaseBranchName` (Method)

**Type:** `(releaseName: string, tagName: string, shared: ReleaseContextConfig) => string`

#### Parameters

| Name          | Type                   | Optional | Default | Since | Deprecated | Description                               |
| ------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------- |
| `releaseName` | `string`               | ❌       | -       | -     | -          | Name of the package being released        |
| `tagName`     | `string`               | ❌       | -       | -     | -          | Version tag for the release               |
| `shared`      | `ReleaseContextConfig` | ❌       | -       | -     | -          | Shared configuration with branch template |

---

##### `getReleaseBranchName` (CallSignature)

**Type:** `string`

Generates a release branch name for a single package

Uses the branch name template from shared configuration or
falls back to the default template 'release-${tagName}'.
Supports variable interpolation in the template.

Template Variables:

- ${pkgName}: Package name
- ${releaseName}: Release name (same as pkgName)
- ${tagName}: Release tag
- All shared config properties

**Returns:**

Formatted branch name

**Throws:**

Error if branch name template is not a string

**Example:**

```typescript
// With default template
const branch = params.getReleaseBranchName('my-pkg', 'v1.0.0', {});
// 'release-v1.0.0'

// With custom template
const branch = params.getReleaseBranchName('my-pkg', 'v1.0.0', {
  branchName: '${pkgName}-release-${tagName}'
});
// 'my-pkg-release-v1.0.0'
```

#### Parameters

| Name          | Type                   | Optional | Default | Since | Deprecated | Description                               |
| ------------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------- |
| `releaseName` | `string`               | ❌       | -       | -     | -          | Name of the package being released        |
| `tagName`     | `string`               | ❌       | -       | -     | -          | Version tag for the release               |
| `shared`      | `ReleaseContextConfig` | ❌       | -       | -     | -          | Shared configuration with branch template |

---

#### `getReleaseBranchParams` (Method)

**Type:** `(composeWorkspaces: WorkspaceValue[], shared: ReleaseContextConfig) => ReleaseBranchParams`

#### Parameters

| Name                | Type                   | Optional | Default | Since | Deprecated | Description                       |
| ------------------- | ---------------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `composeWorkspaces` | `WorkspaceValue[]`     | ❌       | -       | -     | -          | Array of workspace configurations |
| `shared`            | `ReleaseContextConfig` | ❌       | -       | -     | -          | Shared configuration              |

---

##### `getReleaseBranchParams` (CallSignature)

**Type:** `ReleaseBranchParams`

Generates branch and tag parameters for the release

Combines the generation of branch name and tag name into
a single operation. Handles both single and multi-package
releases appropriately.

**Returns:**

Object containing tag name and branch name

**Example:** Single package

```typescript
const params = releaseParams.getReleaseBranchParams(
  [{ name: 'pkg-a', version: '1.0.0' }],
  { branchName: 'release-${tagName}' }
);
// {
//   tagName: '1.0.0',
//   releaseBranch: 'release-1.0.0'
// }
```

**Example:** Multiple packages

```typescript
const params = releaseParams.getReleaseBranchParams(
  [
    { name: 'pkg-a', version: '1.0.0' },
    { name: 'pkg-b', version: '2.0.0' }
  ],
  {}
);
// {
//   tagName: 'batch-2-packages-1234567890',
//   releaseBranch: 'batch-pkg-a@1.0.0_pkg-b@2.0.0-2-packages-1234567890'
// }
```

#### Parameters

| Name                | Type                   | Optional | Default | Since | Deprecated | Description                       |
| ------------------- | ---------------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `composeWorkspaces` | `WorkspaceValue[]`     | ❌       | -       | -     | -          | Array of workspace configurations |
| `shared`            | `ReleaseContextConfig` | ❌       | -       | -     | -          | Shared configuration              |

---

#### `getReleaseName` (Method)

**Type:** `(composeWorkspaces: WorkspaceValue[]) => string`

#### Parameters

| Name                | Type               | Optional | Default | Since | Deprecated | Description                       |
| ------------------- | ------------------ | -------- | ------- | ----- | ---------- | --------------------------------- |
| `composeWorkspaces` | `WorkspaceValue[]` | ❌       | -       | -     | -          | Array of workspace configurations |

---

##### `getReleaseName` (CallSignature)

**Type:** `string`

Generates a release name from workspace configurations

For single packages, returns the package name.
For multiple packages, combines names and versions up to
the configured maximum number of workspaces.

Format:

- Single: packageName
- Multiple: pkg1@1.0.0_pkg2@2.0.0_pkg3@3.0.0

**Returns:**

Formatted release name

**Example:**

```typescript
// Single package
const name = params.getReleaseName([{ name: 'pkg-a', version: '1.0.0' }]);
// 'pkg-a'

// Multiple packages
const name = params.getReleaseName([
  { name: 'pkg-a', version: '1.0.0' },
  { name: 'pkg-b', version: '2.0.0' }
]);
// 'pkg-a@1.0.0_pkg-b@2.0.0'

// With max limit
const name = params.getReleaseName([
  { name: 'pkg-a', version: '1.0.0' },
  { name: 'pkg-b', version: '2.0.0' },
  { name: 'pkg-c', version: '3.0.0' },
  { name: 'pkg-d', version: '4.0.0' }
]);
// Only first 3: 'pkg-a@1.0.0_pkg-b@2.0.0_pkg-c@3.0.0'
```

#### Parameters

| Name                | Type               | Optional | Default | Since | Deprecated | Description                       |
| ------------------- | ------------------ | -------- | ------- | ----- | ---------- | --------------------------------- |
| `composeWorkspaces` | `WorkspaceValue[]` | ❌       | -       | -     | -          | Array of workspace configurations |

---

#### `getReleaseTagName` (Method)

**Type:** `(composeWorkspaces: WorkspaceValue[]) => string`

#### Parameters

| Name                | Type               | Optional | Default | Since | Deprecated | Description                       |
| ------------------- | ------------------ | -------- | ------- | ----- | ---------- | --------------------------------- |
| `composeWorkspaces` | `WorkspaceValue[]` | ❌       | -       | -     | -          | Array of workspace configurations |

---

##### `getReleaseTagName` (CallSignature)

**Type:** `string`

Generates a tag name for the release

For single packages, uses the package version.
For multiple packages, generates a batch tag name using
the configured template.

Format:

- Single: version
- Multiple: batch-${length}-packages-${timestamp}

**Returns:**

Formatted tag name

**Example:**

```typescript
// Single package
const tag = params.getReleaseTagName([{ name: 'pkg-a', version: '1.0.0' }]);
// '1.0.0'

// Multiple packages
const tag = params.getReleaseTagName([
  { name: 'pkg-a', version: '1.0.0' },
  { name: 'pkg-b', version: '2.0.0' }
]);
// 'batch-2-packages-1234567890'
```

#### Parameters

| Name                | Type               | Optional | Default | Since | Deprecated | Description                       |
| ------------------- | ------------------ | -------- | ------- | ----- | ---------- | --------------------------------- |
| `composeWorkspaces` | `WorkspaceValue[]` | ❌       | -       | -     | -          | Array of workspace configurations |

---

### `ReleaseBranchParams` (TypeAlias)

**Type:** `Object`

---

#### `releaseBranch` (Property)

**Type:** `string`

---

#### `tagName` (Property)

**Type:** `string`

---

### `ReleaseParamsConfig` (TypeAlias)

**Type:** `Object`

---

#### `PRBody` (Property)

**Type:** `string`

The PR body for batch release

default from feConfig.release.PRBody

---

#### `PRTitle` (Property)

**Type:** `string`

**Default:** `Release ${env} ${pkgName} ${tagName}`

The PR title for batch release

default from feConfig.release.PRTitle

---

#### `batchBranchName` (Property)

**Type:** `string`

**Default:** `batch-${releaseName}-${length}-packages-${timestamp}`

The branch name for batch release

---

#### `batchTagName` (Property)

**Type:** `string`

**Default:** `batch-${length}-packages-${timestamp}`

The tag name for batch release

---

#### `maxWorkspace` (Property)

**Type:** `number`

**Default:** `ts
3
`

Max number of workspaces to include in the release name

---

#### `multiWorkspaceSeparator` (Property)

**Type:** `string`

**Default:** `ts
'_'
`

Multi-workspace separator

---

#### `workspaceVersionSeparator` (Property)

**Type:** `string`

**Default:** `ts
'@'
`

Workspace version separator

---
