#!/usr/bin/env node

import { feConfig } from '../container.js';
import { createReleasePR } from '../scripts/release.js';
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
  const options = await programArgs();
  const logger = new ScriptsLogger({
    debug: options.verbose,
    dryRun: options.dryrun
  });

  await createReleasePR({
    isCreateRelease: true,
    log: logger,
    shell: new Shell({ log: logger, isDryRun: options.dryrun }),
    feConfig: feConfig.config,
    mode: +options.mode
  });
}

main();
