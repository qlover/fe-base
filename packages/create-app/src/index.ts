#!/usr/bin/env node

import { main } from './cli.js';

main(__dirname).catch((err) => {
  console.error(err);
  process.exit(1);
});
