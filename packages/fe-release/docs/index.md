## `FeRelease` (Module)

**Type:** `module FeRelease`

Frontend package release automation framework

Automates monorepo releases: detect changed packages, generate changelogs,
bump versions via Changesets, open GitHub release PRs, and publish to npm.

## Default pipeline

Plugins run in order:

1. **Workspaces** — detect changed packages (by git diff or `changes:*` labels)
2. **ChangesetVersion** — write changesets, run `changeset version`, update CHANGELOG.md
3. **Github** — enrich changelogs with PR/commit links, push release branch, open PR

Configuration lives in `fe-config.json` under the `release` key (merged with
built-in defaults in `release.json`). CLI flags use dot notation, e.g.
`--changesetVersion.increment patch`, `--github.push-change-labels`.

## fe-base workflow (develop → master)

This repository uses a two-stage branch flow. Feature work lands on `develop`;
releases go to `master` through an automated release PR.

```
feature/*  ──PR──►  develop  ──fe-release──►  release/*  ──PR──►  master  ──►  npm
```

### Phase 1 — Feature PR (base: `develop`)

- **CI** (`.github/workflows/general-check.yml`): lint, test, build on every PR.
- Changed packages are detected later by `fe-release` via **git diff** (no `changes:*` labels).

### Phase 2 — Create release PR (trigger: `CI-Release` on merged develop PR)

- **CI** (`.github/workflows/release.yml` → `create-release-pr`):
  - Runs when a **merged** PR into `develop` has the **`CI-Release`** label at merge time,
    or via `workflow_dispatch`.
  - Checks out `develop`, runs `fe-release` in default **`changesetVersion` version** mode (`-s master`).
  - Detects changed packages with git diff, bumps versions, updates `CHANGELOG.md`,
    pushes `release/<repo>-<id>`, opens PR to `master`.
  - The new release PR is labeled **`CI-Release`** (see `release.github.label.name`).
  - Merges into `develop` **without** `CI-Release` do **not** create a release PR (manual gate).

```bash
# Equivalent local / CI command (create release PR)
fe-release -V -s master \
  --changesetVersion.ignore-non-updated-packages
```

Open feature PRs with **`CI-Release`** skip `general-check`.

### Phase 3 — Publish (trigger: release PR merged into `master`)

- **CI** (`.github/workflows/release.yml` → `publish`):
  - Runs when the **`release/* → master`** PR with `CI-Release` is merged.
  - Runs `fe-release` in **publish** mode only — no changelog or version bump (`skip-changeset`).
  - Publishes packages to npm and creates GitHub releases/tags.

```bash
# Equivalent CI command (publish only, versions already bumped in release PR)
fe-release -V \
  --changesetVersion.skip-changeset \
  --changesetVersion.mode publish
```

### Labels

| Label                                                     | Added by                                        | Purpose                                                                        |
| --------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------ |
| `CI-Release`                                              | Manual on develop PR (gate); auto on release PR | Triggers version + release PR; skips general-check; publish on merge to master |
| `increment:major` / `increment:minor` / `increment:patch` | Manual on PR                                    | Override semver bump (default: patch)                                          |

Use a single **`CI-Release`** label for release PRs — do not add a separate `Release` label.

### fe-config.json (minimal example)

```json
{
  "release": {
    "changesetVersion": {
      "changesetRoot": ".changeset",
      "ignoreNonUpdatedPackages": false
    }
  }
}
```

### Manual release

Run the **Release sub packages** workflow manually (`workflow_dispatch`) to create a
release PR from current `develop` without waiting for a feature merge.

## Programmatic API

Core Components:

- Release Management:
  - ReleaseContext: Environment and configuration management
  - ReleaseTask: Task execution and orchestration
  - ReleaseLabel: Version and label management

- Changelog Generation:
  - GitChangeLog: Git-based changelog generation
  - GitChangelogFormatter: Changelog formatting utilities
  - GithubChangelog: GitHub-specific changelog features

- Plugin System:
  - ScriptPlugin: Base plugin infrastructure
  - GitHub PR integration
  - Workspace management

**Example:** Basic usage

```typescript
import { ReleaseContext, ReleaseTask } from '@qlover/fe-release';

// Create release context
const context = new ReleaseContext('my-package', {
  increment: 'patch',
  dryRun: false
});

// Execute release task
const task = new ReleaseTask(context);
await task.exec();
```

**Example:** Custom changelog formatting

```typescript
import { GitChangeLog, GitChangelogFormatter } from '@qlover/fe-release';

class CustomFormatter extends GitChangelogFormatter {
  format(commits) {
    // Custom formatting logic
    return formattedChangelog;
  }
}

const changelog = new GitChangeLog({
  formatter: new CustomFormatter()
});
```

**Example:** Plugin implementation

```typescript
import { ScriptPlugin } from '@qlover/fe-release';

class CustomPlugin extends ScriptPlugin {
  async onExec() {
    // Custom release steps
    await this.step({
      label: 'Custom step',
      task: async () => {
        // Implementation
      }
    });
  }
}
```

---
