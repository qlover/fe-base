import { defineConfig } from 'tsup';
import pkg from './package.json';
import { toPureCamelCase } from '../../tools/toPureCamelCase.js';
import { builtinModules } from 'module';

const pkgName = toPureCamelCase(pkg.name);
const external = [
  ...builtinModules,
  ...builtinModules.map((mod) => `node:${mod}`),
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {})
];

// const coreModulesEntry = readdirSync('./src')
//   .filter((file) => !file.endsWith('.ts'))
//   .reduce(
//     (acc, mod) => {
//       acc[`${mod}/index`] = `src/${mod}/index.ts`;
//       return acc;
//     },
//     {} as Record<string, string>
//   );

export default defineConfig([
  // {
  //   entry: coreModulesEntry,
  //   format: ['cjs'],
  //   dts: false,
  //   minify: false,
  //
  //   clean: true,
  //   outDir: 'dist',
  //   external
  // },
  // {
  //   entry: coreModulesEntry,
  //   format: ['esm'],
  //   splitting: false,
  //   dts: {
  //     compilerOptions: {
  //       composite: false,
  //       rootDir: undefined
  //     }
  //   },
  //   minify: false,
  //   // bundle: true by default - bundle code but keep external dependencies external
  //   outDir: 'dist',
  //   external
  // },

  {
    entry: ['src/index.ts'],
    format: ['cjs'],
    clean: true,
    dts: false,
    minify: false,
    outExtension: () => ({ js: '.cjs' }),
    outDir: 'dist'
  },
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: {
      resolve: true,
      compilerOptions: {
        composite: false,
        rootDir: undefined
      }
    },
    bundle: true,
    splitting: false,
    minify: false,
    external
  },
  {
    entry: ['src/common.ts'],
    format: ['esm'],
    dts: {
      resolve: true,
      compilerOptions: {
        composite: false,
        rootDir: undefined
      }
    },
    bundle: false,
    splitting: false,
    minify: false,
    external
  },
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
