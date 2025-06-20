import { defineConfig } from 'tsup';
import { builtinModules } from 'module';
import pkg from './package.json';
const external = [
  ...builtinModules,
  ...builtinModules.map((mod) => `node:${mod}`),
  ...Object.keys(pkg.dependencies || {})
];

export default defineConfig([
  {
    entry: ['src/index.ts', 'src/cli.ts'],
    format: ['esm', 'cjs'],
    dts: false,
    clean: true,
    minify: true,
    external,
    platform: 'node'
  },
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true
  }
]);
