import { defineConfig } from 'tsup';
import pkg from './package.json';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  minify: 'terser',
  noExternal: Object.keys(pkg.devDependencies),
  splitting: true,
  sourcemap: false,
  clean: true
});
