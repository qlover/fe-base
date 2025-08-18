import { defineConfig } from 'tsup';
import pkg from './package.json';
import { builtinModules } from 'module';

const external = [
  ...builtinModules,
  ...builtinModules.map((mod) => `node:${mod}`),
  ...Object.keys(pkg.devDependencies || {})
];

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs'],
    dts: false,
    minify: true,
    clean: true,
    silent: true,
    outDir: 'dist',
    external
  },
  {
    entry: ['src/index.ts'],
    format: 'esm',
    dts: true,
    outDir: 'dist',
    external
  }
]);
