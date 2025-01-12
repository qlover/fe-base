#!/usr/bin/env node

import { checkPackages } from '../dist/es/scripts/check-packages.js';

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
  const { dryRun, verbose, ...options } = await programArgs();
  checkPackages({ options, dryRun, verbose });
}

main();
