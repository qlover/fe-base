# TypeScript Configuration Guide

## Project Structure

This project uses TypeScript Project References to manage type checking and building in a monorepo setup.

## Configuration Files

### 1. `tsconfig.base.json` - Base Configuration

Contains shared TypeScript compiler options for all sub-projects, including:
- Target version (target)
- Module system (module)
- Strict mode (strict)
- Other compiler options

All sub-projects should extend this base configuration.

### 2. `tsconfig.json` - Root Configuration

The root configuration file serves to:
- Extend `tsconfig.base.json`
- Use the `references` field to reference all sub-projects
- Use `files: []` to indicate the root config itself contains no files
- Coordinate type checking across the entire project

### 3. Sub-project Configuration `packages/*/tsconfig.json`

Each sub-project configuration features:
- Extends `../../tsconfig.base.json`
- Enables `composite: true` (required for Project References)
- Sets `rootDir` and `outDir`
- Configures independent `tsBuildInfoFile`
- Can override specific options from the base configuration

### 4. `tsconfig.make.json` - Build Scripts Configuration

Dedicated configuration for the `make` directory and root-level utility scripts:
- Includes the `make` directory and `vitest.config.ts`
- References required sub-projects (e.g., `fe-release`)
- Excludes the `create-app/templates` directory

## Usage

### Type Checking (without emitting files)

```bash
# Check all projects
pnpm tsc --noEmit

# Or use npx
npx tsc --noEmit
```

### Build All Projects

```bash
# Incremental build
pnpm tsc --build

# Force rebuild
pnpm tsc --build --force

# Clean build artifacts
pnpm tsc --build --clean
```

### Build Specific Project

```bash
# Build a single project and its dependencies
pnpm tsc --build packages/fe-corekit
```

### View Build Order (dry run)

```bash
pnpm tsc --build --dry
```

## Excluded Directories

The following directories are excluded from type checking:
- `**/node_modules/*` - Dependencies
- `**/dist` - Build output
- `**/build` - Build output
- `packages/create-app/templates` - Project templates (contains example code, no need to check)

## Adding a New Sub-package

When adding a new sub-package:

1. Create `tsconfig.json` in the new package directory:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": ".",
    "outDir": "dist",
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.tsbuildinfo"
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules"]
}
```

2. Add the new package reference to the root `tsconfig.json` `references` array:

```json
{
  "references": [
    // ... other references
    { "path": "./packages/your-new-package" }
  ]
}
```

## Project Dependencies

If a sub-project depends on another sub-project, add `references` to that project's `tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    // ... other options
  },
  "references": [
    { "path": "../other-package" }
  ]
}
```

## Benefits

Benefits of using Project References:
1. **Faster type checking**: Only check modified projects
2. **Better code organization**: Clear project dependencies
3. **Incremental builds**: Only rebuild what's needed
4. **Enforced dependency order**: Ensures dependencies are built before dependents
5. **Better editor support**: IDEs can better understand project structure

## Build Tools Integration

### Using tsup with Composite Projects

This project uses **tsup** (or other bundlers like rollup) for building packages, not `tsc`. However, we still enable `composite: true` in `tsconfig.json` for IDE performance benefits.

#### Why Keep Composite with tsup?

Even though tsup doesn't use TypeScript's incremental compilation:
1. **IDE Performance**: VSCode's TypeScript Language Server benefits from composite mode
2. **Faster Type Checking**: Cross-package type checking is significantly faster
3. **Better Navigation**: "Go to Definition" jumps to source files instead of `.d.ts`
4. **Clear Dependencies**: Enforces explicit package dependency declarations

#### tsup Configuration for DTS Generation

When tsup generates `.d.ts` files with `dts: true`, it internally uses TypeScript compiler. To avoid conflicts with `composite: true`, configure tsup as follows:

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: 'esm',
    dts: {
      compilerOptions: {
        composite: false  // Disable composite for dts generation
      }
    },
    outDir: 'dist'
  }
]);
```

**Why disable composite in tsup?**

TypeScript's `composite: true` requires strict file list validation. When tsup generates declaration files, it may encounter file resolution issues. Disabling `composite` only for dts generation:
- ✅ Keeps IDE benefits (main `tsconfig.json` still has `composite: true`)
- ✅ Allows tsup to generate `.d.ts` files without errors
- ✅ Doesn't affect the final build output

#### Build vs Type Check

```bash
# Type checking (uses tsconfig.json with composite: true)
pnpm tsc --noEmit

# Building packages (uses tsup/rollup, with composite: false for dts)
pnpm nx run-many --target=build --all
```

### Configuration Summary

| Scenario | Configuration | Purpose |
|----------|--------------|---------|
| **IDE Type Checking** | `tsconfig.json` with `composite: true` | Fast cross-package type checking |
| **Package Building** | `tsup.config.ts` with bundler | Production builds |
| **DTS Generation** | `dts: { compilerOptions: { composite: false } }` | Generate type declarations |
| **Package Dependencies** | `references` in `tsconfig.json` | Declare inter-package dependencies |

## Notes

1. With `composite: true` enabled, TypeScript generates `.tsbuildinfo` files for incremental compilation
2. When referencing across projects, TypeScript uses compiled `.d.ts` files instead of source files
3. After modifying `tsconfig.json`, it's recommended to run `tsc --build --clean` to clear old build info
4. The `composite` setting in `tsconfig.json` is for IDE/type checking; tsup uses its own configuration for builds
5. If you encounter `TS6307` errors during dts generation, ensure `composite: false` is set in tsup's dts options

