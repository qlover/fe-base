import { defineConfig } from 'tsup';
import { builtinModules } from 'module';
import pkg from './package.json';
const external = [
  ...builtinModules,
  ...builtinModules.map((mod) => `node:${mod}`),
  ...Object.keys(pkg.dependencies || {})
];

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: true,
  treeshake: true,
  external,
  platform: 'node'
});
