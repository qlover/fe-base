#! /usr/bin/env node

import { Command } from 'commander';
import { version, description } from '../package.json';
import semver from 'semver';
import { reduceOptions } from './utils/args';
import ReleaseTask from './implments/ReleaseTask';

const ALLOWED_INCREMENTS = ['patch', 'minor', 'major'];
const DEFAULT_INCREMENT = 'patch';

const splitWithComma = (value: string) =>
  value.split(',').filter((value) => value != null && value != '');

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

async function main() {
  const { global, ...allOptions } = programArgs();

  await new ReleaseTask({ ...global, options: allOptions }).exec();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
