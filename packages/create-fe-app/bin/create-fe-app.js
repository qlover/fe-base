#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Generator } from '../dist/es/index.js';

async function main() {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const options = {
    options: {
      templatePath: join(__dirname, '../../../templates')
    }
  };

  const generator = new Generator(options);

  await generator.generate();
}

main();
