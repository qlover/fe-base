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

## Mock Strategy

1. ****mocks** Directory**: Each package can expose a subdirectory with the same name, providing persistent mocks for automatic use by other packages during testing.
2. **vi.mock()**: Dynamically replace modules within a single test file, suitable for temporary behavioral differences.

Example: In `packages/fe-corekit/__mocks__/index.ts`, expose the same API as the real implementation and use `vi.fn()` to generate assertable functions.

```typescript
// packages/fe-corekit/__mocks__/index.ts
import { vi } from 'vitest';

export const MyUtility = {
  doSomething: vi.fn(() => 'mocked'),
  processData: vi.fn((input: string) => `processed-${input}`)
};
export default MyUtility;
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

---

## 🌐 Other Language Versions

- **[🇨🇳 中文](../zh/testing-guide.md)**
- **[🏠 Back to Home](./index.md)**
