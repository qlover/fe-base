#!/usr/bin/env node

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { setupHusky } from '../dist/es/scripts/setup-husky.js';

async function main() {
  const commitlintPath = join(dirname(fileURLToPath(import.meta.url)), '../');

  await setupHusky({ options: { commitlintPath } });
}

main();
