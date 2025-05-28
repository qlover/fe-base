# Project Build and Dependency Management Guide

This document introduces the build system and dependency management of the fe-base project.

## 📋 Table of Contents

- [Build System Overview](#-build-system-overview)
- [pnpm Workspace Management](#-pnpm-workspace-management)
- [Build Commands](#-build-commands)
- [Dependency Management Strategy](#-dependency-management-strategy)
- [Common Issues](#-common-issues)

## 🏗️ Build System Overview

fe-base adopts a **monorepo** architecture, which means managing multiple related packages in one repository. The advantages of this architecture:

- **Unified Management**: All packages use the same build tools and configurations
- **Dependency Sharing**: Packages can reference each other directly without publishing to npm
- **Version Synchronization**: Unified management of version releases for all packages

### Main Tech Stack

| Tool           | Purpose                                      | Version  |
| -------------- | -------------------------------------------- | -------- |
| **pnpm**       | Package manager with workspace support       | >= 8.0.0 |
| **nx**         | Build system, task orchestration and caching | 20.6.4   |
| **tsup**       | TypeScript build tool                        | ^8.4.0   |
| **TypeScript** | Type system                                  | ~5.4.5   |

### Why Choose These Tools?

- **pnpm**: Compared to npm/yarn, saves disk space and supports workspace functionality
- **nx**: Provides incremental builds and caching, significantly improving build speed
- **tsup**: Based on esbuild, fast build speed and simple configuration
- **TypeScript**: Provides type safety and improves code quality

## 📦 pnpm Workspace Management

### Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - packages/*
```

This configuration tells pnpm that each subdirectory under the `packages/` directory is an independent package.

### Recursive Build Mechanism

pnpm's recursive mode can automatically execute builds in dependency order:

```bash
# Recursively build all packages
pnpm -r run build
```

**Why do we need recursive builds?**

- There are dependency relationships between packages, they must be built in the correct order
- If package A depends on package B, then package B must be built first, then package A
- pnpm automatically analyzes dependency relationships to ensure correct build order

### workspace:\* Dependency Mechanism

Local package dependencies use `workspace:*`:

```json
{
  "dependencies": {
    "@fe-base/element-sizer": "workspace:*"
  }
}
```

**How workspace:\* works:**

1. **Development stage**: pnpm creates soft links pointing to local packages
2. **Publishing stage**: Automatically replaced with specific version numbers (like `^1.2.3`)
3. **Real-time sync**: Changes to local packages are immediately reflected in dependents

**Important**: Dependencies must be built immediately after installation, because local packages need build artifacts:

```bash
# ❌ Wrong: Only install dependencies, don't build
pnpm install

# ✅ Correct: Build immediately after installation
pnpm install && pnpm build
```

**Why must we build?**

- TypeScript source code needs to be compiled to JavaScript
- Other packages reference build artifacts in the `dist/` directory, not `src/` source code
- Missing build artifacts will cause "module not found" errors

## 🔧 Build Commands

### Main Build Commands

```bash
# Complete build of all packages (recommended)
pnpm build

# Incremental build (only build changed packages)
pnpm nx:build

# Clean build artifacts
pnpm clean:build

# Build specific package
pnpm --filter @fe-base/element-sizer build
```

### Build Script Explanation

```json
{
  "scripts": {
    "build": "pnpm -r --workspace-concurrency=4 run build && pnpm rebuild",
    "nx:build": "nx affected:build",
    "clean:build": "fe-clean -f packages/*/dist -r"
  }
}
```

**Purpose of each command:**

- `pnpm build`: Build all packages concurrently, then rebuild to ensure dependencies are correct
- `pnpm nx:build`: Use nx incremental build, only build changed packages
- `pnpm clean:build`: Clean dist directories of all packages

**Why do we need `pnpm rebuild`?**

- Ensure all package dependencies are up to date
- Re-link local package dependencies
- Resolve possible dependency cache issues

**When to use incremental builds?**

- During development, when you only want to build modified packages
- In large projects where full builds take too long
- In CI/CD, only build affected packages

## 🔗 Dependency Management Strategy

### Dependency Types

1. **Local package dependencies**: Use `workspace:*`

   ```json
   {
     "dependencies": {
       "@fe-base/utils": "workspace:*"
     }
   }
   ```

   **Purpose**: Reference other packages in the same repository

2. **External package dependencies**: Use specific versions

   ```json
   {
     "dependencies": {
       "lodash": "^4.17.21"
     }
   }
   ```

   **Purpose**: Reference third-party packages from npm

3. **Development dependencies**: Build and test tools
   ```json
   {
     "devDependencies": {
       "typescript": "workspace:*",
       "tsup": "workspace:*"
     }
   }
   ```
   **Purpose**: Only needed during development and build, not packaged in final artifacts

### Recommended Installation Process

```bash
# 1. Install dependencies
pnpm install

# 2. Build immediately (important!)
pnpm build

# 3. Verify build
pnpm test
```

**Why follow this order?**

1. **Install first**: Ensure all dependencies are downloaded
2. **Then build**: Generate build artifacts needed by other packages
3. **Finally test**: Verify all packages work correctly

## ❓ Common Issues

### 1. Module Not Found

**Issue**: `Error: Cannot find module '@fe-base/utils'`

**Cause**: The dependent package hasn't been built, missing `dist/` directory

**Solution**:

```bash
# Check if dependency package is built
ls packages/utils/dist/

# Rebuild dependency package
pnpm --filter @fe-base/utils build

# Or rebuild all packages
pnpm build
```

### 2. Missing Type Definitions

**Issue**: `TS2307: Cannot find module '@fe-base/types'`

**Cause**: TypeScript cannot find type definition files (`.d.ts`)

**Solution**:

```bash
# Regenerate type definitions
pnpm --filter @fe-base/types build
```

### 3. Build Cache Issues

**Issue**: Build artifacts not updated after code changes

**Cause**: Build tools used cache and didn't detect file changes

**Solution**:

```bash
# Clean build cache
pnpm clean:build && pnpm build

# Clean nx cache
nx reset
```

### 4. Dependency Version Conflicts

**Cause**: Different packages depend on different versions of the same library

**Solution**:

```bash
# Check dependency tree
pnpm list --filter @fe-base/element-sizer

# Check why a package was installed
pnpm why package-name

# Reinstall
rm -rf node_modules && pnpm install
```

## 🎯 Best Practices

### Development Workflow

1. **Initialize project**:

   ```bash
   pnpm install && pnpm build  # Install dependencies and build
   ```

2. **Daily development**:

   ```bash
   pnpm nx:build              # Incremental build of changed packages
   pnpm test                  # Run tests
   ```

3. **Watch mode development**:

   ```bash
   cd packages/element-sizer
   pnpm dev  # Start watch mode, automatically rebuild on file changes
   ```

4. **Pre-commit checks**:
   ```bash
   pnpm lint && pnpm build && pnpm test
   ```

### Why Follow This Workflow?

- **Initialization**: Ensure environment is correct and all dependencies work properly
- **Incremental builds**: Improve development efficiency, avoid unnecessary rebuilds
- **Watch mode**: Real-time feedback, enhance development experience
- **Pre-commit checks**: Ensure code quality, avoid breaking changes

## 📚 Related Documentation

- [How to Add a Subpackage](./how-to-add-a-subpackage.md)
- [Testing Guide](./testing-guide.md)
- [Build Formats Guide](./build-formats.md)
- [Project Release](./project-release.md)
