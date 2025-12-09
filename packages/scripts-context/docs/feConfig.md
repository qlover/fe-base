## `src/feConfig` (Module)

**Type:** `module src/feConfig`

---

### `FeReleaseConfig` (Interface)

**Type:** `interface FeReleaseConfig`

Configuration interface for automated release process management

Core concept:
Defines comprehensive configuration options for automated release
processes, including PR management, package publishing, and
release workflow customization.

Main features:

- PR management: Automated pull request creation and management
  - Dynamic branch naming with template variables
  - Customizable PR titles and descriptions
  - Automatic PR labeling and categorization
  - Configurable auto-merge behavior and strategies

- Package publishing: Flexible package distribution configuration
  - Custom publish paths for different environments
  - Multi-package directory support for monorepos
  - Package-specific labeling and tracking
  - Environment-aware publishing strategies

- Release workflow: Comprehensive release process control
  - Template-based content generation
  - Environment-specific configurations
  - Integration with CI/CD pipelines
  - Automated changelog and version management

Design considerations:

- All properties are optional for maximum flexibility
- Template variables support dynamic content generation
- Environment-aware configuration for different deployment stages
- Integration with GitHub and other Git hosting platforms
- Support for both single-package and monorepo scenarios

Template variables:

- `${pkgName}`
  : Package name from package.json
- `${tagName}`
  : Release version tag
- `${env}`
  : Release environment (development, staging, production)
- `${branch}`
  : Source branch name
- `${name}`
  : Package name for labeling
- `${changelog}`
  : Generated changelog content

**Example:** Basic release configuration

```typescript
const releaseConfig: FeReleaseConfig = {
  autoMergeReleasePR: true,
  autoMergeType: 'squash',
  branchName: 'release-${pkgName}-${tagName}'
};
```

**Example:** Advanced configuration with custom templates

```typescript
const releaseConfig: FeReleaseConfig = {
  publishPath: './dist',
  autoMergeReleasePR: false,
  branchName: 'feat/release-${pkgName}-v${tagName}',
  PRTitle: '🚀 Release ${pkgName} v${tagName}',
  PRBody: '## Release ${pkgName} v${tagName}\n\n${changelog}',
  label: {
    name: 'release',
    color: '1A7F37',
    description: 'Automated release'
  }
};
```

**Example:** Monorepo configuration

```typescript
const releaseConfig: FeReleaseConfig = {
  packagesDirectories: ['packages/*', 'apps/*'],
  changePackagesLabel: 'changes:${name}',
  autoMergeReleasePR: true
};
```

---

#### `PRBody` (Property)

**Type:** `string`

**Default:** `ts
Comprehensive PR body template with changelog
`

Template for release pull request body content

Core concept:
Defines the content template for release pull request
descriptions, providing comprehensive release information
and automated content generation.

Content sections:

- Release details and metadata
- Generated changelog content
- Review checklist and notes
- Environment and version information
- Automated process notifications

Template variables:

- `${tagName}`
  : Release version tag
- `${branch}`
  : Source branch name
- `${env}`
  : Release environment
- `${changelog}`
  : Generated changelog content
- `${pkgName}`
  : Package name

**Example:** Simple PR body

```typescript
const config: FeReleaseConfig = {
  PRBody: 'Release ${pkgName} v${tagName}\n\n${changelog}'
};
```

**Example:** Detailed PR body

```typescript
const config: FeReleaseConfig = {
  PRBody: `
## Release ${pkgName} v${tagName}

**Environment:** ${env}
**Branch:** ${branch}

### Changes
${changelog}

### Checklist
- [ ] Version number is correct
- [ ] All tests pass
- [ ] Documentation updated
`
};
```

---

#### `PRTitle` (Property)

**Type:** `string`

**Default:** `'[${pkgName} Release] Branch:${branch}, Tag:${tagName}, Env:${env}'`

Template for release pull request titles

Core concept:
Defines the title format for release pull requests using
template variables, providing clear and informative
PR titles for release management.

Title components:

- Package name for identification
- Release version for version tracking
- Environment for deployment context
- Source branch for change tracking
- Consistent formatting for automation

Template variables:

- `${pkgName}`
  : Package name from package.json
- `${tagName}`
  : Release version tag
- `${env}`
  : Release environment
- `${branch}`
  : Source branch name

**Example:** Basic PR title

```typescript
const config: FeReleaseConfig = {
  PRTitle: '[${pkgName} Release] v${tagName}'
};
```

**Example:** Detailed PR title

```typescript
const config: FeReleaseConfig = {
  PRTitle: '🚀 Release ${pkgName} v${tagName} (${env})'
};
```

---

#### `autoMergeReleasePR` (Property)

**Type:** `boolean`

**Default:** `false`

Whether to automatically merge PR when creating and publishing

Core concept:
Controls whether release pull requests should be automatically
merged after successful validation, enabling fully automated
release workflows.

Auto-merge behavior:

- Merges PR after all checks pass
- Uses specified auto-merge type (merge/squash/rebase)
- Triggers post-merge release actions
- Enables continuous deployment workflows
- Reduces manual intervention in release process

Workflow integration:

- Integrates with GitHub auto-merge features
- Supports CI/CD pipeline automation
- Enables fully automated release processes
- Reduces release cycle time
- Maintains release quality through automated checks

**Example:** Enable auto-merge

```typescript
const config: FeReleaseConfig = {
  autoMergeReleasePR: true,
  autoMergeType: 'squash'
};
```

**Example:** Manual review required

```typescript
const config: FeReleaseConfig = {
  autoMergeReleasePR: false
};
```

---

#### `autoMergeType` (Property)

**Type:** `"merge" \| "squash" \| "rebase"`

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

#### `branchName` (Property)

**Type:** `string`

**Default:** `'release-${pkgName}-${tagName}'`

Template for creating release branch names

Core concept:
Defines the naming pattern for release branches using
template variables, enabling consistent and descriptive
branch naming across different packages and environments.

Template variables:

- `${pkgName}`
  : Package name from package.json
- `${tagName}`
  : Release version tag
- `${env}`
  : Release environment
- `${branch}`
  : Source branch name

Branch naming patterns:

- Descriptive names for easy identification
- Consistent format across all releases
- Environment and package-specific naming
- Supports Git branch naming conventions
- Enables automated branch management

**Example:** Basic branch naming

```typescript
const config: FeReleaseConfig = {
  branchName: 'release-${pkgName}-${tagName}'
};
```

**Example:** Environment-aware naming

```typescript
const config: FeReleaseConfig = {
  branchName: 'release/${env}/${pkgName}-${tagName}'
};
```

---

#### `changePackagesLabel` (Property)

**Type:** `string`

**Default:** `'changes:${name}'`

Template for package change labels in monorepos

Core concept:
Defines the naming pattern for labels that identify
which packages have changed in monorepo releases,
enabling targeted review and deployment.

Label usage:

- Applied to PRs when specific packages change
- Enables package-specific review processes
- Supports selective deployment strategies
- Improves monorepo change tracking
- Facilitates team collaboration and review

Template variables:

- `${name}`
  : Package name for label identification

**Example:** Basic change label

```typescript
const config: FeReleaseConfig = {
  changePackagesLabel: 'changes:${name}'
};
```

**Example:** Custom change label

```typescript
const config: FeReleaseConfig = {
  changePackagesLabel: 'package:${name}'
};
```

---

#### `label` (Property)

**Type:** `Object`

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

##### `color` (Property)

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

##### `description` (Property)

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

##### `name` (Property)

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

#### `packagesDirectories` (Property)

**Type:** `string[]`

**Default:** `[]`

Directories containing packages for monorepo releases

Core concept:
Specifies the directories that contain packages for
monorepo release management, enabling selective
package discovery and release coordination.

Directory patterns:

- Supports glob patterns for flexible matching
- Enables selective package inclusion
- Supports nested directory structures
- Facilitates monorepo organization
- Enables workspace-specific configurations

Use cases:

- Monorepo package discovery
- Selective package releases
- Workspace-specific configurations
- Multi-package coordination
- Dependency-aware releases

**Example:** Basic package directories

```typescript
const config: FeReleaseConfig = {
  packagesDirectories: ['packages/*']
};
```

**Example:** Multiple package directories

```typescript
const config: FeReleaseConfig = {
  packagesDirectories: ['packages/*', 'apps/*', 'libs/*']
};
```

---

#### `publishPath` (Property)

**Type:** `string`

**Default:** `''`

The path to publish the package

Core concept:
Specifies the directory path where the package should be
published, allowing for custom distribution locations
and environment-specific publishing strategies.

Publishing behavior:

- Overrides default package.json publishConfig
- Supports both relative and absolute paths
- Used by npm publish and other distribution tools
- Enables environment-specific publishing locations
- Supports custom registry and distribution strategies

Use cases:

- Custom npm registry publishing
- Environment-specific package distribution
- Private package repository publishing
- Alternative distribution platforms
- Testing and staging package distribution

**Example:** Basic publish path

```typescript
const config: FeReleaseConfig = {
  publishPath: './dist'
};
```

**Example:** Custom registry

```typescript
const config: FeReleaseConfig = {
  publishPath: '@myorg/registry'
};
```

---

### `FeConfig` (TypeAlias)

**Type:** `Object`

---

#### `author` (Property)

**Type:** `string \| Object`

**Default:** `package.json -> autor`

Use author name when create merge PR

---

#### `cleanFiles` (Property)

**Type:** `string[]`

**Default:** `ts
["dist","node_modules","yarn.lock","package-lock.json",".eslintcache","*.log"]
`

Run
`fe-clean`
to includes files

---

#### `commitlint` (Property)

**Type:** `UserConfig`

**Default:** `ts
{ "extends": ["@commitlint/config-conventional"] }
`

commitlint config

---

#### `envOrder` (Property)

**Type:** `string[]`

**Default:** `ts
['.env.local', '.env']
`

---

#### `protectedBranches` (Property)

**Type:** `string[]`

**Default:** `ts
["master", "develop", "main"]
`

Run
`fe-clean-branch`
to exclude branches

---

#### `release` (Property)

**Type:** `FeReleaseConfig`

config of CI release

scripts release

---

#### `repository` (Property)

**Type:** `string \| Object`

**Default:** `package.json -> repository`

Use repo info when create merge PR

---

### `defaultFeConfig` (Variable)

**Type:** `FeConfig`

**Default:** `{}`

---
