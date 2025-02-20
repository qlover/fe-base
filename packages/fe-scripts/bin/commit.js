#!/usr/bin/env node

import { commit } from '../dist/es/scripts/commit.js';

// parse command line arguments
async function programArgs() {
  const commander = await import('commander');
  const program = new commander.Command();
  program
    .option(
      '-d, --dry-run',
      'Do not touch or write anything, but show the commands'
    )
    .option('-V, --verbose', 'Show more information');
  program.parse();

  return program.opts();
}

async function main() {
  const { dryRun, verbose, ...options } = await programArgs();

  commit({ options, dryRun, verbose });
}

main();
