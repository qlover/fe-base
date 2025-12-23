## `FeReleaseCLI` (Module)

**Type:** `module FeReleaseCLI`

Command-line interface for the fe-release tool

This module provides the command-line interface for the fe-release tool,
which automates the release process for frontend packages. It handles
version management, changelog generation, GitHub PR creation, and
workspace management.

Core features:

- Version management with semver support
- Changelog generation and management
- GitHub PR creation and management
- Workspace package handling
- Dry run support for testing
- Verbose logging for debugging

Command structure:

```bash
fe-release [options]

Options:
  -v, --version                          Show version
  -d, --dry-run                          Do not touch or write anything
  -V, --verbose                          Show more information
  -p, --publish-path <publishPath>       Package path to release
  -b, --branch-name <branchName>         Release branch name
  -s, --source-branch <sourceBranch>     Source branch for release
  -i, --changelog.increment <increment>   Version increment type
  -P, --githubPR.release-PR             Create a release PR
  -l, --workspaces.change-labels <labels> Change labels for release
```

**Example:** Basic usage

```bash
# Create a patch release
fe-release -i patch

# Create a minor release with PR
fe-release -i minor -P

# Dry run a major release
fe-release -i major -d
```

**Example:** Workspace release

```bash
# Release specific package
fe-release -p packages/my-package -i patch

# Release with labels
fe-release -l "feature,bugfix" -P
```

**Example:** Advanced options

```bash
# Custom branch and source
fe-release -b release-v2 -s develop

# Skip certain steps
fe-release --changelog.skip --githubPR.skip

# Debug mode
fe-release -V -d
```

---
