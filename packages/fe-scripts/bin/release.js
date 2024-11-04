#!/usr/bin/env node

import { feConfig } from '../container.js';
import { release } from '../scripts/release.js';
import { Shell } from '../lib/Shell.js';
import { ScriptsLogger } from '../lib/ScriptsLogger.js';

// parse command line arguments
async function programArgs() {
  const commander = await import('commander');
  const program = new commander.Command();
  program
    .option(
      '-d, --dryrun',
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
  const options = await programArgs();
  const logger = new ScriptsLogger({
    debug: options.verbose,
    dryRun: options.dryrun
  });

  await release({
    log: logger,
    shell: new Shell({ log: logger, isDryRun: options.dryrun }),
    feConfig: feConfig.config,
    mode: +options.mode,
    publishPath: options.path
  });
}

main();
