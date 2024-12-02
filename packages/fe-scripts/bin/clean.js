#!/usr/bin/env node

import { clean } from '../scripts/clean.js';

// parse command line arguments
async function programArgs() {
  try {
    const commander = await import('commander');
    const program = new commander.Command();
    program
      .option('-r, --recursion', 'recursion delete')
      .option('--dry-run', 'preview files to be deleted (will not delete)')
      .option(
        '--gitignore',
        'use .gitignore file to determine files to be deleted'
      )
      .option('-f, --files <files...>', 'clean files');

    // parse arguments
    program.parse();

    // get parsed options
    const options = program.opts();
    console.info('Parsed options:', options); // add log for debugging
    return options;
  } catch {
    console.info('Commander not available, falling back to manual parsing');
    // if commander is not available, parse arguments manually
    const args = process.argv.slice(2);
    const options = {
      recursion: false,
      gitignore: false,
      dryrun: false,
      files: []
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case '-r':
        case '--recursion':
          options.recursion = true;
          break;
        case '--dryrun':
          options.dryrun = true;
          break;
        case '--gitignore':
          options.gitignore = true;
          break;
        case '-f':
        case '--files':
          // collect non-option parameters as files
          i++; // move to the next parameter
          while (i < args.length && !args[i].startsWith('-')) {
            options.files.push(args[i]);
            i++;
          }
          i--; // move back one position because the outer loop will add 1
          break;
      }
    }

    return options;
  }
}

async function main() {
  const { dryRun, verbose, ...options } = await programArgs();
  await clean({ options, dryRun, verbose });
}

main();
