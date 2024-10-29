#!/usr/bin/env node

import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { logger, shell } from '../container.js';
import fs from 'fs';

async function main() {
  const relativePath = resolve('./');
  const absoultePath = join(dirname(fileURLToPath(import.meta.url)), '../');

  // 清除现有的 husky 配置
  await shell.exec(`npx rimraf ${join(relativePath, '.husky')}`);

  // 使用命令行安装 husky
  await shell.exec('npx husky init');

  const commitlintConfig = join(absoultePath, 'commitlint.config.js');

  // 创建 commit-msg hook
  const commitMsgPath = join(relativePath, '.husky/commit-msg');
  const commitMsgContent = `npx commitlint --config ${commitlintConfig} --edit "$1"`;
  fs.writeFileSync(commitMsgPath, commitMsgContent, { mode: 0o755 });

  // 创建 pre-commit hook
  const preCommitPath = join(relativePath, '.husky/pre-commit');
  const preCommitContent = `npx lint-staged`;
  fs.writeFileSync(preCommitPath, preCommitContent, { mode: 0o755 });

  // 读取现有的 package.json
  const pkgPath = join(relativePath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

  // 添加 lint-staged 配置
  pkg['lint-staged'] = {
    '*.{js,jsx,ts,tsx}': ['eslint --fix']
  };

  // 写回 package.json
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  logger.info('husky completed');
}

main();
