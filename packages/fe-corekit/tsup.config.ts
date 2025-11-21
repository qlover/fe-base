import { defineConfig } from 'tsup';
import pkg from './package.json';
import { toPureCamelCase } from '../../make/toPureCamelCase';
import { builtinModules } from 'node:module';

const external = [
  ...builtinModules,
  ...builtinModules.map((mod) => `node:${mod}`),
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {})
];

const pkgName = toPureCamelCase(pkg.name);
export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'iife'],
    dts: false,
    clean: true,
    silent: true,
    globalName: pkgName,
    outExtension: ({ format }) => {
      if (format === 'iife') {
        return { js: '.iife.js' };
      }
      return { js: '.cjs' };
    },
    outDir: 'dist'
  },
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    dts: false,
    minify: true,
    silent: true,
    globalName: pkgName,
    outExtension: () => {
      return { js: '.iife.min.js' };
    },
    outDir: 'dist'
  },
  {
    entry: ['src/index.ts'],
    format: 'esm',
    dts: true,
    outDir: 'dist',
    external
  }
]);
