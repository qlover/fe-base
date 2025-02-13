#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Generator } from '../dist/es/index.js';
import { existsSync } from 'fs';

async function main() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
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
    options: {
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
