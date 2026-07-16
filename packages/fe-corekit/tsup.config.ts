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

const dtsOptions = {
  resolve: true,
  compilerOptions: {
    composite: false,
    rootDir: undefined
  }
};

// Submodule entries: dist/<mod>/index.{js,cjs,d.ts}
const coreModulesEntry = readdirSync('./src')
  .filter((file) => !file.endsWith('.ts') && !file.startsWith('.'))
  .reduce(
    (acc, mod) => {
      acc[`${mod}/index`] = `src/${mod}/index.ts`;
      return acc;
    },
    {} as Record<string, string>
  );

export default defineConfig([
  // Main entry: CJS (full bundle for require consumers)
  {
    entry: ['src/index.ts'],
    format: ['cjs'],
    dts: false,
    minify: false,
    clean: true,
    bundle: true,
    outExtension: () => ({ js: '.cjs' }),
    outDir: 'dist',
    external
  },
  // Main entry: ESM re-exports only — enables consumer tree-shaking
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    bundle: false,
    splitting: false,
    dts: dtsOptions,
    minify: false,
    outDir: 'dist',
    external
  },
  // Submodules: CJS
  {
    entry: coreModulesEntry,
    format: ['cjs'],
    dts: false,
    minify: false,
    outDir: 'dist',
    external
  },
  // Submodules: ESM + declarations
  {
    entry: coreModulesEntry,
    format: ['esm'],
    splitting: false,
    dts: dtsOptions,
    minify: false,
    outDir: 'dist',
    external
  },
  // Shared utility types (re-exported by main ESM entry)
  {
    entry: ['src/common.ts'],
    format: ['esm'],
    dts: dtsOptions,
    bundle: false,
    splitting: false,
    minify: false,
    external
  },
  // CDN: IIFE
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    dts: false,
    minify: false,
    globalName: pkgName,
    outExtension: () => ({ js: '.iife.js' }),
    outDir: 'dist',
    target: 'es5'
  },
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    dts: false,
    minify: true,
    globalName: pkgName,
    outExtension: () => ({ js: '.iife.min.js' }),
    outDir: 'dist',
    target: 'es5'
  }
]);
