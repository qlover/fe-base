import { defineConfig, type Options } from 'tsup';
import { builtinModules } from 'node:module';
import pkg from './package.json';

const external = [
  ...builtinModules,
  ...builtinModules.map((mod) => `node:${mod}`),
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {})
];

const shared: Options = {
  minify: false,
  outDir: 'dist',
  external,
  silent: true
};

/** Next.js App Router treats this as a Client Component boundary. */
const clientBanner = { js: '"use client";' };

export default defineConfig([
  {
    ...shared,
    entry: {
      common: 'src/common/index.ts',
      server: 'src/server/index.ts'
    },
    format: ['cjs'],
    dts: false,
    clean: true,
    outExtension: () => ({ js: '.cjs' })
  },
  {
    ...shared,
    entry: {
      client: 'src/client/index.ts'
    },
    format: ['cjs'],
    dts: false,
    clean: false,
    banner: clientBanner,
    outExtension: () => ({ js: '.cjs' })
  },
  {
    ...shared,
    entry: {
      common: 'src/common/index.ts',
      server: 'src/server/index.ts'
    },
    format: ['esm'],
    bundle: true,
    splitting: false,
    dts: {
      compilerOptions: {
        composite: false,
        rootDir: '.'
      }
    }
  },
  {
    ...shared,
    entry: {
      client: 'src/client/index.ts'
    },
    format: ['esm'],
    bundle: true,
    splitting: false,
    banner: clientBanner,
    dts: {
      compilerOptions: {
        composite: false,
        rootDir: '.'
      }
    }
  }
]);
