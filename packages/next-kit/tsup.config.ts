import { defineConfig } from 'tsup';
import { builtinModules } from 'node:module';
import pkg from './package.json';

const external = [
  ...builtinModules,
  ...builtinModules.map((mod) => `node:${mod}`),
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {})
];

const entry = {
  common: 'src/common/index.ts',
  server: 'src/server/index.ts',
  client: 'src/client/index.ts'
};

export default defineConfig([
  {
    entry,
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
    entry,
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
