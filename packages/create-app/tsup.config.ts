import { defineConfig } from 'tsup';
import { builtinModules } from 'module';
import pkg from './package.json';
import { copyAssets } from '../../make/copyAssets';

const external = [
  ...builtinModules,
  ...builtinModules.map((mod) => `node:${mod}`),
  ...Object.keys(pkg.dependencies || {})
];

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: 'cjs',
    dts: false,
    clean: true,
    minify: true,
    external,
    platform: 'node'
  },
  {
    entry: ['src/index.mts'],
    format: 'esm',
    minify: true,
    dts: true,
    onSuccess: async () => {
      await copyAssets('./configs', 'dist/configs');
      await copyAssets('./templates', 'dist/templates', {
        ignores: ['node_modules', 'dist']
      });
    }
  }
]);
