# 测试指南

> 本文档简要介绍 **fe-base** 项目在 monorepo 场景下的测试策略与最佳实践，使用 [Vitest](https://vitest.dev/) 作为统一测试框架。

---

## 为何选择 Vitest

1. **与 Vite 生态完美集成**：共享 Vite 配置，TypeScript & ESM 开箱即用。
2. **现代特性**：并行执行、HMR、内置覆盖率统计。
3. **Jest 兼容 API**：`describe / it / expect` 等 API 无学习成本。
4. **Monorepo 友好**：可按 workspace 过滤执行，易于在 CI 中并行跑包级测试。

---

## 测试类型

- **单元测试 (Unit)**：验证函数、类或组件的最小行为。
- **集成测试 (Integration)**：验证多个模块的协作与边界。
- **端到端 (E2E，视需要引入 Playwright/Cypress)**：验证完整用户流程。

> ⚡️ 在绝大多数情况下，优先编写单元测试；仅在跨模块交互复杂时再补充集成测试。

---

## Vitest 全局配置示例

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
      // 在测试环境下自动 Mock 某些包，指向 __mocks__ 目录
      '@qlover/fe-corekit': resolve(__dirname, 'packages/fe-corekit/__mocks__'),
      '@qlover/logger': resolve(__dirname, 'packages/logger/__mocks__')
    }
  }
});
```

### 包级脚本

```jsonc
// packages/xxx/package.json (示例)
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## 测试策略

### 测试分组

整个文件为一个测试文件, 测试内容以分组为单位，比如describe为一组测试，一般一个测试文件根只有一个describe

内容按照从"小到大测试", 比如: 源文件中是 class 那么从构造器传递参数，构造器，每个成员方法为分组进行测试

- 小到每个方法传递各种参数类型的覆盖，大到调用方法时影响的整体流程
- 以及整体的流程测试，边界测试

源文件(TestClass.ts):

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

测试文件(TestClass.test.ts):

```ts
describe('TestClass', () => {
  describe('TestClass.constructor', () => {
    // ...
  });
  describe('TestClass.getName', () => {
    // ...
  });

  describe('整体流程或边界测试', () => {
    it('应该在修改name后，getName保持一致', () => {
      const testClass = new TestClass({ name: 'test' });
      testClass.setName('test2');
      expect(testClass.getName()).toBe('test2');
    });
  });
});
```

---

## Mock 策略

1. \***\*mocks** 目录\*\*：每个包可暴露同名子目录，提供持久 Mock，供其他包在测试时自动使用。
2. **vi.mock()**：在单个测试文件内动态替换模块，适用于临时行为差异。

示例：在 `packages/fe-corekit/__mocks__/index.ts` 中暴露与真实实现相同的 API，并使用 `vi.fn()` 生成可断言函数。

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

## 运行测试

```bash
# 运行所有包测试
pnpm test

# 仅运行指定包
pnpm --filter @qlover/fe-corekit test

# 监听模式
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage
```

在 CI 中，可借助 GitHub Actions：

```yaml
# .github/workflows/test.yml (截断)
- run: pnpm install
- run: pnpm test:coverage
- uses: codecov/codecov-action@v3
```

---

## 覆盖率目标

| 指标 | 目标  |
| ---- | ----- |
| 语句 | ≥ 80% |
| 分支 | ≥ 75% |
| 函数 | ≥ 85% |
| 行数 | ≥ 80% |

覆盖率报告默认输出至 `coverage/` 目录，`index.html` 可本地浏览。

---

## 调试

### VS Code Launch 配置

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

> 在测试代码中可使用 `console.log` / `debugger` 辅助排查。

---

## 常见问题解答 (FAQ)

### Q1 : 如何 Mock 浏览器 API？

使用 `vi.mock()` 或在 `setupFiles` 中全局覆写，例如：

```typescript
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 16);
```

### Q2 : 测试过慢怎么办？

- 使用 `vi.useFakeTimers()` 加速时间相关逻辑。
- 拆分长时间集成流程为独立单元测试。

### Q3 : 如何测试 TypeScript 类型？

利用 `expectTypeOf`：

```typescript
import { expectTypeOf } from 'vitest';

expectTypeOf(MyUtility.doSomething).returns.toEqualTypeOf<string>();
```

---

## 🌐 其他语言版本

- **[🇺🇸 English](../en/testing-guide.md)**
- **[🏠 返回首页](./index.md)**
