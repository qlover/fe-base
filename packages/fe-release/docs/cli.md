## `FeReleaseCLI` (Module)

**Type:** `module FeReleaseCLI`

Command-line interface for the fe-release tool

Entry point for `@qlover/fe-release`. Parses CLI flags with Commander.js,
maps them to plugin configuration via dot notation, and runs <a href="./implments/ReleaseTask.md#releasetask-module" class="tsd-kind-module">ReleaseTask</a>.

## Release pipeline

Default plugins (in order):

1. **Workspaces** — detect changed monorepo packages
2. **ChangesetVersion** — generate changelogs, write changeset files, run `changeset version`
3. **Github** — enrich changelogs, create release branch and pull request

## Option namespaces

Flags use dot notation to target plugin config under `fe-config.json` → `release`:

| CLI prefix           | fe-config path               | Plugin           |
| -------------------- | ---------------------------- | ---------------- |
| (global)             | `release.sourceBranch`       | shared           |
| `changesetVersion.*` | `release.changesetVersion.*` | ChangesetVersion |
| `workspaces.*`       | `release.workspaces.*`       | Workspaces       |
| `github.*`           | `release.github.*`           | Github           |

Global flags (`--dry-run`, `--verbose`) are passed to <a href="./implments/ReleaseContext.md#releasecontext-module" class="tsd-kind-module">ReleaseContext</a> directly.
Shared release options (e.g. `--source-branch`) are merged into `options`.

## Command reference

```bash
fe-release [options]

Global:
  -v, --version                                            Show version
  -d, --dry-run                                            Simulate without writing
  -V, --verbose                                            Enable debug logging
  -s, --source-branch <branch>                             Target merge branch

ChangesetVersion:
  -i, --changesetVersion.increment <increment>             patch | minor | major | semver
  --changesetVersion.mode <mode>                           version | publish | both
  --changesetVersion.skip                                  Skip entire plugin
  --changesetVersion.skip-changeset                        Skip changeset file generation
  --changesetVersion.only-version                          Bump versions only, skip CHANGELOG.md
  --changesetVersion.ignore-non-updated-packages           Restore dependency-release workspaces after version
  --changelog.ignore-non-updated-packages                  Alias of the above

Workspaces:
  --workspaces.packages-directories <paths>                Comma-separated package paths
  -l, --workspaces.change-labels <labels>                  Comma-separated change labels
  --workspaces.skip                                        Skip entire plugin

Github:
  -b, --github.branch-name <template>                      Release branch name template
  --github.skip [lifecycle]                                Skip plugin or a lifecycle (e.g. onSuccess)
  --github.skip-create-release-pr                          Skip GitHub PR creation (branch still pushed)
  --github.push-change-labels                              Attach change labels to the release PR
  --github.auto-merge-release-pr                           Auto-merge the release PR
```

**Example:** Basic release

```bash
fe-release -i patch
fe-release -i minor -d
fe-release -i 1.2.0
```

**Example:** Monorepo — target specific packages

```bash
fe-release --workspaces.packages-directories packages/fe-release,packages/scripts-context -i patch
fe-release -l "changes:fe-release" -i patch
```

**Example:** Publish flow

```bash
fe-release --changesetVersion.mode publish
fe-release --changesetVersion.mode both -i minor
```

**Example:** Changelog only — skip GitHub PR creation

```bash
fe-release -i patch --github.skip-create-release-pr
fe-release -i patch --github.skip onSuccess
```

**Example:** Custom branches

```bash
fe-release -s develop -b "release/${repoName}-${releaseId}"
```

---
