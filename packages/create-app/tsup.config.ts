import { defineConfig } from 'tsup';
import { builtinModules } from 'module';
import pkg from './package.json';

const external = [
  ...builtinModules,
  ...builtinModules.map((mod) => `node:${mod}`),
  ...Object.keys(pkg.devDependencies || {})
];

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  noExternal: ['lodash/merge', 'ignore', '@qlover/logger'],
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: false,
  treeshake: true,
  external,
  platform: 'node'
});
