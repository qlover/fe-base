#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Generator } from '../dist/es/index.js';
import { existsSync } from 'fs';

async function main() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const templatePath = join(__dirname, '../templates');

  const options = {
    options: {
      templatePath
    }
  };

  if (!existsSync(templatePath)) {
    console.error('Template is empty!');
    process.exit(1);
  }

  const generator = new Generator(options);

  await generator.generate();
}

main();
