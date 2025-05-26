#!/usr/bin/env node

import { join, resolve } from 'path';
import { Command } from 'commander';
import { ConsoleHandler, Logger, TimestampFormatter } from '@qlover/logger';
import pkg from '../package.json';
import { ReflectionGenerater } from './ReflectionGenerater';
import { Utils } from './Utils';

const program = new Command();

program
  .version(pkg.version)
  .requiredOption('-p, --entryPoints <paths>', 'Entry points', (value) =>
    value.split(',')
  )
  .option(
    '-o, --outputJSONFilePath <path>',
    'Output JSON file path',
    './docs.output/code2md.json'
  )
  .option('-g, --generatePath <path>', 'Generate path', './docs.output')
  .option('-t, --tplPath <path>', 'Template path')
  .option('--onlyJson', 'Only generate JSON file')
  .option('-d, --debug', 'Debug mode')
  .option('-l, --coverterLevel <level>', 'Converter level', '1');

program.parse(process.argv);

const options = program.opts();

const main = async () => {
  const { dryRun, verbose, ...opts } = options;
  const tplPath = opts.tplPath
    ? resolve(opts.tplPath)
    : resolve(opts.generatePath, './code2md.tpl.json');

  // fixed hbs root dir
  const currentDir = Utils.getCurrentDirPath(
    typeof import.meta !== 'undefined' ? import.meta : undefined
  );

  const hbsRootDir = resolve(join(currentDir, '../hbs'));

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

  const generater = new ReflectionGenerater({
    logger: new Logger({
      level: (opts.debug ?? verbose) ? 'debug' : 'info',
      name: 'code2md',
      handlers: new ConsoleHandler(new TimestampFormatter())
    }),
    verbose: opts.debug ?? verbose,
    dryRun: dryRun,
    options: generaterOptions
  });

  await generater.generate(opts.onlyJson);
};

main();
