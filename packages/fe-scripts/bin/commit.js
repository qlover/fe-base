#!/usr/bin/env node

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { commit } from '../scripts/commit.js';
import { logger, shell } from '../container.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function main() {
  const changelogModules = join(
    __dirname,
    '../../node_modules/cz-conventional-changelog'
  );
  commit({ defaultCzPath: changelogModules, logger, shell });
}

main();
