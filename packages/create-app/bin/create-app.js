#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Generator } from '../dist/es/index.js';
import { existsSync } from 'fs';

async function main() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const templateRootPath = join(__dirname, '../templates');

  if (!existsSync(templateRootPath)) {
    console.error('Template is empty!');
    process.exit(1);
  }

  const generator = new Generator({
    options: {
      templateRootPath
    }
  });

  await generator.generate();
}

main();
