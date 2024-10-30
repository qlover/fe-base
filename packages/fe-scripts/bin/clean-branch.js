#!/usr/bin/env node

import { cleanBranch } from '../scripts/index.js';
import { feConfig, logger, shell } from '../container.js';

async function main() {
  cleanBranch({
    protectedBranches: feConfig.config.protectedBranches,
    logger,
    shell
  });
}

main();
