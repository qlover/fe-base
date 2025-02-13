#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Generator } from '../dist/es/index.js';
import { existsSync, readFileSync } from 'fs';
import { Command } from 'commander';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

function programArgs() {
  const program = new Command();

  program.version(pkg.version, '-v, --version', 'Show version');

  program
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

  const templateRootPath = join(__dirname, '../templates');
  const configsRootPath = join(__dirname, '../configs');

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
