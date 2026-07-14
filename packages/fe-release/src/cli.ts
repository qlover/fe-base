#! /usr/bin/env node

/**
 * @module FeReleaseCLI
 * @description Command-line interface for the fe-release tool
 *
 * Entry point for `@qlover/fe-release`. Parses CLI flags with Commander.js,
 * maps them to plugin configuration via dot notation, and runs {@link ReleaseTask}.
 *
 * ## Release pipeline
 *
 * Default plugins (in order):
 * 1. **Workspaces** — detect changed monorepo packages
 * 2. **ChangesetVersion** — generate changelogs, write changeset files, run `changeset version`
 * 3. **Github** — enrich changelogs, create release branch and pull request
 *
 * ## Option namespaces
 *
 * Flags use dot notation to target plugin config under `fe-config.json` → `release`:
 *
 * | CLI prefix | fe-config path | Plugin |
 * |------------|----------------|--------|
 * | (global) | `release.sourceBranch` | shared |
 * | `changesetVersion.*` | `release.changesetVersion.*` | ChangesetVersion |
 * | `workspaces.*` | `release.workspaces.*` | Workspaces |
 * | `github.*` | `release.github.*` | Github |
 *
 * Global flags (`--dry-run`, `--verbose`) are passed to {@link ReleaseContext} directly.
 * Shared release options (e.g. `--source-branch`) are merged into `options`.
 *
 * ## Command reference
 *
 * ```bash
 * fe-release [options]
 *
 * Global:
 *   -v, --version                                            Show version
 *   -d, --dry-run                                            Simulate without writing
 *   -V, --verbose                                            Enable debug logging
 *   -s, --source-branch <branch>                             Target merge branch
 *
 * ChangesetVersion:
 *   -i, --changesetVersion.increment <increment>             patch | minor | major | semver
 *   --changesetVersion.mode <mode>                           version | publish | both
 *   --changesetVersion.skip                                  Skip entire plugin
 *   --changesetVersion.skip-changeset                        Skip changeset file generation
 *   --changesetVersion.only-version                          Bump versions only, skip CHANGELOG.md
 *   --changesetVersion.ignore-non-updated-packages           Restore dependency-release workspaces after version
 *   --changelog.ignore-non-updated-packages                  Alias of the above
 *
 * Workspaces:
 *   --workspaces.packages-directories <paths>                Comma-separated package paths
 *   -l, --workspaces.change-labels <labels>                  Comma-separated change labels
 *   --workspaces.skip                                        Skip entire plugin
 *
 * Github:
 *   -b, --github.branch-name <template>                      Release branch name template
 *   --github.skip [lifecycle]                                Skip plugin or a lifecycle (e.g. onSuccess)
 *   --github.skip-create-release-pr                          Skip GitHub PR creation (branch still pushed)
 *   --github.push-change-labels                              Attach change labels to the release PR
 *   --github.auto-merge-release-pr                           Auto-merge the release PR
 * ```
 *
 * @example Basic release
 * ```bash
 * fe-release -i patch
 * fe-release -i minor -d
 * fe-release -i 1.2.0
 * ```
 *
 * @example Monorepo — target specific packages
 * ```bash
 * fe-release --workspaces.packages-directories packages/fe-release,packages/scripts-context -i patch
 * fe-release -l "changes:fe-release" -i patch
 * ```
 *
 * @example Publish flow
 * ```bash
 * fe-release --changesetVersion.mode publish
 * fe-release --changesetVersion.mode both -i minor
 * ```
 *
 * @example Changelog only — skip GitHub PR creation
 * ```bash
 * fe-release -i patch --github.skip-create-release-pr
 * fe-release -i patch --github.skip onSuccess
 * ```
 *
 * @example Custom branches
 * ```bash
 * fe-release -s develop -b "release/${repoName}-${releaseId}"
 * ```
 */

import { Command } from 'commander';
import { version, description } from '../package.json';
import semver from 'semver';
import { reduceOptions } from './utils/args';
import ReleaseTask from './implments/ReleaseTask';
import { releaseJson } from './defaults';

/**
 * Valid version increment types for semver
 * - patch: 1.0.0 -> 1.0.1
 * - minor: 1.0.0 -> 1.1.0
 * - major: 1.0.0 -> 2.0.0
 */
const ALLOWED_INCREMENTS = ['patch', 'minor', 'major'];

const DEFAULT_INCREMENT = releaseJson.changesetVersion.increment;

/**
 * Splits a comma-separated string into an array, removing empty values
 *
 * Used for parsing command-line arguments that accept multiple values:
 * - Change labels (-l, --workspaces.change-labels)
 * - Package directories (--workspaces.packages-directories)
 *
 * @param value - Comma-separated string to split
 * @returns Array of non-empty values
 *
 * @example
 * ```typescript
 * splitWithComma('feature,bugfix,') // ['feature', 'bugfix']
 * splitWithComma('a,,b,c')         // ['a', 'b', 'c']
 * splitWithComma('')               // []
 * ```
 */
const splitWithComma = (value: string) =>
  value.split(',').filter((value) => value != null && value != '');

/**
 * Configures and parses command-line arguments
 *
 * Sets up the command-line interface using Commander.js with all
 * supported options and their validation rules. Options are grouped
 * by functionality:
 * - Global options (dry-run, verbose, source-branch)
 * - Workspaces plugin options (change-labels, packages-directories)
 * - ChangesetVersion plugin options (increment, mode, skip)
 * - Github plugin options (branch-name, skip, push-change-labels)
 *
 * Validation:
 * - Checks increment value against allowed values
 * - Validates semver strings
 * - Processes comma-separated lists
 *
 * @returns Parsed and validated command-line options
 * @throws Error if increment value is invalid
 *
 * @example
 * ```typescript
 * const options = programArgs();
 * // {
 * //   global: { dryRun: true, verbose: false, sourceBranch: 'main' },
 * //   changesetVersion: { increment: 'patch' },
 * //   github: { branchName: 'release-v1' },
 * //   workspaces: { changeLabels: ['feature'] }
 * // }
 * ```
 */
function programArgs() {
  const program = new Command();
  program
    .version(version, '-v, --version', 'Show version')
    .description(description)
    .option(
      '-d, --dry-run',
      'Do not touch or write anything, but show the commands'
    )
    .option('-V, --verbose', 'Show more information')

    .option(
      '-s, --source-branch <sourceBranch>',
      'The source branch of the release (fe-config: release.sourceBranch)'
    )
    .option(
      '-b, --github.branch-name <branchName>',
      'Release branch name template (fe-config: release.github.branchName, default: release/${repoName}-${releaseId})'
    )
    .option(
      '-i, --changesetVersion.increment <increment>',
      'Version increment for generated changeset files (fe-config: release.changesetVersion.increment)',
      (value) => {
        if (!ALLOWED_INCREMENTS.includes(value) && !semver.valid(value)) {
          throw new Error(
            `Invalid increment(-i) Must be one of [${ALLOWED_INCREMENTS.join(', ')}] or valid version string(semver)`
          );
        }
        return value;
      },
      DEFAULT_INCREMENT
    )
    .option(
      '--changesetVersion.skip',
      'Skip the ChangesetVersion plugin'
    )
    .option(
      '--changesetVersion.skip-changeset',
      'Skip generating changeset files in version mode'
    )
    .option(
      '--changesetVersion.only-version',
      'Only bump package.json versions; do not write CHANGELOG.md content'
    )
    .option(
      '--changesetVersion.ignore-non-updated-packages',
      'After changeset version, git-restore dependency-release workspaces; skip their changelog processing (fe-config: release.changesetVersion.ignoreNonUpdatedPackages)'
    )
    .option(
      '--changelog.ignore-non-updated-packages',
      'Alias of --changesetVersion.ignore-non-updated-packages'
    )
    .option(
      '--changesetVersion.mode <mode>',
      'ChangesetVersion mode: version (default), publish, or both (fe-config: release.changesetVersion.mode)',
      (value) => {
        if (value !== 'version' && value !== 'publish' && value !== 'both') {
          throw new Error(
            'Invalid changesetVersion.mode. Must be "version", "publish", or "both"'
          );
        }
        return value;
      },
      'version'
    )
    .option(
      '--workspaces.packages-directories <packagesDirectories>',
      'Changed package paths, comma-separated (fe-config: release.workspaces.packagesDirectories)',
      splitWithComma
    )
    .option(
      '--workspaces.compare-ref <compareRef>',
      'Left side of git diff <compareRef>...HEAD for changed packages (default: origin/<sourceBranch>; use PR base.sha after merge-to-master)'
    )
    .option(
      '-l, --workspaces.change-labels <changeLabels>',
      'Change labels used to detect changed packages, comma-separated',
      splitWithComma
    )
    .option(
      '--workspaces.skip',
      'Skip the Workspaces plugin'
    )
    .option(
      '--github.skip [lifecycle]',
      'Skip the Github plugin (no value) or a lifecycle such as onSuccess'
    )
    .option(
      '--github.skip-create-release-pr',
      'Create and push the release branch but skip opening a GitHub PR (fe-config: release.github.skipCreateReleasePR)'
    )
    .option(
      '--github.push-change-labels',
      'Attach workspace change labels to the release PR (fe-config: release.github.pushChangeLabels)'
    )
    .option(
      '--github.auto-merge-release-pr',
      'Automatically merge the release PR after creation (fe-config: release.github.autoMergeReleasePR)'
    );

  program.parse();

  return reduceOptions(program.opts(), 'global');
}

/**
 * Main entry point for the fe-release CLI
 *
 * Process flow:
 * 1. Parse command-line arguments
 * 2. Extract global and plugin-specific options
 * 3. Create and execute release task
 * 4. Handle any errors that occur
 *
 * Error handling:
 * - Catches and logs all errors
 * - Exits with status code 1 on error
 * - Displays user-friendly error messages
 *
 * @example
 * ```typescript
 * // Normal execution
 * await main();
 *
 * // Error handling
 * main().catch(e => {
 *   console.error('Release failed:', e.message);
 *   process.exit(1);
 * });
 * ```
 */
async function main() {
  const { global, ...pluginOptions } = programArgs();
  const { dryRun, verbose, ...sharedOptions } = global;

  await new ReleaseTask({
    dryRun,
    verbose,
    options: {
      ...sharedOptions,
      ...pluginOptions
    }
  }).exec();
}

// Execute main function with error handling
main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
