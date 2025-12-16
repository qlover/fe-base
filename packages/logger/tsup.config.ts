import { defineConfig } from 'tsup';
import pkg from './package.json';
import { toPureCamelCase } from '../../tools/toPureCamelCase.js';

const pkgName = toPureCamelCase(pkg.name);
export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'iife'],
    dts: false,
    minify: true,
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
    format: 'esm',
    dts: {
      compilerOptions: {
        composite: false
      }
    },
    outDir: 'dist'
  }
]);
