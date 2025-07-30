import { defineConfig } from 'tsup';
import pkg from './package.json';
import { toPureCamelCase } from '../../make/toPureCamelCase';
import { builtinModules } from 'module';

const pkgName = toPureCamelCase(pkg.name);
const external = [
  ...builtinModules,
  ...builtinModules.map((mod) => `node:${mod}`),
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {})
];
export default defineConfig([
  {
    entry: ['src/core/index.ts'],
    format: ['cjs', 'iife'],
    dts: false,
    minify: false,
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
    entry: ['src/core/index.ts'],
    format: ['esm'],
    splitting: false,
    dts: true
  },

  // build
  {
    entry: {
      'build/tw-root10px': 'src/build/tw-root10px/index.ts',
      'build/vite-env-config': 'src/build/vite-env-config/index.ts',
      'build/vite-ts-to-locales': 'src/build/vite-ts-to-locales/index.ts'
    },
    format: ['cjs'],
    dts: false,
    minify: false
  },
  {
    entry: {
      'build/tw-root10px': 'src/build/tw-root10px/index.ts',
      'build/vite-env-config': 'src/build/vite-env-config/index.ts',
      'build/vite-ts-to-locales': 'src/build/vite-ts-to-locales/index.ts'
    },
    format: ['esm'],
    dts: true,
    splitting: false,
    minify: false,
    external
  }
]);
