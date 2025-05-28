# How to Add a Subpackage

This document provides detailed instructions on how to add new subpackages to the fe-base project, including both manual creation and using nx tools.

## 📋 Table of Contents

- [Creation Method Selection](#-creation-method-selection)
- [Manual Package Creation](#-manual-package-creation)
- [Using nx Creation](#-using-nx-creation)
- [Configuration File Details](#-configuration-file-details)
- [Best Practices](#-best-practices)
- [Common Issues](#-common-issues)

## 🎯 Creation Method Selection

### Manual Creation vs nx Creation

| Feature            | Manual Creation                         | nx Creation                 |
| ------------------ | --------------------------------------- | --------------------------- |
| **Flexibility**    | ⭐⭐⭐⭐⭐ Full customization           | ⭐⭐⭐ Template-based       |
| **Speed**          | ⭐⭐ Manual configuration required      | ⭐⭐⭐⭐⭐ Quick generation |
| **Learning Curve** | ⭐⭐⭐ Need to understand configuration | ⭐⭐⭐⭐ Relatively simple  |
| **Customization**  | ⭐⭐⭐⭐⭐ Any build tool               | ⭐⭐⭐ Preset options       |

**Recommended Choice**:

- 🚀 **Quick Development**: Use nx creation
- 🔧 **Special Requirements**: Manual creation (for specific build tools)

## 🛠️ Manual Package Creation

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
  "files": [
    "dist",
    "package.json",
    "README.md",
    "README_EN.md",
    "CHANGELOG.md"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/qlover/fe-base.git",
    "directory": "packages/my-new-package"
  },
  "homepage": "https://github.com/qlover/fe-base#readme",
  "keywords": ["frontend toolkit", "my-new-package", "your keywords"],
  "author": "Your Name",
  "license": "ISC",
  "publishConfig": {
    "access": "public"
  },
  "devDependencies": {
    "typescript": "workspace:*",
    "tsup": "workspace:*",
    "vitest": "workspace:*"
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

export default defineConfig([
  // Main build configuration
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: false,
    sourcemap: true,
    clean: true,
    minify: process.env.NODE_ENV === 'production',
    outDir: 'dist'
  },
  // Type definition build
  {
    entry: ['src/index.ts'],
    format: 'esm',
    dts: true,
    outDir: 'dist'
  }
]);
```

### Step 3: Create Source Code Files

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
  // Define your option interfaces
  option1?: string;
  option2?: number;
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
  private options: MyMainClassOptions;

  constructor(options: MyMainClassOptions = {}) {
    this.options = {
      option1: 'default',
      option2: 0,
      ...options
    };
  }

  // Implement your main functionality
  public doSomething(): void {
    console.log('MyMainClass is working!');
  }
}
```

```typescript
// src/utils.ts
import type { MyUtilOptions } from './types';

export function myUtilFunction(options: MyUtilOptions = {}): string {
  const { debug = false } = options;

  if (debug) {
    console.log('myUtilFunction called');
  }

  return 'Utility function result';
}
```

### Step 4: Create Test Files

#### 4.1 Create Test Directory Structure

```bash
# Create test files
mkdir __tests__/unit
mkdir __tests__/integration
touch __tests__/unit/my-main-class.test.ts
touch __tests__/unit/utils.test.ts
touch __tests__/integration/index.test.ts
```

#### 4.2 Write Unit Tests

```typescript
// __tests__/unit/my-main-class.test.ts
import { describe, it, expect, vi } from 'vitest';
import { MyMainClass } from '../../src/my-main-class';

describe('MyMainClass', () => {
  it('should create instance with default options', () => {
    const instance = new MyMainClass();
    expect(instance).toBeInstanceOf(MyMainClass);
  });

  it('should accept custom options', () => {
    const options = { option1: 'custom', option2: 42 };
    const instance = new MyMainClass(options);
    expect(instance).toBeInstanceOf(MyMainClass);
  });

  it('should execute doSomething method', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const instance = new MyMainClass();

    instance.doSomething();

    expect(consoleSpy).toHaveBeenCalledWith('MyMainClass is working!');
    consoleSpy.mockRestore();
  });
});
```

#### 4.3 Create Mock Files

```bash
# Create Mock entry
touch __mocks__/index.ts
```

```typescript
// __mocks__/index.ts
import { vi } from 'vitest';

// Mock main class
export class MyMainClass {
  constructor(options: any = {}) {
    // Mock implementation
  }

  doSomething = vi.fn(() => {
    console.log('Mock: MyMainClass is working!');
  });
}

// Mock utility function
export const myUtilFunction = vi.fn((options: any = {}) => {
  return 'Mock: Utility function result';
});

// Default export
export { MyMainClass as default } from './my-main-class';
```

### Step 5: Create Documentation Files

#### 5.1 Create README.md

```bash
touch README.md
```

```markdown
# @qlover/my-new-package

Your package's brief description

## Installation

```bash
npm install @qlover/my-new-package
# or
pnpm add @qlover/my-new-package
```

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
```

#### 5.2 Create CHANGELOG.md

```bash
touch CHANGELOG.md
```

```markdown
# @qlover/my-new-package

## [0.1.0] - 2024-01-01

### Added
- Initial version
- Added MyMainClass class
- Added utility functions
```

### Step 6: Install Dependencies and Build

```bash
# Return to project root directory
cd ../../

# Install dependencies
pnpm install

# Build new package
pnpm build

# Run tests
pnpm test packages/my-new-package
```

## 🤖 Using nx Creation

### Install nx (if not already installed)

```bash
# Install nx globally
npm install -g nx

# Or install in project
pnpm add -D nx @nx/js @nx/react @nx/node
```

### Create Different Types of Packages

#### Create JavaScript/TypeScript Library

```bash
# Create general JS/TS library
nx generate @nx/js:lib my-new-package --directory=packages --bundler=tsup

# Specify more options
nx generate @nx/js:lib my-util-package \
  --directory=packages \
  --bundler=tsup \
  --unitTestRunner=vitest \
  --publishable=true
```

#### Create React Component Library

```bash
# Create React component library
nx generate @nx/react:lib my-react-components \
  --directory=packages \
  --bundler=vite \
  --unitTestRunner=vitest \
  --publishable=true
```

#### Create Node.js Application

```bash
# Create Node.js application
nx generate @nx/node:app my-api \
  --directory=packages \
  --bundler=esbuild
```

### Configuration Adjustments After nx Creation

#### Adjust package.json

```bash
# Edit generated package.json
cd packages/my-new-package
```

Need to manually adjust the following:

- Package name format: `@qlover/package-name`
- Repository information
- Publishing configuration
- Keywords and description

#### Adjust Build Configuration

Adjust nx-generated build configuration according to project requirements to ensure consistency with project standards.

### View Project Dependency Graph

```bash
# View project dependency relationships
nx graph

# View specific package dependencies
nx show project my-new-package
```

## ⚙️ Configuration File Details

### package.json Key Fields

| Field     | Description                                     | Example                     |
| --------- | ----------------------------------------------- | --------------------------- |
| `name`    | Package name, must start with `@qlover/` | `@qlover/my-package` |
| `version` | Version number, follow semantic versioning      | `0.1.0`                     |
| `type`    | Module type, set to `module`                    | `module`                    |
| `main`    | CommonJS entry                                  | `./dist/index.cjs`          |
| `module`  | ES Module entry                                 | `./dist/index.js`           |
| `types`   | TypeScript type definitions                     | `./dist/index.d.ts`         |
| `exports` | Modern export configuration                     | See example above           |
| `files`   | Files included when publishing                  | `["dist", "README.md"]`     |

### tsup.config.ts Configuration Options

| Option      | Description               | Recommended Value                       |
| ----------- | ------------------------- | --------------------------------------- |
| `entry`     | Entry files               | `['src/index.ts']`                      |
| `format`    | Output formats            | `['esm', 'cjs']`                        |
| `dts`       | Generate type definitions | `true`                                  |
| `sourcemap` | Generate source maps      | `true`                                  |
| `clean`     | Clean before build        | `true`                                  |
| `minify`    | Code minification         | `process.env.NODE_ENV === 'production'` |

## 🎯 Best Practices

### 1. Naming Conventions

```bash
# Package name convention
@qlover/package-name

# File name conventions
my-component.ts          # kebab-case
MyComponent.ts           # PascalCase (class files)
utils.ts                 # lowercase
types.ts                 # type definition files
```

### 2. Directory Structure Standards

```
packages/my-new-package/
├── src/                 # Source code directory
│   ├── index.ts        # Main entry file
│   ├── types.ts        # Type definitions
│   ├── utils.ts        # Utility functions
│   └── components/     # Components directory (if any)
├── __tests__/          # Test directory
│   ├── unit/          # Unit tests
│   ├── integration/   # Integration tests
│   └── fixtures/      # Test data
├── __mocks__/          # Mock files
├── dist/               # Build output
├── package.json        # Package configuration
├── tsconfig.json       # TS configuration
├── tsup.config.ts      # Build configuration
├── README.md           # Chinese documentation
├── README_EN.md        # English documentation
└── CHANGELOG.md        # Change log
```

### 3. Code Standards

#### Export Standards

```typescript
// ✅ Recommended: Named exports + default export
export { MyClass } from './my-class';
export { myFunction } from './utils';
export type { MyOptions } from './types';
export { MyClass as default } from './my-class';

// ❌ Avoid: Only default export
export default MyClass;
```

#### Type Definition Standards

```typescript
// ✅ Recommended: Detailed type definitions
export interface MyClassOptions {
  /** Description of option1 */
  option1?: string;
  /** Description of option2 */
  option2?: number;
  /** Callback function */
  onComplete?: (result: string) => void;
}

// ❌ Avoid: any type
export interface MyClassOptions {
  options?: any;
}
```

### 4. Testing Standards

#### Test File Organization

```bash
__tests__/
├── unit/                    # Unit tests
│   ├── my-class.test.ts    # Class tests
│   └── utils.test.ts       # Utility function tests
├── integration/             # Integration tests
│   └── index.test.ts       # Overall functionality tests
└── fixtures/               # Test data
    └── mock-data.ts
```

#### Test Coverage Requirements

- **Unit test coverage**: >= 80%
- **Critical functionality coverage**: >= 95%
- **Type testing**: Must be included

### 5. Documentation Standards

#### README.md Structure

```markdown
# Package Name

Brief description

## 📦 Installation

## 🚀 Quick Start

## 📖 API Documentation

## 🎯 Use Cases

## 🔧 Configuration Options

## 📝 Examples
```

## ❓ Common Issues

### Q1: How should packages be named?

**A**: Package names must start with `@qlover/` and use kebab-case format:

```bash
✅ @qlover/fe-corekit
✅ @qlover/ui-components
✅ @qlover/data-utils

❌ @qlover/FeCorekit
❌ @qlover/UI_Components
```

### Q2: How to handle inter-package dependencies?

**A**: Use `workspace:*` to reference local packages:

```json
{
  "dependencies": {
    "@qlover/other-package": "workspace:*"
  }
}
```

### Q3: What to do when build fails?

**A**: Check the following points:

1. Ensure `tsconfig.json` configuration is correct
2. Check `tsup.config.ts` entry file path
3. Confirm all dependencies are installed: `pnpm install`
4. Clean and rebuild: `pnpm clean:build && pnpm build`

### Q4: How to debug new packages?

**A**: Use the following commands:

```bash
# Watch mode build
cd packages/my-new-package
pnpm dev

# Test in other packages
cd packages/other-package
pnpm add @qlover/my-new-package@workspace:*
```

### Q5: What to check before publishing?

**A**: Pre-publish checklist:

- [ ] Package name format is correct
- [ ] Version number follows semantic versioning
- [ ] README.md documentation is complete
- [ ] Tests pass: `pnpm test`
- [ ] Build succeeds: `pnpm build`
- [ ] Type definitions are correct: check `dist/*.d.ts`
- [ ] Publishing configuration is correct: `publishConfig.access: "public"`

### Q6: How to delete a created package?

**A**: Deletion steps:

```bash
# 1. Delete package directory
rm -rf packages/my-package

# 2. Clean dependencies
pnpm install

# 3. Rebuild
pnpm build
```

## 📚 Related Documentation

- [Project Build and Dependency Management](./project-builder.md)
- [Testing Guide](./testing-guide.md)
- [Build Formats Guide](./build-formats.md)
- [Commit Convention](./commit-convention.md)
- [Project Release](./project-release.md)
