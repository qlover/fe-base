import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['__tests__/**/*.test.ts'],
    watch: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@server': resolve(__dirname, 'server'),
      '@schemas': resolve(__dirname, 'shared/schemas'),
      '@config': resolve(__dirname, 'shared/config'),
      '@interfaces': resolve(__dirname, 'shared/interfaces'),
      '@shared': resolve(__dirname, 'shared')
    }
  }
});
