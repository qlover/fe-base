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

## 测试文件组织规范

### 文件命名与位置

```
packages/
├── package-name/
│   ├── __tests__/           # 测试文件目录
│   │   ├── Class.test.ts    # 类测试
│   │   ├── utils/           # 工具函数测试
│   │   │   └── helper.test.ts
│   │   └── integration/     # 集成测试
│   ├── __mocks__/           # Mock 文件目录
│   │   └── index.ts
│   └── src/                 # 源代码目录
```

### 测试文件结构

```typescript
// 标准测试文件头部注释
/**
 * ClassName test-suite
 *
 * Coverage:
 * 1. constructor       – 构造函数测试
 * 2. methodName        – 方法功能测试
 * 3. edge cases        – 边界情况测试
 * 4. error handling    – 错误处理测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ClassName } from '../src/ClassName';

describe('ClassName', () => {
  // 测试数据和Mock对象
  let instance: ClassName;
  let mockDependency: MockType;

  // 设置和清理
  beforeEach(() => {
    // 初始化测试环境
    mockDependency = createMockDependency();
    instance = new ClassName(mockDependency);
  });

  afterEach(() => {
    // 清理测试环境
    vi.clearAllMocks();
  });

  // 构造函数测试
  describe('constructor', () => {
    it('should create instance with valid parameters', () => {
      expect(instance).toBeInstanceOf(ClassName);
    });

    it('should throw error with invalid parameters', () => {
      expect(() => new ClassName(null)).toThrow();
    });
  });

  // 方法测试分组
  describe('methodName', () => {
    it('should handle normal case', () => {
      // 测试正常情况
    });

    it('should handle edge cases', () => {
      // 测试边界情况
    });

    it('should handle error cases', () => {
      // 测试错误情况
    });
  });

  // 集成测试
  describe('integration tests', () => {
    it('should work with dependent modules', () => {
      // 测试模块间协作
    });
  });
});
```

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

### 测试用例命名规范

```typescript
describe('ClassName', () => {
  describe('methodName', () => {
    // 正面测试用例
    it('should return expected result when given valid input', () => {});
    it('should handle multiple parameters correctly', () => {});

    // 边界测试用例
    it('should handle empty input', () => {});
    it('should handle null/undefined input', () => {});
    it('should handle maximum/minimum values', () => {});

    // 错误测试用例
    it('should throw error when given invalid input', () => {});
    it('should handle network failure gracefully', () => {});

    // 行为测试用例
    it('should call dependency method with correct parameters', () => {});
    it('should not call dependency when condition is false', () => {});
  });
});
```

### 测试数据管理

```typescript
describe('DataProcessor', () => {
  // 测试数据常量
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

  // 测试数据工厂函数
  const createTestUser = (overrides = {}) => ({
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    ...overrides
  });

  // 复杂数据结构
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

## Mock 策略

### 1. 全局 Mock 目录

每个包可暴露同名子目录，提供持久 Mock，供其他包在测试时自动使用。

```typescript
// packages/fe-corekit/__mocks__/index.ts
import { vi } from 'vitest';

export const MyUtility = {
  doSomething: vi.fn(() => 'mocked'),
  processData: vi.fn((input: string) => `processed-${input}`)
};
export default MyUtility;
```

### 2. 文件级 Mock

```typescript
// 在测试文件顶部
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

### 3. 动态 Mock

```typescript
describe('ServiceClass', () => {
  it('should handle API failure', async () => {
    // 临时 Mock API 调用失败
    vi.spyOn(apiClient, 'request').mockRejectedValue(
      new Error('Network error')
    );

    await expect(service.fetchData()).rejects.toThrow('Network error');

    // 恢复原始实现
    vi.restoreAllMocks();
  });
});
```

### 4. Mock 类实例

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

## 测试环境管理

### 生命周期钩子

```typescript
describe('ComponentTest', () => {
  let component: Component;
  let mockDependency: MockDependency;

  beforeAll(() => {
    // 整个测试套件运行前的一次性设置
    setupGlobalTestEnvironment();
  });

  afterAll(() => {
    // 整个测试套件运行后的一次性清理
    cleanupGlobalTestEnvironment();
  });

  beforeEach(() => {
    // 每个测试用例前的设置
    vi.useFakeTimers();
    mockDependency = new MockDependency();
    component = new Component(mockDependency);
  });

  afterEach(() => {
    // 每个测试用例后的清理
    vi.useRealTimers();
    vi.clearAllMocks();
    mockDependency.reset();
  });
});
```

### 文件系统测试

```typescript
describe('FileProcessor', () => {
  const testDir = './test-files';
  const testFilePath = path.join(testDir, 'test.json');

  beforeAll(() => {
    // 创建测试目录和文件
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    fs.writeFileSync(testFilePath, JSON.stringify({ test: 'data' }));
  });

  afterAll(() => {
    // 清理测试文件
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

## 边界测试与错误处理

### 边界值测试

```typescript
describe('ValidationUtils', () => {
  describe('validateAge', () => {
    it('should handle boundary values', () => {
      // 边界值测试
      expect(validateAge(0)).toBe(true); // 最小值
      expect(validateAge(150)).toBe(true); // 最大值
      expect(validateAge(-1)).toBe(false); // 小于最小值
      expect(validateAge(151)).toBe(false); // 大于最大值
    });

    it('should handle edge cases', () => {
      // 边界情况测试
      expect(validateAge(null)).toBe(false);
      expect(validateAge(undefined)).toBe(false);
      expect(validateAge(NaN)).toBe(false);
      expect(validateAge(Infinity)).toBe(false);
    });
  });
});
```

### 异步操作测试

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

### 类型安全测试

```typescript
describe('TypeSafetyTests', () => {
  it('should maintain type safety', () => {
    const processor = new DataProcessor<User>();

    // 使用 expectTypeOf 进行类型检查
    expectTypeOf(processor.process).parameter(0).toEqualTypeOf<User>();
    expectTypeOf(processor.process).returns.toEqualTypeOf<ProcessedUser>();
  });
});
```

---

## 性能测试

```typescript
describe('PerformanceTests', () => {
  it('should complete operation within time limit', async () => {
    const startTime = Date.now();
    const processor = new DataProcessor();

    await processor.processLargeDataset(largeDataset);

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(1000); // 应在1秒内完成
  });
});
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

### Q4 : 如何测试私有方法？

```typescript
// 通过类型断言访问私有方法
it('should test private method', () => {
  const instance = new MyClass();
  const result = (instance as any).privateMethod();
  expect(result).toBe('expected');
});
```

### Q5 : 如何处理依赖注入的测试？

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

---

## 🌐 其他语言版本

- **[🇺🇸 English](../en/testing-guide.md)**
- **[🏠 返回首页](./index.md)**
