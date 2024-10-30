#!/usr/bin/env node

import { clean } from '../scripts/clean.js';
import { feConfig, logger } from '../container.js';

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
      .option('-f, --files <files...>', '要清理的文件列表')
      .action(async (options) => {
        try {
          await clean({
            ...options,
            logger: console
          });
        } catch (error) {
          console.error('Clean failed:', error);
          process.exit(1);
        }
      });

    return program.opts();
  } catch {
    // if commander is not available, parse arguments manually
    const args = process.argv.slice(2);
    const options = {
      recursion: false,
      gitignore: false,
      dryrun: false,
      files: []
    };

    // 遍历所有参数
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
          // 收集后续的非选项参数作为文件
          i++; // 移到下一个参数
          while (i < args.length && !args[i].startsWith('-')) {
            options.files.push(args[i]);
            i++;
          }
          i--; // 回退一个位置，因为外层循环会再加1
          break;
      }
    }

    return options;
  }
}

async function main() {
  const options = await programArgs();
  await clean({
    ...options,
    files: options.files?.length ? options.files : feConfig.config.cleanFiles,
    logger
  });
}

main();
