# Testing Guide

This document introduces the testing strategy, tool selection, and best practices for the fe-base project.

## Testing Framework Selection

### Why Choose Vitest?

We chose [Vitest](https://vitest.dev/) as our primary testing framework for the following reasons:

#### 1. **Perfect Integration with Vite Ecosystem**
- Shares Vite configuration, no additional setup required
- TypeScript and ESM support out of the box
- Hot reload testing for excellent development experience

#### 2. **Modern Features**
- Native ES module support
- Zero-config TypeScript
- Parallel test execution for faster performance
- Built-in code coverage reporting

#### 3. **Jest-Compatible API**
- Familiar `describe`, `it`, `expect` API
- Rich assertion library
- Comprehensive mocking capabilities

#### 4. **Monorepo Friendly**
- Supports workspace mode
- Can run tests for specific packages
- Automatic dependency handling

## Test Types

### Unit Tests
Test individual functions, classes, or components.

```typescript
// packages/element-sizer/src/__tests__/element-sizer.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ElementResizer } from '../element-sizer';

describe('ElementResizer', () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    // Create mock DOM element
    mockElement = document.createElement('div');
    document.body.appendChild(mockElement);
  });

  it('should create instance with default options', () => {
    const resizer = new ElementResizer({ target: mockElement });
    expect(resizer.target).toBe(mockElement);
    expect(resizer.animationState).toBe('idle');
  });

  it('should expand element correctly', async () => {
    const resizer = new ElementResizer({ target: mockElement });
    resizer.expand();
    expect(resizer.animationState).toBe('expanding');
  });
});
```

### Integration Tests
Test interactions between multiple modules.

```typescript
// packages/element-sizer/src/__tests__/integration.test.ts
import { describe, it, expect } from 'vitest';
import { ElementResizer } from '../element-sizer';

describe('ElementResizer Integration', () => {
  it('should work with real DOM elements', () => {
    // Create complete DOM structure
    const container = document.createElement('div');
    const content = document.createElement('div');
    content.innerHTML = '<p>Test content</p>';
    container.appendChild(content);
    document.body.appendChild(container);

    const resizer = new ElementResizer({
      target: container,
      placeholder: true,
      expandClassName: 'expanded'
    });

    // Test complete expand/collapse flow
    resizer.expand();
    expect(container.classList.contains('expanded')).toBe(true);
  });
});
```

## Test Configuration

### Vitest Configuration File

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'jsdom',
    
    // Global settings
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**'
      ]
    },
    
    // Test file matching patterns
    include: ['**/__tests__/**/*.{test,spec}.{js,ts}'],
    
    // Set timeout
    testTimeout: 10000,
    
    // Alias configuration - for mocking inter-package dependencies
    alias: {
      '@fe-base/element-sizer': resolve(__dirname, 'packages/element-sizer/__mocks__'),
      // Example configuration for future packages
      // '@fe-base/package-a': resolve(__dirname, 'packages/package-a/__mocks__'),
      // '@fe-base/package-b': resolve(__dirname, 'packages/package-b/__mocks__'),
    }
  }
});
```

### Package-Level Configuration

Each package can have its own test configuration:

```json
// packages/element-sizer/package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### __mocks__ Directory Configuration

To solve testing issues with inter-package dependencies in monorepo, we use the `__mocks__` directory to provide mock entries.

#### Directory Structure

```
packages/element-sizer/
├── src/
│   ├── __tests__/           # Test directory
│   │   ├── unit/           # Unit tests
│   │   ├── integration/    # Integration tests
│   │   └── fixtures/       # Test data
│   ├── element-sizer.ts
│   └── index.ts
├── __mocks__/               # Mock entry directory (for dependency mocks when other packages test)
│   ├── index.ts            # Main mock entry
│   ├── element-resizer.ts  # Detailed mock implementation
│   └── utils.ts            # Utility function mocks
├── dist/                   # Build output
└── package.json
```

#### Mock Entry File Example

```typescript
// packages/element-sizer/__mocks__/index.ts
import { vi } from 'vitest';

// Create mock class for ElementResizer
export class ElementResizer {
  target: HTMLElement;
  animationState: string = 'idle';
  isAnimating: boolean = false;

  constructor(options: { target: HTMLElement }) {
    this.target = options.target;
  }

  expand = vi.fn(() => {
    this.animationState = 'expanding';
    // Simulate async operation
    setTimeout(() => {
      this.animationState = 'expanded';
    }, 100);
  });

  collapse = vi.fn(() => {
    this.animationState = 'collapsing';
    setTimeout(() => {
      this.animationState = 'collapsed';
    }, 100);
  });

  fixedCurrentTargetRect = vi.fn();
  cancelAnimation = vi.fn();
}

// Default export
export default ElementResizer;

// Other possible exports
export const createElementResizer = vi.fn((options) => new ElementResizer(options));
export const utils = {
  calculateSize: vi.fn(),
  animateElement: vi.fn()
};
```

#### Using Mocks in Other Packages

Suppose we have a new package `package-a` that depends on `element-sizer`:

```typescript
// packages/package-a/src/__tests__/component.test.ts
import { describe, it, expect, vi } from 'vitest';
import { ElementResizer } from '@fe-base/element-sizer'; // Automatically points to mock
import { MyComponent } from '../component';

describe('MyComponent', () => {
  it('should use ElementResizer correctly', () => {
    const mockElement = document.createElement('div');
    const component = new MyComponent(mockElement);
    
    // Since we're using mocks, ElementResizer here is the mocked version
    expect(ElementResizer).toHaveBeenCalled();
    
    component.expand();
    expect(ElementResizer.prototype.expand).toHaveBeenCalled();
  });
});
```

#### Advanced Mock Configuration

For more complex mock requirements, you can create multiple mock files:

```
packages/element-sizer/__mocks__/
├── index.ts                 # Main mock entry
├── element-resizer.ts       # Detailed mock for ElementResizer class
├── utils.ts                 # Mock for utility functions
└── types.ts                 # Mock for type definitions
```

```typescript
// packages/element-sizer/__mocks__/element-resizer.ts
import { vi } from 'vitest';

export class ElementResizer {
  // Detailed mock implementation
  private _target: HTMLElement;
  private _state: string = 'idle';
  
  constructor(options: { target: HTMLElement }) {
    this._target = options.target;
  }
  
  get target() { return this._target; }
  get animationState() { return this._state; }
  get isAnimating() { return this._state.includes('ing'); }
  
  expand = vi.fn().mockImplementation(() => {
    this._state = 'expanding';
    return Promise.resolve();
  });
  
  collapse = vi.fn().mockImplementation(() => {
    this._state = 'collapsing';
    return Promise.resolve();
  });
}
```

```typescript
// packages/element-sizer/__mocks__/index.ts
export { ElementResizer } from './element-resizer';
export { mockUtils as utils } from './utils';
export * from './types';
```

#### Conditional Mocks

Sometimes you may need different mock behaviors in different tests:

```typescript
// packages/package-a/src/__tests__/advanced.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Dynamic import to allow re-mocking
const mockElementResizer = vi.hoisted(() => ({
  ElementResizer: vi.fn()
}));

vi.mock('@fe-base/element-sizer', () => mockElementResizer);

describe('Advanced Mock Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle success case', () => {
    // Configure successful mock behavior
    mockElementResizer.ElementResizer.mockImplementation(() => ({
      expand: vi.fn().mockResolvedValue(true),
      animationState: 'expanded'
    }));
    
    // Test code...
  });

  it('should handle error case', () => {
    // Configure failure mock behavior
    mockElementResizer.ElementResizer.mockImplementation(() => ({
      expand: vi.fn().mockRejectedValue(new Error('Animation failed')),
      animationState: 'error'
    }));
    
    // Test code...
  });
});
```

## Testing Best Practices

### 1. Test File Organization

```
packages/element-sizer/
├── src/
│   ├── __tests__/           # Test directory
│   │   ├── unit/           # Unit tests
│   │   ├── integration/    # Integration tests
│   │   └── fixtures/       # Test data
│   ├── element-sizer.ts
│   └── index.ts
├── __mocks__/               # Mock entry directory (for dependency mocks when other packages test)
│   ├── index.ts            # Main mock entry
│   ├── element-resizer.ts  # Detailed mock implementation
│   └── utils.ts            # Utility function mocks
├── dist/                   # Build output
└── package.json
```

### 2. Naming Conventions

- Test files: `*.test.ts` or `*.spec.ts`
- Test descriptions: Use clear English descriptions
- Test cases: Follow "should + action + expected result" format
- Mock files: Same name as original file, placed in `__mocks__` directory

### 3. Mock Strategies

#### Browser API Mocks

```typescript
// Mock DOM API
vi.mock('window', () => ({
  requestAnimationFrame: vi.fn((cb) => setTimeout(cb, 16)),
  cancelAnimationFrame: vi.fn()
}));

// Mock third-party libraries
vi.mock('some-library', () => ({
  default: vi.fn(),
  namedExport: vi.fn()
}));
```

#### Inter-Package Dependency Mocks

Through vitest alias configuration, automatically point package dependencies to `__mocks__` directory:

```typescript
// Direct import in tests will automatically use mock version
import { ElementResizer } from '@fe-base/element-sizer';

// This actually imports packages/element-sizer/__mocks__/index.ts
```

#### Creating Package Mock Entries

Each package should provide a `__mocks__` directory for easy use by other packages during testing:

```typescript
// packages/element-sizer/__mocks__/index.ts
import { vi } from 'vitest';

export class ElementResizer {
  // Mock implementation, maintaining consistent interface with real API
  target: HTMLElement;
  animationState: string = 'idle';
  
  constructor(options: { target: HTMLElement }) {
    this.target = options.target;
  }
  
  expand = vi.fn();
  collapse = vi.fn();
  fixedCurrentTargetRect = vi.fn();
  cancelAnimation = vi.fn();
}

export default ElementResizer;
```

### 4. Async Testing

```typescript
it('should handle async operations', async () => {
  const resizer = new ElementResizer({ target: mockElement });
  
  // Using Promise
  await resizer.expand();
  expect(resizer.animationState).toBe('expanded');
  
  // Using waitFor
  await vi.waitFor(() => {
    expect(mockElement.style.height).toBe('auto');
  });
});
```

## Running Tests

### Basic Commands

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Run tests for specific package
pnpm --filter @fe-base/element-sizer test

# Run specific test file
pnpm test element-sizer.test.ts
```

### Testing in CI/CD

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v3
```

## Test Coverage

### Coverage Goals

- **Statement Coverage**: >= 80%
- **Branch Coverage**: >= 75%
- **Function Coverage**: >= 85%
- **Line Coverage**: >= 80%

### Viewing Coverage Reports

```bash
# Generate coverage report
pnpm test:coverage

# View detailed report in browser
open coverage/index.html
```

## Debugging Tests

### VS Code Debug Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Vitest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "--reporter=verbose"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Debugging Tips

```typescript
// Use console.log for debugging
it('should debug test', () => {
  console.log('Debug info:', someVariable);
  expect(someVariable).toBe(expectedValue);
});

// Use debugger breakpoints
it('should use debugger', () => {
  debugger; // Pause here
  expect(true).toBe(true);
});
```

## Common Issues

### Q: How to test DOM operations?
A: Use jsdom environment, Vitest automatically provides DOM APIs.

### Q: How to mock browser APIs?
A: Use `vi.mock()` or globally mock in `setupFiles`.

### Q: What to do when tests run slowly?
A: Check for unnecessary async operations, use `vi.useFakeTimers()` to speed up time-related tests.

### Q: How to test TypeScript types?
A: Use `expectTypeOf` or `assertType` for type testing.

```typescript
import { expectTypeOf } from 'vitest';

it('should have correct types', () => {
  expectTypeOf(resizer.target).toEqualTypeOf<HTMLElement>();
});
```

### Q: How to test inter-package dependencies in monorepo?
A: Use `__mocks__` directory and vitest alias configuration. Configure aliases in the root `vitest.config.ts` to point package names to corresponding `__mocks__` directories.

### Q: What should the __mocks__ directory contain?
A: 
- `index.ts` - Main mock exports, maintaining the same API interface as the real package
- Specific mock implementation files like `element-resizer.ts`, `utils.ts`, etc.
- Mocks should provide the same interface as real implementations but use `vi.fn()` to create controllable functions

### Q: How to keep mocks in sync with real implementations?
A: 
1. Add checks in CI/CD to ensure mock interfaces match real interfaces
2. Use TypeScript type checking to verify mock correctness
3. Regularly review and update mock implementations

### Q: When to use vi.mock() vs __mocks__ directory?
A: 
- Use `__mocks__` directory: For persistent mocks of inter-package dependencies, shared across multiple test files
- Use `vi.mock()`: For temporary mocks in specific tests, scenarios requiring different behaviors

```typescript
export default ElementResizer;
``` 