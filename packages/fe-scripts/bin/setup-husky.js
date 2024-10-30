#!/usr/bin/env node

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { setupHusky } from '../scripts/setup-husky.js';
import { logger, shell } from '../container.js';
async function main() {
  const commitlintPath = join(dirname(fileURLToPath(import.meta.url)), '../');

  await setupHusky({ commitlintPath, logger, shell });
}

main();
