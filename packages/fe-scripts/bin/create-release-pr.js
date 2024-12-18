#!/usr/bin/env node

import { createReleasePR } from '../dist/es/scripts/release.js';

// parse command line arguments
async function programArgs() {
  const commander = await import('commander');
  const program = new commander.Command();
  program
    .option(
      '-d, --dry-run',
      'Do not touch or write anything, but show the commands'
    )
    .option('-V, --verbose', 'Show more information')
    .option('-p, --path <path>', 'The path of the package to release')
    .option(
      '-m, --mode <type>',
      'Run mode, 0: use shell run npx command, 1: call release-it method',
      '0'
    );

  // parse arguments
  program.parse();

  // get parsed options
  return program.opts();
}
/**
 * create a PR for release
 *
 * release.js is a truly released script.
 *
 * create-release-pr.js is a script for creating a PR for release.
 * before release.js, we can do some manual/automated work on the PR.
 *
 * 1. create a PR
 * 2. merge the PR
 * 3. release(release.js)
 */
async function main() {
  const { dryRun, verbose, ...options } = await programArgs();
  await createReleasePR({ options, dryRun, verbose });
}

main();
