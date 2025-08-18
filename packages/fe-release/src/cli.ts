#! /usr/bin/env node

/**
 * @module FeReleaseCLI
 * @description Command-line interface for the fe-release tool
 *
 * This module provides the command-line interface for the fe-release tool,
 * which automates the release process for frontend packages. It handles
 * version management, changelog generation, GitHub PR creation, and
 * workspace management.
 *
 * Core features:
 * - Version management with semver support
 * - Changelog generation and management
 * - GitHub PR creation and management
 * - Workspace package handling
 * - Dry run support for testing
 * - Verbose logging for debugging
 *
 * Command structure:
 * ```bash
 * fe-release [options]
 *
 * Options:
 *   -v, --version                          Show version
 *   -d, --dry-run                          Do not touch or write anything
 *   -V, --verbose                          Show more information
 *   -p, --publish-path <publishPath>       Package path to release
 *   -b, --branch-name <branchName>         Release branch name
 *   -s, --source-branch <sourceBranch>     Source branch for release
 *   -i, --changelog.increment <increment>   Version increment type
 *   -P, --githubPR.release-PR             Create a release PR
 *   -l, --workspaces.change-labels <labels> Change labels for release
 * ```
 *
 * @example Basic usage
 * ```bash
 * # Create a patch release
 * fe-release -i patch
 *
 * # Create a minor release with PR
 * fe-release -i minor -P
 *
 * # Dry run a major release
 * fe-release -i major -d
 * ```
 *
 * @example Workspace release
 * ```bash
 * # Release specific package
 * fe-release -p packages/my-package -i patch
 *
 * # Release with labels
 * fe-release -l "feature,bugfix" -P
 * ```
 *
 * @example Advanced options
 * ```bash
 * # Custom branch and source
 * fe-release -b release-v2 -s develop
 *
 * # Skip certain steps
 * fe-release --changelog.skip --githubPR.skip
 *
 * # Debug mode
 * fe-release -V -d
 * ```
 */

import { Command } from 'commander';
import { version, description } from '../package.json';
import semver from 'semver';
import { reduceOptions } from './utils/args';
import ReleaseTask from './implments/ReleaseTask';

/**
 * Valid version increment types for semver
 * - patch: 1.0.0 -> 1.0.1
 * - minor: 1.0.0 -> 1.1.0
 * - major: 1.0.0 -> 2.0.0
 */
const ALLOWED_INCREMENTS = ['patch', 'minor', 'major'];

/**
 * Default version increment type if none specified
 * Uses patch version increment (0.0.x) for minimal impact
 */
const DEFAULT_INCREMENT = 'patch';

/**
 * Splits a comma-separated string into an array, removing empty values
 *
 * Used for parsing command-line arguments that accept multiple values:
 * - Change labels (-l, --workspaces.change-labels)
 * - Package directories (--packages-directories)
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
 * - Global options (dry-run, verbose)
 * - Workspace options (publish-path, branch-name)
 * - Changelog options (increment, skip)
 * - GitHub PR options (release-PR, labels)
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
 * //   global: { dryRun: true, verbose: false },
 * //   changelog: { increment: 'patch', skip: false },
 * //   githubPR: { releasePR: true }
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

    // to Workspaces use workspace
    .option(
      '-p, --publish-path <publishPath>',
      'The path of the package to release, map to feConfig.release.publishPath'
    )
    .option(
      '-b, --branch-name <branchName>',
      'The branch name of the release, map to feConfig.release.branchName, default(release-${pkgName}-${tagName})'
    )
    .option(
      '-s, --source-branch <sourceBranch>',
      'The source branch of the release'
    )
    // plugins args
    .option(
      '-i, --changelog.increment <increment>',
      'The increment of the release',
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
    .option('--changelog.skip', 'Whether to skip the changelog')
    .option(
      '--changelog.ignore-non-updated-packages',
      'Whether to ignore non updated packages'
    )
    .option('--changelog.skip-changeset', 'Whether to skip the changeset')
    .option('--githubPR.skip', 'Whether to skip the githubPR')
    .option(
      '--packages-directories <packagesDirectories>',
      'The packages that have been changed, multiple values use `,` to split, map to feConfig.release.packagesDirectories',
      splitWithComma
    )
    .option(
      '--githubPR.dry-run-create-PR',
      'Whether to dry run the creation of the pull request'
    )
    .option(
      '--githubPR.push-change-labels',
      'Whether to push the changed labels to the release PR'
    )
    .option('-P, --githubPR.release-PR', 'Create a release PR')
    .option(
      '-l, --workspaces.change-labels <changeLabels>',
      'The change labels of the release, multiple values use `,` to split',
      splitWithComma
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
  const { global, ...allOptions } = programArgs();

  await new ReleaseTask({ ...global, options: allOptions }).exec();
}

// Execute main function with error handling
main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
