#!/usr/bin/env node

import { clean } from '../scripts/clean.js';
import { feConfig, logger, shell } from '../container.js';

// parse command line arguments
async function programArgs() {
  try {
    const commander = await import('commander');
    const program = new commander.Command();
    program
      .option('-r, --recursion', 'recursion delete')
      .option('--dryrun', 'preview files to be deleted (will not delete)')
      .option(
        '--gitignore',
        'use .gitignore file to determine files to be deleted'
      )
      .parse(process.argv);

    return program.opts();
  } catch {
    // if commander is not available, parse arguments manually
    const args = process.argv.slice(2);
    return {
      recursion: args.includes('-r') || args.includes('--recursion'),
      gitignore: args.includes('--gitignore'),
      dryrun: args.includes('--dryrun')
    };
  }
}

async function main() {
  const options = await programArgs();
  await clean({
    ...options,
    files: feConfig.config.cleanFiles,
    logger,
    shell
  });
}

main();
