#!/usr/bin/env node

import { join } from 'path';
import { existsSync } from 'fs';
import { Command } from 'commander';
import { Generator } from './Generator';
import pkg from '../package.json';

function programArgs() {
  const program = new Command();

  program
    .version(pkg.version, '-v, --version', 'Show version')
    .description(pkg.description)
    .option(
      '-d, --dry-run',
      'Do not touch or write anything, but show the commands'
    )
    .option('-V, --verbose', 'Show more information')
    .option('--config', 'Copy config files (default: true)', true)
    .option('--no-config', 'Do not copy config files');

  // parse arguments
  program.parse();

  return program.opts();
}

async function main() {
  const { dryRun, verbose, ...commandOptions } = programArgs();

  const rootPath = __dirname;

  const templateRootPath = join(rootPath, '../templates');
  const configsRootPath = join(rootPath, '../configs');

  if (!existsSync(templateRootPath)) {
    console.error('Template is empty!');
    process.exit(1);
  }

  if (!existsSync(configsRootPath)) {
    console.error('Configs is empty!');
    process.exit(1);
  }

  const generator = new Generator({
    dryRun,
    verbose,
    options: {
      ...commandOptions,
      templateRootPath,
      configsRootPath
    }
  });

  await generator.generate();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
