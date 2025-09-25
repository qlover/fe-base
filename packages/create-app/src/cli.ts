import { resolve } from 'path';
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

export async function main(rootPath: string = process.cwd()) {
  const { dryRun, verbose, ...commandOptions } = programArgs();

  const templateRootPath = resolve(rootPath, './templates');
  const configsRootPath = resolve(rootPath, './configs');

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
