#!/usr/bin/env node

import { main } from './cli';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

main(__dirname).catch((err) => {
  console.error(err);
  process.exit(1);
});
