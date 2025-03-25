#! /usr/bin/env node

import { release } from '../dist/es/index.js';
import releaseIt from 'release-it';
import { readFileSync } from 'fs';
import { Command } from 'commander';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf8')
);

function programArgs() {
  const program = new Command();
  program
    .version(pkg.version, '-v, --version', 'Show version')
    .description(pkg.description)
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
  // parse arguments
  program.parse();

  return program.opts();
}

async function main() {
  const { dryRun, verbose, ...commandOptions } = programArgs();

  const pkgPathRoot = commandOptions.publishPath || './';
  const packageJsonPath = join(pkgPathRoot, './package.json');
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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
