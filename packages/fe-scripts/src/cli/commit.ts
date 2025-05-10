#!/usr/bin/env node

import { commit, type CommitOptions } from '../scripts/commit';
import { Command, type OptionValues } from 'commander';

// parse command line arguments
function programArgs() {
  const program = new Command();
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
  const { dryRun, verbose, ...options } = programArgs() as OptionValues;

  commit({ options: options as CommitOptions, dryRun, verbose });
}

main();
