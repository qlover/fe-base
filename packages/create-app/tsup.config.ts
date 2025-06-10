import { defineConfig } from 'tsup';
import pkg from './package.json';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  dts: false,
  minify: 'terser',
  noExternal: Object.keys(pkg.dependencies),
  splitting: true,
  sourcemap: false,
  clean: true
});
