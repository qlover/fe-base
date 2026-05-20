import { defineConfig } from 'tsup';
import { builtinModules } from 'node:module';
import pkg from './package.json';
import { toPureCamelCase } from '../../tools/toPureCamelCase.js';

const pkgName = toPureCamelCase(pkg.name);
const external = [
  ...builtinModules,
  ...builtinModules.map((mod) => `node:${mod}`),
  ...Object.keys(pkg.dependencies || {})
];

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['cjs'],
    dts: false,
    minify: true,
    clean: true,
    silent: true,
    globalName: pkgName,
    outDir: 'dist',
    external
  },
  {
    entry: { index: 'src/index.ts' },
    format: 'esm',
    dts: {
      compilerOptions: {
        composite: false,
        rootDir: undefined
      }
    },
    outDir: 'dist',
    external
  },
  {
    entry: { plugin: 'src/plugin.ts' },
    format: ['esm', 'cjs'],
    dts: {
      compilerOptions: {
        composite: false,
        rootDir: undefined
      }
    },
    outExtension: ({ format }) => ({
      js: format === 'cjs' ? '.cjs' : '.js'
    }),
    outDir: 'dist',
    external,
    silent: true
  }
]);
