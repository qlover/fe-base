#!/usr/bin/env node

import { resolve } from 'path';
import { Command } from 'commander';
import { ConsoleHandler, Logger, TimestampFormatter } from '@qlover/logger';
import pkg from '../package.json';
import { Code2MDContextOptions } from './implments/Code2MDContext';
import { Code2MDTask } from './implments/Code2MDTask';

const DEFAULT_GENERATE_PATH = './docs.output';
const DEFAULT_OUTPUT_JSON_FILE_PATH = DEFAULT_GENERATE_PATH + '/code2md.json';
const DEFAULT_TPL_PATH = './code2md.tpl.json';
const DEFAULT_HBS_ROOT_DIR = './hbs';

const program = new Command();

program
  .version(pkg.version, '-v, --version', 'Show version')
  .description(pkg.description)
  .requiredOption('-p, --entryPoints <paths>', 'Entry points', (value) =>
    value.split(',')
  )
  .option(
    '-d, --dry-run',
    'Do not touch or write anything, but show the commands'
  )
  .option('-V, --verbose', 'Show more information')
  .requiredOption('-p, --entryPoints <paths>', 'Entry points', (value) =>
    value.split(',')
  )
  .option(
    '-o, --outputJSONFilePath <path>',
    'Output JSON file path',
    DEFAULT_OUTPUT_JSON_FILE_PATH
  )
  .option('-g, --generatePath <path>', 'Generate path', DEFAULT_GENERATE_PATH)
  .option('-t, --tplPath <path>', 'Template path')
  .option('--onlyJson', 'Only generate JSON file')
  .option('-d, --debug', 'Debug mode')
  .option('--removePrefix', 'Remove prefix of the entry point');

program.parse(process.argv);

const options = program.opts();

const main = async () => {
  const { dryRun, verbose, ...opts } = options;
  const tplPath = opts.tplPath
    ? resolve(opts.tplPath)
    : resolve(opts.generatePath, DEFAULT_TPL_PATH);

  const hbsRootDir = DEFAULT_HBS_ROOT_DIR;

  // TODO: 检验参数
  const generaterOptions = {
    ...opts,
    entryPoints: (opts.entryPoints as string[]).map((entry) => resolve(entry)),
    outputJSONFilePath: opts.outputJSONFilePath
      ? resolve(opts.outputJSONFilePath)
      : '',
    generatePath: resolve(opts.generatePath),
    tplPath,
    basePath: process.cwd(),
    hbsRootDir
  };

  const code2mdOptions: Code2MDContextOptions = {
    logger: new Logger({
      level: verbose ? 'debug' : 'info',
      name: 'code2md',
      handlers: new ConsoleHandler(new TimestampFormatter())
    }),
    verbose: opts.debug ?? verbose,
    dryRun: dryRun,
    options: generaterOptions
  };

  const task = new Code2MDTask(code2mdOptions);

  await task.run();
};

main();
