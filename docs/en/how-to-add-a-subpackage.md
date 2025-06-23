# How to Add a Subpackage

This document provides detailed instructions on how to add new subpackages to the fe-base project, including both manual creation and nx tool creation methods.

## 📋 Table of Contents

- [Creation Method Selection](#-creation-method-selection)
- [Manual Package Creation](#manual-package-creation)
- [Using nx Creation](#-using-nx-creation)
- [Configuration File Details](#-configuration-file-details)
- [Best Practices](#-best-practices)
- [Common Issues](#-common-issues)

## 🎯 Creation Method Selection

### Manual Creation vs nx Creation

| Feature            | Manual Creation                         | nx Creation                 |
| ------------------ | --------------------------------------- | --------------------------- |
| **Flexibility**    | ⭐⭐⭐⭐⭐ Fully customizable           | ⭐⭐⭐ Template-based       |
| **Speed**          | ⭐⭐ Requires manual configuration      | ⭐⭐⭐⭐⭐ Quick generation |
| **Learning Curve** | ⭐⭐⭐ Need to understand configuration | ⭐⭐⭐⭐ Relatively simple  |
| **Customization**  | ⭐⭐⭐⭐⭐ Any build tool               | ⭐⭐⭐ Preset options       |

**Recommended Choice**:

- 🚀 **Quick Development**: Use nx creation
- 🔧 **Special Requirements**: Manual creation (if specific build tools needed)

## Manual Package Creation

### Step 1: Create Package Directory Structure

```bash
# Create new package in packages directory
cd packages
mkdir my-new-package
cd my-new-package

# Create standard directory structure
mkdir src
mkdir __tests__
mkdir __mocks__
mkdir dist
```

### Step 2: Create Core Configuration Files

#### 2.1 Create package.json

```bash
# Create package.json
touch package.json
```

```json
{
  "name": "@qlover/my-new-package",
  "version": "0.1.0",
  "type": "module",
  "private": false,
  "description": "Your package description",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist", "package.json", "README.md", "CHANGELOG.md"],
  "scripts": {
    "build": "tsup"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/qlover/fe-base.git",
    "directory": "packages/my-new-package"
  },
  "homepage": "https://github.com/qlover/fe-base/tree/master/packages/my-new-package#readme",
  "keywords": ["frontend toolkit", "my-new-package", "your keywords"],
  "author": "qlover",
  "license": "ISC",
  "publishConfig": {
    "access": "public"
  }
}
```

#### 2.2 Create TypeScript Configuration

```bash
# Create tsconfig.json
touch tsconfig.json
```

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "__tests__", "**/*.test.ts"]
}
```

#### 2.3 Create Build Configuration

```bash
# Create tsup.config.ts
touch tsup.config.ts
```

```typescript
import { defineConfig } from 'tsup';
import pkg from './package.json';
import { toPureCamelCase } from '../../make/toPureCamelCase';

const pkgName = toPureCamelCase(pkg.name);

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs'],
    dts: false,
    minify: true,
    clean: true,
    silent: true,
    globalName: pkgName,
    outDir: 'dist'
  },
  {
    entry: ['src/index.ts'],
    format: 'esm',
    dts: true,
    outDir: 'dist'
  }
]);
```

#### 2.4 Create nx Project Configuration

```bash
# Create project.json
touch project.json
```

```json
{
  "name": "@qlover/my-new-package",
  "sourceRoot": "packages/my-new-package/src",
  "projectType": "library",
  "targets": {
    "build": {
      "executor": "nx:run-commands",
      "options": {
        "command": "pnpm build",
        "cwd": "packages/my-new-package"
      },
      "inputs": [
        "{projectRoot}/src/**/*.ts",
        "{projectRoot}/tsup.config.ts",
        "{projectRoot}/package.json",
        "{projectRoot}/README.md",
        "{workspaceRoot}/nx.json"
      ],
      "outputs": ["{projectRoot}/dist"],
      "cache": true
    }
  }
}
```

### Step 3: Create Source Files

#### 3.1 Create Main Entry File

```bash
# Create src/index.ts
touch src/index.ts
```

```typescript
// src/index.ts
/**
 * @qlover/my-new-package
 *
 * Your package description
 *
 * @author Your Name
 * @version 0.1.0
 */

// Export main functionality
export { MyMainClass } from './my-main-class';
export { myUtilFunction } from './utils';

// Export type definitions
export type { MyMainClassOptions, MyUtilOptions } from './types';

// Default export
export { MyMainClass as default } from './my-main-class';
```

#### 3.2 Create Core Functionality Files

```bash
# Create core class files
touch src/my-main-class.ts
touch src/utils.ts
touch src/types.ts
```

```typescript
// src/types.ts
export interface MyMainClassOptions {
  // Configuration options
  enabled?: boolean;
  timeout?: number;
}

export interface MyUtilOptions {
  // Utility function options
  debug?: boolean;
}
```

```typescript
// src/my-main-class.ts
import type { MyMainClassOptions } from './types';

export class MyMainClass {
  private options: Required<MyMainClassOptions>;

  constructor(options: MyMainClassOptions = {}) {
    this.options = {
      enabled: true,
      timeout: 5000,
      ...options
    };
  }

  public doSomething(): string {
    if (!this.options.enabled) {
      return 'disabled';
    }
    return 'success';
  }
}
```

```typescript
// src/utils.ts
import type { MyUtilOptions } from './types';

export function myUtilFunction(
  input: string,
  options: MyUtilOptions = {}
): string {
  const { debug = false } = options;

  if (debug) {
    console.log('Processing:', input);
  }

  return input.toUpperCase();
}
```

### Step 4: Create Test Files

#### 4.1 Create Unit Tests

```bash
# Create test files
touch __tests__/my-main-class.test.ts
touch __tests__/utils.test.ts
```

```typescript
// __tests__/my-main-class.test.ts
import { describe, it, expect } from 'vitest';
import { MyMainClass } from '../src/my-main-class';

describe('MyMainClass', () => {
  it('should create instance with default options', () => {
    const instance = new MyMainClass();
    expect(instance).toBeInstanceOf(MyMainClass);
  });

  it('should return success when enabled', () => {
    const instance = new MyMainClass({ enabled: true });
    expect(instance.doSomething()).toBe('success');
  });

  it('should return disabled when disabled', () => {
    const instance = new MyMainClass({ enabled: false });
    expect(instance.doSomething()).toBe('disabled');
  });
});
```

```typescript
// __tests__/utils.test.ts
import { describe, it, expect, vi } from 'vitest';
import { myUtilFunction } from '../src/utils';

describe('myUtilFunction', () => {
  it('should convert string to uppercase', () => {
    expect(myUtilFunction('hello')).toBe('HELLO');
  });

  it('should log debug info when debug is enabled', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    myUtilFunction('test', { debug: true });

    expect(consoleSpy).toHaveBeenCalledWith('Processing:', 'test');
    consoleSpy.mockRestore();
  });
});
```

### Step 5: Create Documentation Files

#### 5.1 Create README.md

```bash
touch README.md
```

````markdown
# @qlover/my-new-package

Brief description of your package

## Installation

```bash
npm install @qlover/my-new-package
# or
pnpm add @qlover/my-new-package
```
````

## Usage

```typescript
import { MyMainClass } from '@qlover/my-new-package';

const instance = new MyMainClass({
  enabled: true,
  timeout: 3000
});

console.log(instance.doSomething()); // 'success'
```

## API

### MyMainClass

Main functionality class

#### Constructor

```typescript
new MyMainClass(options?: MyMainClassOptions)
```

#### Methods

- `doSomething(): string` - Execute main functionality

## License

ISC

````

#### 5.2 Create CHANGELOG.md

```bash
touch CHANGELOG.md
````

```markdown
# @qlover/my-new-package

## [0.1.0] - 2024-01-01

### Added

- Initial version
- Added MyMainClass class
- Added utility functions
```

### Step 6: Build and Test

```bash
# Install dependencies
pnpm install

# Build package
pnpm build

# Run tests
pnpm test

# Check build artifacts
ls dist/
# Should see: index.js, index.cjs, index.d.ts
```

## 🚀 Using nx Creation

### Using Existing nx Configuration

The project already has nx configured, you can directly use the following commands:

```bash
# Use nx to generate new library
nx generate @nx/js:library my-new-package --directory=packages/my-new-package --bundler=none --unitTestRunner=vitest
```

### Directory Structure Generated by nx

```
packages/my-new-package/
├── src/
│   ├── index.ts
│   └── lib/
│       └── my-new-package.ts
├── project.json
├── tsconfig.json
├── tsconfig.lib.json
├── README.md
└── .eslintrc.json
```

### Customize nx Generated Package

#### Modify project.json

After generation, you need to modify project.json to conform to project standards:

```json
{
  "name": "@qlover/my-new-package",
  "sourceRoot": "packages/my-new-package/src",
  "projectType": "library",
  "targets": {
    "build": {
      "executor": "nx:run-commands",
      "options": {
        "command": "pnpm build",
        "cwd": "packages/my-new-package"
      },
      "inputs": [
        "{projectRoot}/src/**/*.ts",
        "{projectRoot}/tsup.config.ts",
        "{projectRoot}/package.json",
        "{projectRoot}/README.md",
        "{workspaceRoot}/nx.json"
      ],
      "outputs": ["{projectRoot}/dist"],
      "cache": true
    }
  }
}
```

## 📋 Configuration File Details

### package.json Key Fields

| Field     | Description                                 | Example              |
| --------- | ------------------------------------------- | -------------------- |
| `name`    | Package name, must start with `@qlover/`    | `@qlover/my-package` |
| `version` | Version number, follows semantic versioning | `0.1.0`              |
| `type`    | Module type, set to `module`                | `module`             |
| `main`    | CommonJS entry                              | `./dist/index.cjs`   |
| `module`  | ES Module entry                             | `./dist/index.js`    |
| `types`   | TypeScript type definitions                 | `./dist/index.d.ts`  |
| `exports` | Modern module export configuration          | See example above    |

### tsconfig.json Configuration

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "__tests__"]
}
```

### tsup.config.ts Configuration Options

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: process.env.NODE_ENV === 'production',
  splitting: false,
  outDir: 'dist',
  target: 'es2020',
  platform: 'neutral'
});
```

## 📁 Directory Structure Standards

### Recommended Package Structure

```
@qlover/package-name/
├── src/                    # Source directory
│   ├── index.ts           # Main entry file
│   ├── types.ts           # Type definitions
│   ├── utils.ts           # Utility functions
│   └── components/        # Components directory (if any)
├── __tests__/             # Test directory
│   ├── index.test.ts      # Main test file
│   └── utils.test.ts      # Utility test files
├── __mocks__/             # Mock files
├── dist/                  # Build artifacts (auto-generated)
├── docs/                  # Documentation directory (optional)
├── examples/              # Example code (optional)
├── package.json           # Package configuration
├── tsconfig.json          # TS configuration
├── tsup.config.ts         # Build configuration
├── README.md              # Documentation
├── README_EN.md           # English documentation (optional)
└── CHANGELOG.md           # Change log
```

## 🎯 Best Practices

### 1. Naming Conventions

- **Package names**: Use kebab-case, like `@qlover/my-package`
- **File names**: Use kebab-case, like `my-component.ts`
- **Class names**: Use PascalCase, like `MyComponent`
- **Function names**: Use camelCase, like `myFunction`

### 2. Export Standards

```typescript
// ✅ Recommended: Named exports + default export
export { MyClass } from './my-class';
export { myFunction } from './utils';
export type { MyOptions } from './types';
export { MyClass as default } from './my-class';

// ❌ Avoid: Only default export
export default {
  MyClass,
  myFunction
};
```

### 3. Type Definitions

```typescript
// ✅ Recommended: Detailed type definitions
export interface MyClassOptions {
  /** Whether to enable functionality */
  enabled?: boolean;
  /** Timeout duration (milliseconds) */
  timeout?: number;
}

// ❌ Avoid: any type
export interface MyClassOptions {
  options?: any;
}
```

### 4. Documentation Standards

````typescript
/**
 * My utility class
 *
 * @example
 * ```typescript
 * const instance = new MyClass({ enabled: true });
 * console.log(instance.doSomething());
 * ```
 */
export class MyClass {
  /**
   * Execute some operation
   *
   * @param input - Input parameter
   * @returns Processing result
   */
  public doSomething(input: string): string {
    return input;
  }
}
````

### 5. Test Coverage

```typescript
// Test all public APIs
describe('MyClass', () => {
  // Normal cases
  it('should work with valid input', () => {});

  // Edge cases
  it('should handle empty input', () => {});

  // Error cases
  it('should throw error with invalid input', () => {});
});
```

## ❓ Common Issues

### Q: How should packages be named?

**A**: Package names must start with `@qlover/` and use kebab-case format:

```bash
✅ @qlover/fe-corekit
✅ @qlover/ui-components
✅ @qlover/data-utils

❌ @qlover/FeCorekit
❌ @qlover/UI_Components
```

### Q: How to add dependencies between packages?

**A**: Use `workspace:*` syntax:

```json
{
  "dependencies": {
    "@qlover/other-package": "workspace:*"
  }
}
```

### Q: What to do when build fails?

**A**: Check the following:

1. Ensure TypeScript configuration is correct
2. Check if dependencies are installed
3. Ensure source code has no syntax errors
4. Check specific error messages in build logs

### Q: How to publish packages?

**A**: Use the project's release process:

```bash
# Add change records
pnpm changeset

# Publish
pnpm changeset publish
```

### Q: How to test packages locally?

**A**: You can use workspace dependencies:

```bash
# Add dependency in other packages
pnpm add @qlover/my-new-package@workspace:*

# Or test after building in root directory
pnpm build
pnpm test
```

### Q: How to manage package versions?

**A**: Use Changesets for version management:

1. After development, run `pnpm changeset`
2. Select change type (patch/minor/major)
3. Fill in change description
4. Commit code
5. Run `pnpm changeset publish` when publishing

## 📚 Related Documentation

- [Project Build and Dependency Management](./project-builder.md)
- [Testing Guide](./testing-guide.md)
- [Build Format Guide](./build-formats.md)
- [Project Release](./project-release.md)

## 🌐 Other Language Versions

- **[🇨🇳 中文](../zh/how-to-add-a-subpackage.md)** - Chinese version of this document
- **[🏠 Back to Home](./index.md)** - Return to English documentation home
