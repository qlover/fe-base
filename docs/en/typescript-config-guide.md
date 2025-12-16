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

## Notes

1. With `composite: true` enabled, TypeScript generates `.tsbuildinfo` files for incremental compilation
2. When referencing across projects, TypeScript uses compiled `.d.ts` files instead of source files
3. After modifying `tsconfig.json`, it's recommended to run `tsc --build --clean` to clear old build info

