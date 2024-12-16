#!/usr/bin/env node

import { release } from '../dist/es/scripts/release.js';

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
 * truly release script
 *
 * now, call `release-it` publish.
 */
async function main() {
  const { dryRun, verbose, ...options } = await programArgs();
  await release({ options, dryRun, verbose });
}

main();
