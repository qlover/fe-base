/**
 * @module FeRelease
 * @description Frontend package release automation framework
 *
 * Automates monorepo releases: detect changed packages, generate changelogs,
 * bump versions via Changesets, open GitHub release PRs, and publish to npm.
 *
 * ## Default pipeline
 *
 * Plugins run in order:
 * 1. **Workspaces** — detect changed packages (by git diff or `changes:*` labels)
 * 2. **ChangesetVersion** — write changesets, run `changeset version`, update CHANGELOG.md
 * 3. **Github** — enrich changelogs with PR/commit links, push release branch, open PR
 *
 * Configuration lives in `fe-config.json` under the `release` key (merged with
 * built-in defaults in `release.json`). CLI flags use dot notation, e.g.
 * `--changesetVersion.increment patch`, `--github.push-change-labels`.
 *
 * ## fe-base workflow (develop → master)
 *
 * This repository uses a two-stage branch flow. Feature work lands on `develop`;
 * releases go to `master` through an automated release PR.
 *
 * ```
 * feature/*  ──PR──►  develop  ──fe-release──►  release/*  ──PR──►  master  ──►  npm
 * ```
 *
 * ### Phase 1 — Feature PR (base: `develop`)
 *
 * - **CI** (`.github/workflows/general-check.yml`): lint, test, build on every PR.
 * - **check-packages** (`@qlover/fe-scripts`): scans `packages/` changes and adds
 *   labels like `changes:packages/fe-release` to the PR.
 * - Config: `fe-config.json` → `release.workspaces.packagesDirectories` and
 *   `release.workspaces.changePackagesLabel` (default template: `changes:${name}`).
 *
 * ### Phase 2 — Create release PR (trigger: merge into `develop`)
 *
 * - **CI** (`.github/workflows/release.yml` → `create-release-pr`):
 *   - Runs when a non-`CI-Release` PR is merged into `develop`, or via `workflow_dispatch`.
 *   - Checks out `develop`, runs `fe-release` with `-s master`.
 *   - Bumps versions, writes changelogs, pushes `release/<repo>-<id>`, opens PR to `master`.
 *   - The release PR is labeled **`CI-Release`** (see `release.github.label.name`).
 *   - Change labels from the merged feature PR are forwarded via `--workspaces.change-labels`.
 *
 * ```bash
 * # Equivalent local / CI command (create release PR)
 * fe-release -V -s master \
 *   --github.push-change-labels \
 *   --changesetVersion.ignore-non-updated-packages \
 *   --workspaces.change-labels=changes:packages/fe-release
 * ```
 *
 * PRs with the **`CI-Release`** label skip `general-check` (version/changelog already prepared).
 *
 * ### Phase 3 — Publish (trigger: `CI-Release` PR merged into `master`)
 *
 * - **CI** (`.github/workflows/release.yml` → `publish`):
 *   - Runs when a PR with label `CI-Release` is merged into `master`.
 *   - Publishes packages to npm and creates GitHub releases/tags.
 *
 * ```bash
 * # Equivalent CI command (publish only, versions already bumped in release PR)
 * fe-release -V \
 *   --changesetVersion.skip-changeset \
 *   --changesetVersion.mode publish \
 *   --workspaces.change-labels=changes:packages/fe-release,CI-Release
 * ```
 *
 * ### Labels
 *
 * | Label | Added by | Purpose |
 * |-------|----------|---------|
 * | `changes:packages/<name>` | `check-packages` on feature PRs | Marks which packages changed; filters release scope |
 * | `CI-Release` | `fe-release` Github plugin | Marks the release PR to `master`; skips general-check; triggers publish on merge |
 * | `increment:major` / `increment:minor` / `increment:patch` | Manual on PR | Override semver bump (default: patch) |
 *
 * Use a single **`CI-Release`** label for release PRs — do not add a separate `Release` label.
 *
 * ### fe-config.json (minimal example)
 *
 * ```json
 * {
 *   "release": {
 *     "workspaces": {
 *       "packagesDirectories": ["packages"],
 *       "changePackagesLabel": "changes:${name}"
 *     },
 *     "changesetVersion": {
 *       "changesetRoot": ".changeset",
 *       "ignoreNonUpdatedPackages": false
 *     }
 *   }
 * }
 * ```
 *
 * ### Manual release
 *
 * Run the **Release sub packages** workflow manually (`workflow_dispatch`) to create a
 * release PR from current `develop` without waiting for a feature merge.
 *
 * ## Programmatic API
 *
 * Core Components:
 * - Release Management:
 *   - ReleaseContext: Environment and configuration management
 *   - ReleaseTask: Task execution and orchestration
 *   - ReleaseLabel: Version and label management
 *
 * - Changelog Generation:
 *   - GitChangeLog: Git-based changelog generation
 *   - GitChangelogFormatter: Changelog formatting utilities
 *   - GithubChangelog: GitHub-specific changelog features
 *
 * - Plugin System:
 *   - ScriptPlugin: Base plugin infrastructure
 *   - GitHub PR integration
 *   - Workspace management
 *
 * @example Basic usage
 * ```typescript
 * import { ReleaseContext, ReleaseTask } from '@qlover/fe-release';
 *
 * // Create release context
 * const context = new ReleaseContext('my-package', {
 *   increment: 'patch',
 *   dryRun: false
 * });
 *
 * // Execute release task
 * const task = new ReleaseTask(context);
 * await task.exec();
 * ```
 *
 * @example Custom changelog formatting
 * ```typescript
 * import { GitChangeLog, GitChangelogFormatter } from '@qlover/fe-release';
 *
 * class CustomFormatter extends GitChangelogFormatter {
 *   format(commits) {
 *     // Custom formatting logic
 *     return formattedChangelog;
 *   }
 * }
 *
 * const changelog = new GitChangeLog({
 *   formatter: new CustomFormatter()
 * });
 * ```
 *
 * @example Plugin implementation
 * ```typescript
 * import { ScriptPlugin } from '@qlover/fe-release';
 *
 * class CustomPlugin extends ScriptPlugin {
 *   async onExec() {
 *     // Custom release steps
 *     await this.step({
 *       label: 'Custom step',
 *       task: async () => {
 *         // Implementation
 *       }
 *     });
 *   }
 * }
 * ```
 */
export { default as ReleaseContext } from './implments/ReleaseContext';
export { default as ReleaseTask } from './implments/ReleaseTask';
export * from './implments/ReleaseLabel';
export * from './interface/WorkspaceInterface';
export * from './interface/ChangeLog';
export * from './implments/changelog/GitChangeLog';
export * from './implments/changelog/GitChangelogFormatter';
export { default as ChangesetVersion } from './plugins/ChangesetVersion';
export type {
  ChangesetVersionProps,
  ChangesetVersionMode
} from './plugins/ChangesetVersion';
export { ScriptPlugin } from '@qlover/scripts-context';
export * from './type';
export * from './utils/tuple';
export * from './utils/loader';
export * from './utils/factory';
export * from './utils/args';
export * from './defaults';
