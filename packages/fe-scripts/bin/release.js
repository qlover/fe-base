#!/usr/bin/env node

import { feConfig, logger, shell } from '../container.js';
import { release } from '../scripts/release.js';

/**
 * @returns {Promise<void>}
 */
async function main() {
  await release({
    log: logger,
    shell: shell,
    feConfig: feConfig
  });
}

main();
