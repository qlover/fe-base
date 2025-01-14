// !/usr/bin/env node

import { dirname, join } from 'path';
import {
  copyFileSync,
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  mkdirSync
} from 'fs';
import { fileURLToPath } from 'url';
import ignore from 'ignore';
import { rimraf } from 'rimraf';

function getIg(targetDir) {
  const gitignorePath = join(targetDir, '.gitignore');
  const gitignoreContent = readFileSync(gitignorePath, 'utf8');
  const ignoreToClean = gitignoreContent
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  const allRules = ignoreToClean;
  // Create ignore instance and add rules
  return ignore().add(allRules);
}

/**
 * copy templates recursively
 * @param {string} templatesDir - source directory
 * @param {string} targetDir - target directory
 * @param {ignore.Ignore} ig - ignore rules
 */
function copyTemplates(templatesDir, targetDir, ig) {
  const items = readdirSync(templatesDir);

  for (const item of items) {
    const sourcePath = join(templatesDir, item);
    const targetPath = join(targetDir, item);

    if (ig.ignores(item)) {
      continue; // ignore files listed in .gitignore
    }

    // check if target directory exists, if not create it
    const targetDirPath = dirname(targetPath);
    if (!existsSync(targetDirPath)) {
      mkdirSync(targetDirPath, { recursive: true }); // create directory and its parent directory
    }

    if (statSync(sourcePath).isDirectory()) {
      copyTemplates(sourcePath, targetPath, ig);
    } else {
      // console.log(`copy ${sourcePath} to ${targetPath}`);
      copyFileSync(sourcePath, targetPath);
    }
  }
}

function main() {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const templatesDir = join(__dirname, '../../../templates');
  const targetDir = join(__dirname, '../templates');

  rimraf.sync(targetDir);

  if (!existsSync(targetDir)) {
    mkdirSync(targetDir);
  }

  // get all sub directories of templatesDir
  const subDirs = readdirSync(templatesDir).filter((item) =>
    statSync(join(templatesDir, item)).isDirectory()
  );

  // copy each sub directory
  subDirs.forEach((subDir) => {
    const sourceSubDir = join(templatesDir, subDir);
    const targetSubDir = join(targetDir, subDir);

    if (!existsSync(targetSubDir)) {
      mkdirSync(targetSubDir);
    }

    // read .gitignore file in sub directory and create ignore rules
    const ig = getIg(sourceSubDir);

    // copy sub directory
    copyTemplates(sourceSubDir, targetSubDir, ig);
  });
}

main();
