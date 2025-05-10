#!/usr/bin/env node

import { cleanBranch, type CleanBranchOptions } from '../scripts/clean-branch';
import { Command } from 'commander';

// parse command line arguments
function programArgs() {
  const program = new Command();
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
  const { dryRun, verbose, ...options } = programArgs();
  cleanBranch({ options: options as CleanBranchOptions, dryRun, verbose });
}

main();
