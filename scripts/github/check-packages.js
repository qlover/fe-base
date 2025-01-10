#!/usr/bin/env node

// import { execSync } from 'child_process';
// import fs from 'fs';
// import path from 'path';

function main() {
  const baseRef = process.argv[2];

  console.log(
    `jj baseRef : ${baseRef} process.argv: ${JSON.stringify(process.argv || [])}`
  );
  return;

  // console.log(`jj baseRef: ${baseRef}`);

  // if (!baseRef) {
  //   return;
  // }

  // const config = JSON.parse(
  //   fs.readFileSync(path.resolve(process.cwd(), 'fe-config.json'), 'utf-8')
  // );

  // console.log(`jj config: ${config}`);

  // const directories = config.releasePackages;

  // console.log(`jj directories: ${directories}`);

  // if (directories.length === 0) {
  //   console.log('no release packages');
  //   return;
  // }

  // const changedPackages = [];
  // directories.forEach((dir) => {
  //   try {
  //     const changedFiles = execSync(
  //       `git diff --name-only origin/${baseRef} HEAD`
  //     ).toString();
  //     console.log(`jj changedFiles: ${changedFiles}`);

  //     // 使用 JavaScript 过滤文件名
  //     const filteredFiles = changedFiles
  //       .split('\n')
  //       .filter((file) => file.startsWith(`packages/${dir}/`));
  //     if (filteredFiles.length > 0) {
  //       changedPackages.push(dir.replace('-', '_')); // 记录发生变化的包
  //     }
  //   } catch {
  //     // 如果没有变化，捕获错误并继续
  //   }
  // });
  // // 输出发生变化的包
  // if (changedPackages.length > 0) {
  //   console.log(`changed_packages=${changedPackages.join(',')}`); // 输出变化的包
  // }
}

main();
