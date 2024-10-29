#!/usr/bin/env node

import { logger, feConfig } from '../container.js';
import { rimraf } from 'rimraf';

async function main() {
  const config = feConfig.config;
  const files = config.cleanFiles.join(' ');
  // https://stackoverflow.com/questions/75281066/error-illegal-characters-in-path-in-npm-rimraf
  await rimraf(config.cleanFiles, { glob: true });
  logger.info('Clean successfully', files);
}

main();
