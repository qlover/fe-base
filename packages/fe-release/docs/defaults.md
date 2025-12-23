## `FeReleaseDefaults` (Module)

**Type:** `module FeReleaseDefaults`

Default configuration values for fe-release

This module provides default values and constants used throughout
the fe-release framework. These values define the default behavior
for version increments, branch names, PR settings, and workspace
configuration.

Categories:

- Version Management: Increment types and branch names
- PR Configuration: Titles, merge settings, and templates
- Workspace Settings: Limits and separators
- Template Configuration: Delimiters and formats

---

### `BATCH_PR_BODY` (Variable)

**Type:** `"

## ${name} ${version}

${changelog}
"`

**Default:** `'\n## ${name} ${version}\n${changelog}\n'`

Template for batch PR body sections

Variables:

- ${name}: Package name
- ${version}: Release version
- ${changelog}: Package changelog

**Example:**

```ts
// With variables:
// ## my-package 1.0.0
// - Feature: Added new functionality
// - Fix: Fixed bug
```

---

### `DEFAULT_AUTO_MERGE_RELEASE_PR` (Variable)

**Type:** `false`

**Default:** `false`

Whether to automatically merge release PRs

Disabled by default for safety
Enable via configuration for automated workflows

---

### `DEFAULT_AUTO_MERGE_TYPE` (Variable)

**Type:** `"squash"`

**Default:** `'squash'`

Default merge strategy for auto-merged PRs

Uses 'squash' to maintain clean history
Options: 'merge', 'squash', 'rebase'

---

### `DEFAULT_INCREMENT` (Variable)

**Type:** `"patch"`

**Default:** `'patch'`

Default version increment type

Uses 'patch' for minimal version changes (0.0.x)
Following semver conventions for backward compatibility

---

### `DEFAULT_PR_TITLE` (Variable)

**Type:** `"Release ${env} ${pkgName} ${tagName}"`

**Default:** `'Release ${env} ${pkgName} ${tagName}'`

Default PR title template

Variables:

- ${env}: Release environment
- ${pkgName}: Package name
- ${tagName}: Release tag

**Example:**

```ts
// With variables:
// Release production my-package v1.0.0
```

---

### `DEFAULT_SOURCE_BRANCH` (Variable)

**Type:** `"master"`

**Default:** `'master'`

Default source branch for releases

Uses 'master' as the default source branch
Can be overridden via configuration or CLI options

---

### `MANIFEST_PATH` (Variable)

**Type:** `"package.json"`

**Default:** `'package.json'`

Path to package manifest file

Standard location for npm package metadata
Used for version management and workspace detection

---

### `MAX_WORKSPACE` (Variable)

**Type:** `3`

**Default:** `3`

Maximum number of workspaces to process

Limits concurrent workspace operations
Prevents resource exhaustion in large monorepos

---

### `MULTI_WORKSPACE_SEPARATOR` (Variable)

**Type:** `"_"`

**Default:** `'_'`

Separator for multi-workspace identifiers

Used when combining multiple workspace names
Example: workspace1_workspace2_workspace3

---

### `TEMPLATE_CLOSE` (Variable)

**Type:** `"}}"`

**Default:** `'}}'`

Template closing delimiter

Used for variable substitution in templates
Paired with TEMPLATE_OPEN

---

### `TEMPLATE_OPEN` (Variable)

**Type:** `"{{"`

**Default:** `'{{'`

Template opening delimiter

Used for variable substitution in templates
Paired with TEMPLATE_CLOSE

---

### `WORKSPACE_VERSION_SEPARATOR` (Variable)

**Type:** `"@"`

**Default:** `'@'`

Separator for workspace version strings

Used in workspace@version format
Example: my-package@1.0.0

---
