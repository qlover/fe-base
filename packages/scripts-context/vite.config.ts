/// <reference types='vitest' />
import { defineConfig, LibraryFormats } from 'vite';
import dts from 'vite-plugin-dts';
import { builtinModules } from 'module';
import pkg from './package.json';
// const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../node_modules/.vite/scripts-context',
  plugins: [
    dts({
      entryRoot: 'src',
      rollupTypes: true,
      include: ['src/**/*']
    })
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true
    },
    minify: process.env.NODE_ENV === 'production',
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: 'scripts-context',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es', 'cjs'] as LibraryFormats[]
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [
        ...builtinModules,
        ...builtinModules.map((mod) => `node:${mod}`),
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.devDependencies || {})
      ]
    }
  }
}));
