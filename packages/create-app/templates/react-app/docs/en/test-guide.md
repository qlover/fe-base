# Testing Guide

> This document briefly introduces the testing strategies and best practices for the **fe-base** project in a monorepo scenario, using [Vitest](https://vitest.dev/) as the unified testing framework.

---

## Why Choose Vitest

1. **Perfect Integration with Vite Ecosystem**: Shares Vite configuration, TypeScript & ESM work out of the box.
2. **Modern Features**: Parallel execution, HMR, built-in coverage statistics.
3. **Jest Compatible API**: `describe / it / expect` APIs with no learning curve.
4. **Monorepo Friendly**: Can filter execution by workspace, easy to run package-level tests in parallel in CI.

---

## Test Types

- **Unit Tests**: Verify the minimal behavior of functions, classes, or components.
- **Integration Tests**: Verify collaboration and boundaries between multiple modules.
- **End-to-End (E2E, introduce Playwright/Cypress as needed)**: Verify complete user workflows.

> ⚡️ In most cases, prioritize writing unit tests; only add integration tests when cross-module interactions are complex.

---

## Test File Organization Standards

### File Naming and Location

```
packages/
├── package-name/
│   ├── __tests__/           # Test files directory
│   │   ├── Class.test.ts    # Class tests
│   │   ├── utils/           # Utility function tests
│   │   │   └── helper.test.ts
│   │   └── integration/     # Integration tests
│   ├── __mocks__/           # Mock files directory
│   │   └── index.ts
│   └── src/                 # Source code directory
```

### Test File Structure

```typescript
// Standard test file header comment
/**
 * ClassName test-suite
 *
 * Coverage:
 * 1. constructor       – Constructor tests
 * 2. methodName        – Method functionality tests
 * 3. edge cases        – Edge case tests
 * 4. error handling    – Error handling tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ClassName } from '../src/ClassName';

describe('ClassName', () => {
  // Test data and mock objects
  let instance: ClassName;
  let mockDependency: MockType;

  // Setup and cleanup
  beforeEach(() => {
    // Initialize test environment
    mockDependency = createMockDependency();
    instance = new ClassName(mockDependency);
  });

  afterEach(() => {
    // Clean up test environment
    vi.clearAllMocks();
  });

  // Constructor tests
  describe('constructor', () => {
    it('should create instance with valid parameters', () => {
      expect(instance).toBeInstanceOf(ClassName);
    });

    it('should throw error with invalid parameters', () => {
      expect(() => new ClassName(null)).toThrow();
    });
  });

  // Method test grouping
  describe('methodName', () => {
    it('should handle normal case', () => {
      // Test normal scenarios
    });

    it('should handle edge cases', () => {
      // Test edge cases
    });

    it('should handle error cases', () => {
      // Test error scenarios
    });
  });

  // Integration tests
  describe('integration tests', () => {
    it('should work with dependent modules', () => {
      // Test module collaboration
    });
  });
});
```

---

## Vitest Global Configuration Example

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    alias: {
      // Automatically mock certain packages in test environment, pointing to __mocks__ directory
      '@qlover/fe-corekit': resolve(__dirname, 'packages/fe-corekit/__mocks__'),
      '@qlover/logger': resolve(__dirname, 'packages/logger/__mocks__')
    }
  }
});
```

### Package-level Scripts

```jsonc
// packages/xxx/package.json (example)
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Test Strategy

### Test Grouping

The entire file is a test file, with test content organized into groups. For example, describe represents a group of tests. Typically, a test file has only one root describe.

The content is tested from "small to large." For example, if the source file contains a class, the tests are grouped by the constructor parameters, the constructor itself, and each member method.

- From covering various parameter types for each method to the overall flow affected by method calls.
- As well as comprehensive flow testing and boundary testing.

Source file (TestClass.ts):

```ts
type TestClassOptions = {
  name: string;
};

class TestClass {
  constructor(options: TestClassOptions) {}

  getName(): string {
    return this.options.name;
  }

  setName(name: string): void {
    this.options.name = name;
  }
}
```

Test file (TestClass.test.ts):

```ts
describe('TestClass', () => {
  describe('TestClass.constructor', () => {
    // ...
  });
  describe('TestClass.getName', () => {
    // ...
  });

  describe('Overall flow or boundary testing', () => {
    it('should keep getName consistent after modifying the name', () => {
      const testClass = new TestClass({ name: 'test' });
      testClass.setName('test2');
      expect(testClass.getName()).toBe('test2');
    });
  });
});
```

### Test Case Naming Conventions

```typescript
describe('ClassName', () => {
  describe('methodName', () => {
    // Positive test cases
    it('should return expected result when given valid input', () => {});
    it('should handle multiple parameters correctly', () => {});

    // Boundary test cases
    it('should handle empty input', () => {});
    it('should handle null/undefined input', () => {});
    it('should handle maximum/minimum values', () => {});

    // Error test cases
    it('should throw error when given invalid input', () => {});
    it('should handle network failure gracefully', () => {});

    // Behavioral test cases
    it('should call dependency method with correct parameters', () => {});
    it('should not call dependency when condition is false', () => {});
  });
});
```

### Function Testing

Function tests should cover the following aspects:

1. **Parameter Combination Testing**

```typescript
interface TestParams {
  key1?: string;
  key2?: number;
  key3?: boolean;
}

function testFunction({ key1, key2, key3 }: TestParams): string {
  // Implementation...
}

describe('testFunction', () => {
  describe('Parameter Combination Testing', () => {
    it('should handle case with all parameters present', () => {
      expect(testFunction({ key1: 'test', key2: 1, key3: true })).toBe(
        'expected result'
      );
    });

    it('should handle case with key1, key2 only', () => {
      expect(testFunction({ key1: 'test', key2: 1 })).toBe('expected result');
    });

    it('should handle case with key1, key3 only', () => {
      expect(testFunction({ key1: 'test', key3: true })).toBe(
        'expected result'
      );
    });

    it('should handle case with key2, key3 only', () => {
      expect(testFunction({ key2: 1, key3: true })).toBe('expected result');
    });

    it('should handle case with key1 only', () => {
      expect(testFunction({ key1: 'test' })).toBe('expected result');
    });

    it('should handle case with key2 only', () => {
      expect(testFunction({ key2: 1 })).toBe('expected result');
    });

    it('should handle case with key3 only', () => {
      expect(testFunction({ key3: true })).toBe('expected result');
    });

    it('should handle empty object case', () => {
      expect(testFunction({})).toBe('expected result');
    });
  });

  describe('Boundary Value Testing', () => {
    it('should handle extreme values', () => {
      expect(
        testFunction({
          key1: '', // Empty string
          key2: Number.MAX_SAFE_INTEGER, // Maximum safe integer
          key3: false
        })
      ).toBe('expected result');

      expect(
        testFunction({
          key1: 'a'.repeat(1000), // Very long string
          key2: Number.MIN_SAFE_INTEGER, // Minimum safe integer
          key3: true
        })
      ).toBe('expected result');
    });

    it('should handle special values', () => {
      expect(
        testFunction({
          key1: '   ', // All spaces string
          key2: 0, // Zero value
          key3: false
        })
      ).toBe('expected result');

      expect(
        testFunction({
          key1: null as any, // null value
          key2: NaN, // NaN value
          key3: undefined as any // undefined value
        })
      ).toBe('expected result');
    });

    it('should handle invalid values', () => {
      expect(() =>
        testFunction({
          key1: Symbol() as any, // Invalid type
          key2: {} as any, // Invalid type
          key3: 42 as any // Invalid type
        })
      ).toThrow();
    });
  });
});
```

This test suite demonstrates:

1. **Complete Parameter Combination Coverage**:
   - Tests all possible parameter combinations (2^n combinations, where n is the number of parameters)
   - Includes cases with all parameters present, partial parameters, and empty object

2. **Boundary Value Testing**:
   - Tests parameter limit values (maximum, minimum)
   - Tests special values (empty string, null, undefined, NaN)
   - Tests invalid values (type errors)

3. **Test Case Organization**:
   - Uses nested describe blocks to clearly organize test scenarios
   - Each test case has a clear description
   - Related test cases are grouped together

### Test Data Management

```typescript
describe('DataProcessor', () => {
  // Test data constants
  const VALID_DATA = {
    id: 1,
    name: 'test',
    items: ['a', 'b', 'c']
  };

  const INVALID_DATA = {
    id: null,
    name: '',
    items: []
  };

  // Test data factory functions
  const createTestUser = (overrides = {}) => ({
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    ...overrides
  });

  // Complex data structures
  const createComplexTestData = () => ({
    metadata: {
      version: '1.0.0',
      created: Date.now(),
      tags: ['test', 'data']
    },
    users: [
      createTestUser({ id: 1 }),
      createTestUser({ id: 2, name: 'Another User' })
    ]
  });
});
```

---

## Mock Strategy

### 1. Global Mock Directory

Each package can expose a subdirectory with the same name, providing persistent mocks for automatic use by other packages during testing.

```typescript
// packages/fe-corekit/__mocks__/index.ts
import { vi } from 'vitest';

export const MyUtility = {
  doSomething: vi.fn(() => 'mocked'),
  processData: vi.fn((input: string) => `processed-${input}`)
};
export default MyUtility;
```

### 2. File-level Mock

```typescript
// At the top of test file
vi.mock('../src/Util', () => ({
  Util: {
    ensureDir: vi.fn(),
    readFile: vi.fn()
  }
}));

vi.mock('js-cookie', () => {
  let store: Record<string, string> = {};

  const get = vi.fn((key?: string) => {
    if (typeof key === 'string') return store[key];
    return { ...store };
  });

  const set = vi.fn((key: string, value: string) => {
    store[key] = value;
  });

  const remove = vi.fn((key: string) => {
    delete store[key];
  });

  const __resetStore = () => {
    store = {};
  };

  return {
    default: { get, set, remove, __resetStore }
  };
});
```

### 3. Dynamic Mock

```typescript
describe('ServiceClass', () => {
  it('should handle API failure', async () => {
    // Temporarily mock API call failure
    vi.spyOn(apiClient, 'request').mockRejectedValue(
      new Error('Network error')
    );

    await expect(service.fetchData()).rejects.toThrow('Network error');

    // Restore original implementation
    vi.restoreAllMocks();
  });
});
```

### 4. Mock Class Instances

```typescript
class MockStorage<Key = string> implements SyncStorageInterface<Key> {
  public data = new Map<string, string>();
  public calls: {
    setItem: Array<{ key: Key; value: unknown; options?: unknown }>;
    getItem: Array<{ key: Key; defaultValue?: unknown; options?: unknown }>;
    removeItem: Array<{ key: Key; options?: unknown }>;
    clear: number;
  } = {
    setItem: [],
    getItem: [],
    removeItem: [],
    clear: 0
  };

  setItem<T>(key: Key, value: T, options?: unknown): void {
    this.calls.setItem.push({ key, value, options });
    this.data.set(String(key), String(value));
  }

  getItem<T>(key: Key, defaultValue?: T, options?: unknown): T | null {
    this.calls.getItem.push({ key, defaultValue, options });
    const value = this.data.get(String(key));
    return (value ?? defaultValue ?? null) as T | null;
  }

  reset(): void {
    this.data.clear();
    this.calls = {
      setItem: [],
      getItem: [],
      removeItem: [],
      clear: 0
    };
  }
}
```

---

## Test Environment Management

### Lifecycle Hooks

```typescript
describe('ComponentTest', () => {
  let component: Component;
  let mockDependency: MockDependency;

  beforeAll(() => {
    // One-time setup before entire test suite
    setupGlobalTestEnvironment();
  });

  afterAll(() => {
    // One-time cleanup after entire test suite
    cleanupGlobalTestEnvironment();
  });

  beforeEach(() => {
    // Setup before each test case
    vi.useFakeTimers();
    mockDependency = new MockDependency();
    component = new Component(mockDependency);
  });

  afterEach(() => {
    // Cleanup after each test case
    vi.useRealTimers();
    vi.clearAllMocks();
    mockDependency.reset();
  });
});
```

### File System Testing

```typescript
describe('FileProcessor', () => {
  const testDir = './test-files';
  const testFilePath = path.join(testDir, 'test.json');

  beforeAll(() => {
    // Create test directories and files
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    fs.writeFileSync(testFilePath, JSON.stringify({ test: 'data' }));
  });

  afterAll(() => {
    // Clean up test files
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should process file correctly', () => {
    const processor = new FileProcessor();
    const result = processor.processFile(testFilePath);
    expect(result).toEqual({ test: 'data' });
  });
});
```

---

## Boundary Testing and Error Handling

### Boundary Value Testing

```typescript
describe('ValidationUtils', () => {
  describe('validateAge', () => {
    it('should handle boundary values', () => {
      // Boundary value testing
      expect(validateAge(0)).toBe(true); // Minimum value
      expect(validateAge(150)).toBe(true); // Maximum value
      expect(validateAge(-1)).toBe(false); // Below minimum
      expect(validateAge(151)).toBe(false); // Above maximum
    });

    it('should handle edge cases', () => {
      // Edge case testing
      expect(validateAge(null)).toBe(false);
      expect(validateAge(undefined)).toBe(false);
      expect(validateAge(NaN)).toBe(false);
      expect(validateAge(Infinity)).toBe(false);
    });
  });
});
```

### Async Operation Testing

```typescript
describe('AsyncService', () => {
  it('should handle successful async operation', async () => {
    const service = new AsyncService();
    const result = await service.fetchData();
    expect(result).toBeDefined();
  });

  it('should handle async operation failure', async () => {
    const service = new AsyncService();
    vi.spyOn(service, 'apiCall').mockRejectedValue(new Error('API Error'));

    await expect(service.fetchData()).rejects.toThrow('API Error');
  });

  it('should handle timeout', async () => {
    vi.useFakeTimers();
    const service = new AsyncService();

    const promise = service.fetchDataWithTimeout(1000);
    vi.advanceTimersByTime(1001);

    await expect(promise).rejects.toThrow('Timeout');
    vi.useRealTimers();
  });
});
```

### Type Safety Testing

```typescript
describe('TypeSafetyTests', () => {
  it('should maintain type safety', () => {
    const processor = new DataProcessor<User>();

    // Use expectTypeOf for type checking
    expectTypeOf(processor.process).parameter(0).toEqualTypeOf<User>();
    expectTypeOf(processor.process).returns.toEqualTypeOf<ProcessedUser>();
  });
});
```

---

## Performance Testing

```typescript
describe('PerformanceTests', () => {
  it('should complete operation within time limit', async () => {
    const startTime = Date.now();
    const processor = new DataProcessor();

    await processor.processLargeDataset(largeDataset);

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });
});
```

---

## Running Tests

```bash
# Run all package tests
pnpm test

# Run tests for specific package only
pnpm --filter @qlover/fe-corekit test

# Watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

In CI, you can leverage GitHub Actions:

```yaml
# .github/workflows/test.yml (truncated)
- run: pnpm install
- run: pnpm test:coverage
- uses: codecov/codecov-action@v3
```

---

## Coverage Targets

| Metric     | Target |
| ---------- | ------ |
| Statements | ≥ 80%  |
| Branches   | ≥ 75%  |
| Functions  | ≥ 85%  |
| Lines      | ≥ 80%  |

Coverage reports are output to the `coverage/` directory by default, with `index.html` available for local browsing.

---

## Debugging

### VS Code Launch Configuration

```jsonc
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Vitest",
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

> You can use `console.log` / `debugger` in test code to assist with troubleshooting.

---

## Frequently Asked Questions (FAQ)

### Q1: How to Mock Browser APIs?

Use `vi.mock()` or globally override in `setupFiles`, for example:

```typescript
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 16);
```

### Q2: What to do when tests are slow?

- Use `vi.useFakeTimers()` to accelerate time-related logic.
- Break down long integration processes into independent unit tests.

### Q3: How to test TypeScript types?

Use `expectTypeOf`:

```typescript
import { expectTypeOf } from 'vitest';

expectTypeOf(MyUtility.doSomething).returns.toEqualTypeOf<string>();
```

### Q4: How to test private methods?

```typescript
// Access private methods through type assertion
it('should test private method', () => {
  const instance = new MyClass();
  const result = (instance as any).privateMethod();
  expect(result).toBe('expected');
});
```

### Q5: How to handle dependency injection testing?

```typescript
describe('ServiceWithDependencies', () => {
  let mockRepository: MockRepository;
  let service: UserService;

  beforeEach(() => {
    mockRepository = new MockRepository();
    service = new UserService(mockRepository);
  });

  it('should use injected dependency', () => {
    service.getUser(1);
    expect(mockRepository.findById).toHaveBeenCalledWith(1);
  });
});
```
