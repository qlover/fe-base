import { defineConfig } from 'tsup';
import { builtinModules } from 'module';
import pkg from './package.json';
import { copyAssets } from '../../tools/copyAssets';

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
    minify: false,
    external,
    platform: 'node'
  },
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: {
      compilerOptions: {
        composite: false
      }
    },
    onSuccess: async () => {
      await copyAssets('./hbs', 'dist/hbs');
    }
  }
]);
