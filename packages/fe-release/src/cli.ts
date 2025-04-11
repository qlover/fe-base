#! /usr/bin/env node

import type { ReleaseContextOptions } from './type';
import { release } from './release';
import releaseIt from 'release-it';
import { Command } from 'commander';
import { version, description } from '../package.json';
import semver from 'semver';
import { reduceOptions } from './utils/args';

const ALLOWED_INCREMENTS = ['patch', 'minor', 'major'];
const DEFAULT_INCREMENT = 'patch';

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
    .option('-P, --release-PR', 'Create a release PR')
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
      '--pull-request.increment <increment>',
      'The increment of the release, map to feConfig.release.increment',
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
      '--publish-npm.skip-npmrc',
      'Whether to skip setting the npmrc file'
    );

  program.parse();

  return reduceOptions(program.opts(), 'shared');
}

async function main() {
  const { shared: commonOptions, ...allOptions } = programArgs();
  const { dryRun, verbose, ...shared } = commonOptions;

  const options: ReleaseContextOptions['options'] = Object.assign(allOptions, {
    releaseIt: { releaseIt }
  });

  await release({ dryRun, verbose, options, shared });
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
