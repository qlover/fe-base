#! /usr/bin/env node

import { release } from './release';
import releaseIt from 'release-it';
import { Command } from 'commander';
import { version, description } from '../package.json';
import { ReleaseContextOptions } from './type';

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
    .option('-P, --pull-request', 'Create a release PR')
    .option(
      '-p, --publish-path <publishPath>',
      'The path of the package to release, map to feConfig.release.publishPath'
    )
    .option(
      '-b, --branch-name <branchName>',
      'The branch name of the release, map to feConfig.release.branchName, default(release-${pkgName}-${tagName})'
    );

  program.parse();

  return program.opts();
}

async function main() {
  const { dryRun, verbose, ...commandOptions } = programArgs();

  const options: ReleaseContextOptions['options'] = {
    ...commandOptions,
    rootPath: process.cwd(),
    // packageJson: packageJson,
    releaseIt: releaseIt
  };

  await release({ dryRun, verbose, options });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
