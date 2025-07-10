#!/usr/bin/env node

import { Command } from 'commander';
import { ConsoleHandler, Logger, TimestampFormatter } from '@qlover/logger';
import pkg from '../package.json';
import { Code2MDContextOptions } from './implments/Code2MDContext';
import { Code2MDTask } from './implments/Code2MDTask';
import { dirname, join } from 'path';

const DEFAULT_GENERATE_PATH = './docs.output';
const DEFAULT_OUTPUT_JSON_FILE_PATH = DEFAULT_GENERATE_PATH + '/code2md.json';
const DEFAULT_TPL_PATH = './code2md.tpl.json';

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
  .option(
    '-o, --outputJSONFilePath <path>',
    'Output JSON file path',
    DEFAULT_OUTPUT_JSON_FILE_PATH
  )
  .option('-g, --generatePath <path>', 'Generate path', DEFAULT_GENERATE_PATH)
  .option('-t, --tplPath <path>', 'Template path')
  .option('--onlyJson', 'Only generate JSON file')
  .option('-d, --debug', 'Debug mode')
  .option('--removePrefix', 'Remove prefix of the entry point')
  .option(
    '--formatOutput <tool>',
    'Format output directory with eslint or prettier'
  );

program.parse(process.argv);

const options = program.opts();

const main = async () => {
  const { dryRun, verbose, ...opts } = options;

  // 获取项目根目录路径（兼容 CJS 和 ESM）
  let projectRoot: string;
  if (typeof __dirname !== 'undefined') {
    // CJS 环境
    projectRoot = dirname(__dirname);
  } else {
    // ESM 环境，使用 process.argv[1] 获取脚本路径
    const scriptPath = process.argv[1];
    const scriptDir = dirname(scriptPath);
    projectRoot = dirname(scriptDir);
  }

  // 保持原始值，不进行 resolve
  const tplPath = opts.tplPath || DEFAULT_TPL_PATH;
  const hbsRootDir = join(projectRoot, 'hbs');

  // TODO: 检验参数
  const generaterOptions = {
    ...opts,
    entryPoints: opts.entryPoints as string[], // 保持原始路径数组
    outputJSONFilePath: opts.outputJSONFilePath || '', // 保持原始路径
    generatePath: opts.generatePath, // 保持原始路径
    tplPath, // 保持原始路径
    basePath: process.cwd(),
    hbsRootDir,
    removePrefix: opts.removePrefix || false, // 添加 removePrefix 选项
    formatOutput: opts.formatOutput || undefined // 添加 formatOutput 选项
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
