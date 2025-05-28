# Build Formats Guide

This document provides detailed information about the packaging strategies, output format selection, and configuration schemes for the fe-base project.

## Build Formats Overview

### Main Output Formats

#### 1. **CommonJS (CJS)**
- **Purpose**: Node.js server-side environment
- **Features**: Synchronous loading, uses `require()` and `module.exports`
- **File Extension**: `.cjs` or `.js`

```javascript
// Output example
module.exports = {
  ElementResizer: class ElementResizer { /* ... */ }
};

// Usage example
const { ElementResizer } = require('@fe-base/element-sizer');
```

#### 2. **ES Modules (ESM)**
- **Purpose**: Modern browsers, Node.js (>=14), bundlers
- **Features**: Static analysis, Tree-shaking friendly
- **File Extension**: `.mjs` or `.js`

```javascript
// Output example
export class ElementResizer { /* ... */ }
export default ElementResizer;

// Usage example
import { ElementResizer } from '@fe-base/element-sizer';
```

#### 3. **Universal Module Definition (UMD)**
- **Purpose**: Direct browser usage, compatible with multiple module systems
- **Features**: Adaptive to AMD, CommonJS, global variables
- **File Extension**: `.umd.js`

```javascript
// Output example
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.BrainToolkit = {}));
}(this, function (exports) { /* ... */ }));

// Usage example
<script src="https://unpkg.com/@fe-base/element-sizer/dist/index.umd.js"></script>
<script>
  const resizer = new BrainToolkit.ElementResizer({ /* ... */ });
</script>
```

## Use Case Selection

### Server-side Packages

**Recommended Formats**: CJS + ESM

```json
// package.json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

**Build Configuration**:

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  target: 'node14',
  platform: 'node'
});
```

### Browser-only Packages

**Recommended Formats**: ESM + UMD

```json
// package.json
{
  "main": "./dist/index.umd.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.umd.js"
    }
  }
}
```

**Build Configuration**:

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'umd'],
  dts: true,
  clean: true,
  target: 'es2015',
  platform: 'browser',
  globalName: 'BrainToolkit'
});
```

### Universal Packages

**Recommended Formats**: CJS + ESM + UMD

```json
// package.json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "browser": "./dist/index.umd.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "browser": "./dist/index.umd.js"
    }
  }
}
```

**Build Configuration**:

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig([
  // Node.js environment
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    target: 'node14',
    platform: 'node'
  },
  // Browser environment
  {
    entry: ['src/index.ts'],
    format: ['umd'],
    clean: false,
    target: 'es2015',
    platform: 'browser',
    globalName: 'BrainToolkit',
    minify: true
  }
]);
```

## Build Tool Configuration

### tsup Configuration (Recommended)

tsup is a fast build tool based on esbuild, suitable for library packaging.

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  // Entry files
  entry: ['src/index.ts'],
  
  // Output formats
  format: ['cjs', 'esm', 'umd'],
  
  // Generate type definition files
  dts: true,
  
  // Clean output directory
  clean: true,
  
  // Code splitting
  splitting: false,
  
  // Source maps
  sourcemap: true,
  
  // Minify code
  minify: false,
  
  // Target environment
  target: 'es2018',
  
  // External dependencies
  external: ['react', 'vue'],
  
  // Global variable name (UMD)
  globalName: 'BrainToolkit',
  
  // Custom esbuild options
  esbuildOptions(options) {
    options.banner = {
      js: '/* Brain Toolkit */'
    };
  }
});
```

### Rollup Configuration

```typescript
// rollup.config.ts
import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default defineConfig([
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        declaration: true,
        declarationDir: 'dist'
      })
    ],
    external: ['react', 'vue']
  },
  
  // CJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript()
    ],
    external: ['react', 'vue']
  },
  
  // UMD build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'BrainToolkit',
      sourcemap: true
    },
    plugins: [
      nodeResolve({ browser: true }),
      commonjs(),
      typescript(),
      terser()
    ]
  }
]);
```

## package.json Configuration Details

### Basic Fields

```json
{
  "name": "@fe-base/element-sizer",
  "version": "0.2.0",
  "type": "module",
  
  // Main entry (CJS)
  "main": "./dist/index.cjs",
  
  // ES module entry
  "module": "./dist/index.js",
  
  // Browser entry
  "browser": "./dist/index.umd.js",
  
  // TypeScript type definitions
  "types": "./dist/index.d.ts"
}
```

### exports Field (Recommended)

```json
{
  "exports": {
    // Package root
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "browser": "./dist/index.umd.js"
    },
    
    // Subpath exports
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.js",
      "require": "./dist/utils.cjs"
    },
    
    // Package info
    "./package.json": "./package.json"
  }
}
```

### Published Files Configuration

```json
{
  "files": [
    "dist",
    "package.json",
    "README.md",
    "CHANGELOG.md"
  ]
}
```

## Packaging Considerations

### 1. Dependency Handling

#### External Dependencies

```typescript
// tsup.config.ts
export default defineConfig({
  external: [
    // Runtime dependencies, not bundled
    'react',
    'vue',
    'lodash'
  ]
});
```

#### Bundled Dependencies

```typescript
// Small utility libraries can be inlined
export default defineConfig({
  noExternal: [
    'tiny-utility',
    'small-helper'
  ]
});
```

### 2. Tree-shaking Optimization

```json
// package.json
{
  "sideEffects": false,  // Mark as side-effect free
  "module": "./dist/index.js"
}
```

```typescript
// Ensure ES module syntax is used
export { ElementResizer } from './element-resizer';
export { default as ElementResizer } from './element-resizer';
```

### 3. Code Splitting

```typescript
// tsup.config.ts
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    utils: 'src/utils/index.ts'
  },
  splitting: true,  // Enable code splitting
  format: ['esm']   // Only ESM supports splitting
});
```

### 4. Environment Variable Handling

```typescript
// tsup.config.ts
export default defineConfig({
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version),
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
});
```

### 5. Browser Compatibility

```typescript
// tsup.config.ts
export default defineConfig({
  target: 'es2015',  // Support ES2015+
  format: ['esm', 'umd'],
  
  // Provide polyfills for older browsers
  esbuildOptions(options) {
    options.supported = {
      'dynamic-import': false
    };
  }
});
```

## Validating Build Results

### 1. Check Output Files

```bash
# View build artifacts
ls -la dist/

# Check file sizes
du -h dist/*

# Analyze bundle contents
npx bundle-analyzer dist/index.js
```

### 2. Test Different Environments

```javascript
// test-cjs.js (Node.js)
const { ElementResizer } = require('./dist/index.cjs');
console.log('CJS:', typeof ElementResizer);

// test-esm.mjs (Node.js)
import { ElementResizer } from './dist/index.js';
console.log('ESM:', typeof ElementResizer);

// test-umd.html (Browser)
<script src="./dist/index.umd.js"></script>
<script>
  console.log('UMD:', typeof BrainToolkit.ElementResizer);
</script>
```

### 3. Automated Testing

```json
// package.json
{
  "scripts": {
    "test:build": "npm run build && npm run test:formats",
    "test:formats": "node scripts/test-formats.js"
  }
}
```

```javascript
// scripts/test-formats.js
import { execSync } from 'child_process';

// Test CJS
try {
  execSync('node -e "require(\'./dist/index.cjs\')"');
  console.log('✅ CJS format works');
} catch (error) {
  console.error('❌ CJS format failed:', error.message);
}

// Test ESM
try {
  execSync('node -e "import(\'./dist/index.js\')"');
  console.log('✅ ESM format works');
} catch (error) {
  console.error('❌ ESM format failed:', error.message);
}
```

## Frequently Asked Questions

### Q: When do I need UMD format?
A: When your package needs to be used directly in browsers via `<script>` tags, or when you need compatibility with AMD module systems.

### Q: How to choose the target version?
A: Based on your target environment:
- Node.js packages: `node14` or higher
- Modern browsers: `es2018` or `es2020`
- Legacy browser compatibility: `es2015` or `es5`

### Q: Do I need to provide all formats?
A: Not necessarily. Choose based on actual use cases:
- Pure Node.js packages: CJS + ESM
- Pure browser packages: ESM + UMD
- Universal packages: CJS + ESM + UMD

### Q: How to handle CSS and static assets?
A: Use specialized plugins:

```typescript
// tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  
  // Copy static files
  publicDir: 'src/assets',
  
  // Handle CSS
  esbuildOptions(options) {
    options.loader = {
      '.css': 'text'
    };
  }
});
```

### Q: How to optimize bundle size?
A: 
1. Use Tree-shaking
2. Mark `sideEffects: false`
3. Properly configure `external` dependencies
4. Enable code minification
5. Use dynamic imports for code splitting 