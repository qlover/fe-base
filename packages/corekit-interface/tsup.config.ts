import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: false,
    sourcemap: false,
    clean: true,
    minify: false,
    outDir: 'dist'
  },
  {
    entry: ['src/index.ts'],
    format: 'esm',
    dts: true,
    outDir: 'dist'
  }
]);
