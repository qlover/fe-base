import { defineConfig } from 'tsup';
import pkg from './package.json';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs'],
    dts: false,
    minify: true,
    clean: true,
    silent: true,
    outDir: 'dist',
    external: Object.keys(pkg.dependencies),
    noExternal: Object.keys(pkg.devDependencies)
  },
  {
    entry: ['src/index.ts'],
    format: 'esm',
    dts: true,
    outDir: 'dist',
    external: Object.keys(pkg.dependencies),
    noExternal: Object.keys(pkg.devDependencies)
  }
]);
