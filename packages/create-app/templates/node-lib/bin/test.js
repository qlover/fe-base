#! /usr/bin/env node

import { Command } from 'commander';

function programArgs() {
  const program = new Command();
  program
    .option(
      '-d, --dry-run',
      'Do not touch or write anything, but show the commands'
    )
    .option('-V, --verbose', 'Show more information')
    .option('-n, --name <name>', 'The name of the test')
  // parse arguments
  program.parse();

  return program.opts();
}

async function main() {
  const { dryRun, verbose, ...commandOptions } = programArgs();

  console.log('dryRun:', dryRun);
  console.log('verbose:', verbose);
  console.log('commandOptions:', commandOptions);
}

main().catch(() => {
  process.exit(1);
});
