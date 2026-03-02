#!/usr/bin/env node

import { main } from './cli';

main().catch((err) => {
  if ((err as Error).name === 'ExitPromptError') {
    process.exit(130);
  }
  console.error(err);
  process.exit(1);
});
