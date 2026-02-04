import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      './vitest.root.config.ts',
      './examples/*',
      '!./packages/create-app/templates'
    ]
  }
});
