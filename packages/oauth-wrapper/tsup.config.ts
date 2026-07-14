import { defineConfig } from 'tsup';
import { builtinModules } from 'node:module';
import pkg from './package.json';

const external = [
  ...builtinModules,
  ...builtinModules.map((mod) => `node:${mod}`),
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {})
];

export default defineConfig([
  {
    entry: {
      index: 'src/server/index.ts',
      core: 'src/core/index.ts',
      client: 'src/client/index.ts'
    },
    format: ['cjs'],
    dts: false,
    minify: false,
    clean: true,
    silent: true,
    outExtension: () => ({ js: '.cjs' }),
    outDir: 'dist',
    external
  },
  {
    entry: {
      index: 'src/server/index.ts',
      core: 'src/core/index.ts',
      client: 'src/client/index.ts'
    },
    format: ['esm'],
    dts: {
      compilerOptions: {
        composite: false,
        rootDir: '.'
      }
    },
    bundle: true,
    splitting: false,
    minify: false,
    outDir: 'dist',
    external
  }
]);
