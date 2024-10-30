#!/usr/bin/env node

import { feConfig } from '../container.js';
import { updateVersion } from '../scripts/release.js';
import { Shell } from '../lib/Shell.js';
import { ScriptsLogger } from '../lib/ScriptsLogger.js';

async function main() {
  const logger = new ScriptsLogger({ debug: true, dryRun: true });

  await updateVersion({
    isCreateRelease: true,
    log: logger,
    shell: new Shell({ log: logger, config: { isDryRun: true } }),
    feConfig: feConfig.config
  });
}

main();
