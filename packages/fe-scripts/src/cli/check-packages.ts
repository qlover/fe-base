#!/usr/bin/env node

import {
  checkPackages,
  type CheckPackagesOptions
} from '../scripts/check-packages';
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
    .option('-r, --repository <repository>', 'The repository name')
    .option('-b, --base-ref <base-ref>', 'The base ref')
    .option('-n, --issue-number <issue-number>', 'The issue number')
    .option('-t, --token <token>', 'The github token');
  // parse arguments
  program.parse();

  // get parsed options

  return program.opts();
}

async function main() {
  const { dryRun, verbose, ...options } = programArgs();
  checkPackages({ options: options as CheckPackagesOptions, dryRun, verbose });
}

main();
