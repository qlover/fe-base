import { defineConfig } from 'tsup';
import pkg from './package.json';
import { toPureCamelCase } from '../../tools/toPureCamelCase.js';
import { builtinModules } from 'module';
import { readdirSync } from 'fs';

const pkgName = toPureCamelCase(pkg.name);
const external = [
  ...builtinModules,
  ...builtinModules.map((mod) => `node:${mod}`),
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {})
];

// Generate entry object for submodules with directory structure
const coreModulesEntry = readdirSync('./src/core')
  .filter((file) => !file.endsWith('.ts'))
  .reduce(
    (acc, mod) => {
      acc[`${mod}/index`] = `src/core/${mod}/index.ts`;
      return acc;
    },
    {} as Record<string, string>
  );

const buildModulesEntry = readdirSync('./src/build')
  .filter((file) => !file.endsWith('.ts'))
  .reduce(
    (acc, mod) => {
      acc[`build/${mod}/index`] = `src/build/${mod}/index.ts`;
      return acc;
    },
    {} as Record<string, string>
  );

export default defineConfig([
  // Main entry: CJS format
  {
    entry: ['src/core/index.ts'],
    format: ['cjs'],
    dts: false,
    minify: false,
    clean: true,
    silent: true,
    bundle: false,
    outExtension: () => ({ js: '.cjs' }),
    outDir: 'dist'
  },
  // Main entry: ESM format with TypeScript declarations
  {
    entry: ['src/core/index.ts'],
    format: ['esm'],
    splitting: false, // 改为 false
    dts: {
      compilerOptions: {
        composite: false
      }
    },
    minify: false,
    silent: true,
    bundle: false, // 添加这行
    outDir: 'dist',
    external // 添加 external
  },
  // Core submodules: CJS format
  {
    entry: coreModulesEntry,
    format: ['cjs'],
    dts: false,
    minify: false,
    silent: true,
    outDir: 'dist',
    external
  },
  // Core submodules: ESM format with TypeScript declarations
  {
    entry: coreModulesEntry,
    format: ['esm'],
    splitting: false,
    dts: {
      compilerOptions: {
        composite: false
      }
    },
    minify: false,
    silent: true,
    outDir: 'dist',
    external
  },

  // Main entry: IIFE format for CDN usage
  {
    entry: ['src/core/index.ts'],
    format: ['iife'],
    dts: false,
    minify: true,
    silent: true,
    globalName: pkgName,
    outExtension: () => ({ js: '.iife.js' }),
    outDir: 'dist'
  },

  // Build tools: CJS format
  {
    entry: buildModulesEntry,
    format: ['cjs'],
    dts: false,
    minify: false,
    silent: true,
    external
  },
  // Build tools: ESM format with TypeScript declarations
  {
    entry: buildModulesEntry,
    format: ['esm'],
    dts: {
      resolve: true,
      compilerOptions: {
        composite: false
      }
    },
    splitting: false,
    minify: false,
    silent: true,
    external
  }
]);
