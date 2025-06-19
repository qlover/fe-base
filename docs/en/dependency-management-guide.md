# Monorepo Sub-package Bundling Dependency Strategy Guide

## Overview

When using Vite to bundle sub-packages in a monorepo project, the core question is: **Which dependencies should be bundled into the bundle, and which should remain externalized?** This directly affects package size, user installation experience, and potential dependency conflicts.

## Core Issues

When you bundle sub-packages, you face key decisions:

1. **Bundle Everything**: Bundle all dependencies into the final bundle
2. **Partial Bundling**: Selectively bundle some dependencies while externalizing others
3. **Externalize Everything**: Don't bundle any dependencies, let user projects provide them

## Dependency Types Explained

Before understanding bundling strategies, you need to understand the differences between the three dependency types in `package.json`:

### dependencies
**Definition**: Runtime dependencies that are automatically installed when users install your package

**Characteristics**:
- npm/pnpm automatically installs these dependencies when installing your package
- These dependencies appear in the user's project `node_modules`
- Affects the user's project dependency tree and bundle size

**Use Cases**:
```json
{
  "dependencies": {
    "lodash": "^4.17.21",    // Utility library used directly in your code
    "dayjs": "^1.11.10",     // Date library needed at runtime
    "chalk": "^5.3.0"        // Coloring library needed for CLI tools
  }
}
```

**User Installation Effect**:
```bash
npm install your-package
# Will also install lodash, dayjs, chalk
```

### devDependencies
**Definition**: Dependencies needed for development and build processes, not installed in user projects

**Characteristics**:
- Only used during development, not installed by users
- Used for building, testing, code formatting, and other development workflows
- Does not affect the final bundled code

**Use Cases**:
```json
{
  "devDependencies": {
    "vite": "^6.1.0",           // Build tool
    "typescript": "^5.4.5",     // Type checking
    "@types/node": "^22.9.0",   // Type definitions
    "vitest": "^3.0.5",         // Testing framework
    "eslint": "^9.13.0"         // Code linting
  }
}
```

**User Installation Effect**:
```bash
npm install your-package
# Will not install any packages from devDependencies
```

### peerDependencies
**Definition**: Dependencies expected to be provided by the user's project, not automatically installed

**Characteristics**:
- Not automatically installed, requires manual installation by users
- Used to avoid duplicate installation of large libraries
- Ensures version consistency and singleton patterns

**Use Cases**:
```json
{
  "peerDependencies": {
    "react": ">=16.8.0",        // Expects user project to have React
    "react-dom": ">=16.8.0",    // Expects user project to have ReactDOM
    "eslint": ">=8.0.0"         // ESLint plugin expects user to have ESLint installed
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true          // Mark as optional dependency
    }
  }
}
```

**User Installation Effect**:
```bash
npm install your-package
# Will show peer dependency warnings, users need to manually install
npm install react react-dom  # Users need to manually install
```

### Relationship Between Dependency Types and Bundling

```markdown
// How they are handled during bundling

dependencies:
- Can choose to bundle or externalize
- If externalized, users will automatically get these dependencies

devDependencies:
- Never bundled into the final output
- Only used for development and build processes

peerDependencies:
- Usually need to be externalized
- Users must manually install these dependencies
```

## Dependency Bundling Strategies

### What is Dependency Bundling?

```markdown
// Code before bundling
import { debounce } from 'lodash'
import axios from 'axios'

export function myFunction() {
  return debounce(() => axios.get('/api'), 300)
}
```

```markdown
// Result after bundling everything
// Both lodash and axios code are bundled into the final file
// Users don't need to install lodash and axios separately when installing your package

// Result with partial externalization
// Only lodash is bundled, axios remains as external reference
// Users need to install axios in their own projects
```

### Scenario Analysis: Bundling Strategies for Different Package Types

#### 1. Node.js CLI Tools and Scripts

**Characteristics**:
- Run in Node.js environment
- Invoked via command line by users
- Need fast startup, minimize dependency installation

**Dependency Classification Strategy**:

```json
{
  "dependencies": {
    // ✅ Small utility libraries - bundle everything
    "chalk": "^5.3.0",           // 4KB - coloring library
    "nanoid": "^5.0.0",          // 2KB - ID generation
    "picocolors": "^1.0.0",      // 1KB - lightweight coloring
    "cross-spawn": "^7.0.3",     // 6KB - cross-platform process
    
    // ❌ Large libraries - externalize for user installation
    "commander": "^11.0.0",      // 50KB+ - command framework
    "inquirer": "^9.2.0",        // 200KB+ - interactive CLI
    "axios": "^1.6.0",           // 100KB+ - HTTP client
    "ora": "^7.0.0"              // complex dependency chain
  }
}
```

**Vite Configuration**:
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/cli.ts',
      formats: ['cjs'], // CLI tools only need CommonJS
      fileName: 'cli'
    },
    rollupOptions: {
      external: [
        // Node.js built-in modules
        'fs', 'path', 'process', 'child_process', 'os', 'url',
        // Large third-party libraries
        'commander', 'inquirer', 'axios', 'ora',
        // Dynamic import modules
        /^node:/
      ]
    },
    target: 'node14' // Specify Node.js version
  }
})
```

**Actual Effect**:
```bash
# User installation
npm install -g your-cli-tool
npm install commander inquirer  # Need to install large dependencies separately

# Bundle size comparison
# Bundle everything: ~500KB
# Selective bundling: ~50KB
```

#### 2. Universal Utility Libraries (NPM Packages)

**Characteristics**:
- Used in various projects
- Need maximum compatibility
- Users expect plug-and-play functionality

**Dependency Classification Strategy**:

```json
{
  "dependencies": {
    // ✅ Core functional dependencies - bundle everything
    "tslib": "^2.8.1",           // TypeScript runtime
    "dayjs": "^1.11.10",         // Date processing
    "lodash-es": "^4.17.21",     // Utility functions
    
    // ❌ Optional feature dependencies - externalize
    "zod": "^3.22.0"             // Validation library, users might have their own choice
  },
  "peerDependencies": {
    // Environment-related large dependencies
    "typescript": ">=4.5.0"      // Type checking, development dependency
  },
  "peerDependenciesMeta": {
    "typescript": { "optional": true }
  }
}
```

**Vite Configuration**:
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs', 'umd'], // Multi-format support
      name: 'MyUtils'
    },
    rollupOptions: {
      external: ['zod'], // Only externalize optional dependencies
      output: {
        globals: {
          'zod': 'z'
        }
      }
    }
  }
})
```

#### 3. Frontend Component Libraries

**Characteristics**:
- Depend on specific frameworks
- Need Tree-shaking support
- Size-sensitive

**Dependency Classification Strategy**:

```json
{
  "dependencies": {
    // ✅ Small utility dependencies - bundle
    "clsx": "^2.0.0",            // 2KB - class name utility
    "nanoid": "^5.0.0",          // 2KB - ID generation
    
    // ❌ Style and animation libraries - decide based on size
    "framer-motion": "^10.0.0"   // 100KB+ - externalize
  },
  "peerDependencies": {
    // Framework dependencies must be externalized
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  }
}
```

**Vite Configuration**:
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es'], // Modern frontend projects mainly use ES modules
    },
    rollupOptions: {
      external: [
        'react', 'react-dom', 'react/jsx-runtime',
        'framer-motion' // Externalize large animation library
      ],
      output: {
        // Preserve directory structure, support Tree-shaking
        preserveModules: true,
        dir: 'dist'
      }
    }
  }
})
```

#### 4. CDN-Deployed Libraries

**Characteristics**:
- Loaded via `<script>` tags
- Need UMD format
- Must be self-contained

**Dependency Classification Strategy**:

```json
{
  "dependencies": {
    // ✅ All dependencies must be bundled - CDN version must be self-contained
    "lodash": "^4.17.21",
    "dayjs": "^1.11.10",
    "axios": "^1.6.0"
  }
}
```

**Vite Configuration**:
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['umd', 'iife'], // CDN-specific formats
      name: 'MyLibrary', // Global variable name
      fileName: (format) => `my-library.${format}.js`
    },
    rollupOptions: {
      // CDN version doesn't externalize any dependencies
      external: [],
      output: {
        // Minified version
        compact: true
      }
    }
  }
})
```

**Deployment Configuration**:
```typescript
// Build multiple versions simultaneously
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // CDN full version
        'cdn': './src/index.ts',
        // NPM version (externalized dependencies)
        'npm': './src/index.ts'
      },
      external: (id, parentId, isResolved) => {
        // Decide externalization strategy based on build target
        if (parentId?.includes('cdn')) {
          return false // CDN version doesn't externalize
        }
        return ['react', 'vue'].includes(id) // NPM version externalizes frameworks
      }
    }
  }
})
```

#### 5. Node.js Server-Side Libraries

**Characteristics**:
- Run in server environment
- Performance and security sensitive
- Dependency version control important

**Dependency Classification Strategy**:

```json
{
  "dependencies": {
    // ✅ Core small dependencies - bundle
    "mime-types": "^2.1.35",     // 8KB - MIME types
    "ms": "^2.1.3",              // 1KB - time parsing
    
    // ❌ Large or security-sensitive dependencies - externalize
    "express": "^4.18.0",        // 200KB+ - web framework
    "jsonwebtoken": "^9.0.0",    // security-related, version sensitive
    "bcrypt": "^5.1.0",          // native module, complex compilation
    "mongoose": "^7.0.0"         // 500KB+ - database ORM
  }
}
```

**Vite Configuration**:
```typescript
// vite.config.ts  
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['cjs'], // Server-side mainly uses CommonJS
    },
    rollupOptions: {
      external: [
        // Node.js built-in modules
        ...builtinModules,
        // Large frameworks and libraries
        'express', 'fastify', 'koa',
        // Database-related
        'mongoose', 'sequelize', 'typeorm',
        // Security-related
        'jsonwebtoken', 'bcrypt', 'passport',
        // Native modules
        /\.node$/
      ]
    },
    target: 'node16'
  }
})
```

### Advanced Bundling Strategies

#### Conditional Exports

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.es.js",    // ES module version
      "require": "./dist/index.cjs.js",  // CommonJS version
      "browser": "./dist/index.umd.js"   // Browser version
    },
    "./cdn": {
      "default": "./dist/index.cdn.js"   // CDN full version
    }
  }
}
```

#### Dynamic Dependency Loading

```typescript
// Dynamic loading of optional dependencies
export async function withOptionalDep() {
  try {
    const { default: optionalLib } = await import('optional-dependency')
    return optionalLib.someFunction()
  } catch {
    console.warn('Optional dependency not available, using fallback')
    return fallbackImplementation()
  }
}
```

#### Bundle Analysis and Optimization

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      filename: 'bundle-analysis.html',
      open: true
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Manually split large dependencies
          'vendor-utils': ['lodash', 'dayjs'],
          'vendor-ui': ['react', 'react-dom']
        }
      }
    }
  }
})
```

### 1. Node.js Script Library Bundling Strategy

**Characteristics**: CLI tools, build scripts, server-side libraries

**Recommended Strategy**:
```json
{
  "dependencies": {
    // Small utility libraries - recommended to bundle
    "chalk": "^5.3.0",
    "nanoid": "^5.0.0",
    
    // Large libraries - recommended to externalize, let users install
    "commander": "^11.0.0",
    "axios": "^1.6.0"
  }
}
```

**Analysis**:
- ✅ **Bundle small libraries**: Reduce user installation steps, avoid version conflicts
- ✅ **Externalize large libraries**: Avoid excessive package size, users might already have these libraries

### 2. Universal Development Library Bundling Strategy

**Characteristics**: Utility functions, component libraries, SDKs

**Recommended Strategy**:
```json
{
  "dependencies": {
    // Core small dependencies - bundle
    "tslib": "^2.8.1"
  },
  "peerDependencies": {
    // Framework dependencies - completely externalize
    "react": ">=16.8.0"
  }
}
```

**Analysis**:
- ✅ **Bundle all utility functions**: Provide complete functionality, ready to use
- ✅ **Externalize framework dependencies**: Avoid duplicate installation, maintain version consistency

### 3. Internal Shared Library Bundling Strategy

**Characteristics**: Used only within the monorepo

**Recommended Strategy**:
```json
{
  "dependencies": {
    // Can freely choose to bundle or externalize
    "lodash": "^4.17.21"
  }
}
```

## Bundling Configuration Examples

### Scenario 1: Utility Function Library (Bundle Everything)

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      // Don't configure external, all dependencies will be bundled
    }
  }
})
```

**Result**: Users only need `npm install your-package`, all features work out of the box

### Scenario 2: React Component Library (Framework Externalization)

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['react', 'react-dom'], // Externalize framework dependencies
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})
```

**Result**: Users need to ensure React is installed in their projects

### Scenario 3: CLI Tool (Selective Bundling)

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['cjs'] // CLI usually only needs CommonJS
    },
    rollupOptions: {
      external: [
        // Node.js built-in modules must be externalized
        'fs', 'path', 'process',
        // Large dependencies externalized
        'commander', 'inquirer'
        // Small dependencies not in external will be bundled
      ]
    }
  }
})
```

## Judgment Criteria

### Dependencies That Should Be Bundled

✅ **Recommended to bundle**:
- Utility libraries with bundle size < 50KB
- Dependencies specific to your library
- Dependencies users are unlikely to use independently
- Stable libraries with flexible version requirements

**Examples**: `dayjs`, `nanoid`, `chalk`, `lodash-es`

### Dependencies That Should Be Externalized

✅ **Recommended to externalize**:
- Large frameworks and libraries (React, Vue, Express)
- Common dependencies in user projects
- Libraries requiring singleton pattern
- Node.js built-in modules

**Examples**: `react`, `vue`, `axios`, `commander`, `fs`, `path`

## Practical Application Recommendations

### For Your Project Package Types

```markdown
// CLI Tools (fe-scripts, fe-release, create-app)
dependencies: Bundle small utility libraries, externalize large libraries
devDependencies: All build tools

// Utility Libraries (logger, env-loader, scripts-context)
dependencies: Bundle core small dependencies
peerDependencies: Optional environment dependencies

// Development Tools (eslint-plugin-fe-dev, fe-standard)
dependencies: Bundle ESLint-related small plugins
peerDependencies: Externalize ESLint itself
```

## Verifying Bundling Results

### Check Package Size
```bash
# View bundled file sizes
ls -lh dist/

# Analyze package contents
npm pack --dry-run
```

### Test Dependency Relationships
```bash
# Create test project
mkdir test-project && cd test-project
npm init -y

# Install your package
npm install ../your-package

# Test if it works properly
node -e "console.log(require('your-package'))"
```

## Common Questions

### Q: When to choose bundling everything?
**A**: When your library is a collection of independent utility functions and users expect plug-and-play functionality

### Q: When to choose externalization?
**A**: When dependencies are large frameworks, users might already have them installed, or version consistency is needed

### Q: How to handle monorepo internal dependencies?
**A**: 
```json
{
  "dependencies": {
    "@qlover/logger": "workspace:*"  // Development-time reference
  }
}
```
These internal dependencies are usually bundled during packaging since they're not externally available

### Q: How to handle TypeScript type files?
**A**: Type files don't participate in runtime bundling, they're generated separately via `vite-plugin-dts`

---

*Core principle: Balance package size, user experience, and dependency management complexity* 