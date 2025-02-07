#! /usr/bin/env node

import { release } from '../dist/es/index.js';
import releaseIt from 'release-it';
import { readFileSync } from 'fs';
import { Command } from 'commander';
import { join } from 'path';

function programArgs() {
  const program = new Command();
  program
    .option(
      '-d, --dry-run',
      'Do not touch or write anything, but show the commands'
    )
    .option('-V, --verbose', 'Show more information')
    .option('-P, --pull-request', 'Create a release PR')
    .option(
      '-p, --publish-path <publishPath>',
      'The path of the package to release'
    );
  // parse arguments
  program.parse();

  return program.opts();
}

async function main() {
  const { dryRun, verbose, ...commandOptions } = programArgs();

  const pkgPathRoot = commandOptions.publishPath || './';
  const packageJsonPath = join(pkgPathRoot, './package.json');
  console.log('packageJsonPath', packageJsonPath);

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  /**
   * @type {import('@qlover/fe-release').ReleaseContextOptions['options']}
   */
  const options = {
    ...commandOptions,
    packageJson: packageJson,
    releaseIt: releaseIt
  };

  await release({
    dryRun,
    verbose,
    options
  });
}

main().catch(() => {
  process.exit(1);
});
