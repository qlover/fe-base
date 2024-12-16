#!/usr/bin/env node

import { cleanBranch } from '../dist/es/scripts/clean-branch.js';

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
    .option('-p, --protected-branches <branches...>', 'The protected branches')
    .option('--merge', 'Whether to merge default protected branches');
  // parse arguments
  program.parse();

  // get parsed options

  return program.opts();
}

async function main() {
  const { dryRun, verbose, ...options } = await programArgs();
  cleanBranch({ options, dryRun, verbose });
}

main();
