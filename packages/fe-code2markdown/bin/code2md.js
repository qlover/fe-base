#!/usr/bin/env node

import { dirname, join, resolve } from 'path';
import { Command } from 'commander';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { ReflectionGenerater } from '../lib/index.js';
import { Logger } from '@qlover/fe-utils';
const program = new Command();
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  fs.readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

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
  .option('-d, --debug', 'Debug mode');

program.parse(process.argv);

const options = program.opts();

const main = async () => {
  const tplPath = options.tplPath
    ? resolve(options.tplPath)
    : resolve(options.generatePath, './code2md.tpl.json');

  // TODO: 检验参数
  const generater = new ReflectionGenerater({
    logger: new Logger({ debug: options.debug }),
    entryPoints: options.entryPoints.map((entry) => resolve(entry)),
    outputJSONFilePath: options.outputJSONFilePath
      ? resolve(options.outputJSONFilePath)
      : '',
    generatePath: resolve(options.generatePath),
    tplPath
  });

  await generater.generate(options.onlyJson);
};

main();
