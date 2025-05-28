# 测试指南

本文档详细介绍 fe-base 项目的测试策略、配置和最佳实践。

## 测试框架选择

### 为什么选择 Vitest？

我们选择 [Vitest](https://vitest.dev/) 作为主要测试框架，原因如下：

#### 1. **与 Vite 生态完美集成**
- 共享 Vite 的配置，无需额外配置
- 支持 TypeScript、ESM 开箱即用
- 热重载测试，开发体验极佳

#### 2. **现代化特性**
- 原生 ES 模块支持
- TypeScript 零配置
- 并行测试执行，速度更快
- 内置代码覆盖率报告

#### 3. **Jest 兼容的 API**
- 熟悉的 `describe`、`it`、`expect` API
- 丰富的断言库
- Mock 功能完善

#### 4. **monorepo 友好**
- 支持 workspace 模式
- 可以针对特定包运行测试
- 依赖关系自动处理

## 测试类型

### 单元测试 (Unit Tests)
测试单个函数、类或组件的功能。

```typescript
// packages/element-sizer/src/__tests__/element-sizer.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ElementResizer } from '../element-sizer';

describe('ElementResizer', () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    // 创建模拟 DOM 元素
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

### 集成测试 (Integration Tests)
测试多个模块之间的交互。

```typescript
// packages/element-sizer/src/__tests__/integration.test.ts
import { describe, it, expect } from 'vitest';
import { ElementResizer } from '../element-sizer';

describe('ElementResizer Integration', () => {
  it('should work with real DOM elements', () => {
    // 创建完整的 DOM 结构
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

    // 测试完整的展开/折叠流程
    resizer.expand();
    expect(container.classList.contains('expanded')).toBe(true);
  });
});
```

## 测试配置

### Vitest 配置文件

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
      // Mock 配置
      '@qlover/fe-corekit': resolve(__dirname, 'packages/fe-corekit/__mocks__'),
      '@qlover/logger': resolve(__dirname, 'packages/logger/__mocks__'),
      // '@qlover/fe-scripts': resolve(__dirname, 'packages/fe-scripts/__mocks__'),
      // '@qlover/code2markdown': resolve(__dirname, 'packages/code2markdown/__mocks__'),
    }
  }
});
```

### 包级别配置

每个包可以有自己的测试配置：

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

### __mocks__ 目录配置

为了解决 monorepo 中包间依赖的测试问题，我们使用 `__mocks__` 目录提供 Mock 入口。

#### 目录结构

```
packages/element-sizer/
├── src/
│   ├── __tests__/           # 测试目录
│   │   ├── unit/           # 单元测试
│   │   ├── integration/    # 集成测试
│   │   └── fixtures/       # 测试数据
│   ├── element-sizer.ts
│   └── index.ts
├── __mocks__/               # Mock 入口目录 (用于其他包测试时的依赖 Mock)
│   ├── index.ts            # 主 Mock 入口
│   ├── element-resizer.ts  # 详细 Mock 实现
│   └── utils.ts            # 工具函数 Mock
├── dist/                   # 构建产物
└── package.json
```

#### Mock 入口文件示例

```typescript
// packages/element-sizer/__mocks__/index.ts
import { vi } from 'vitest';

// 创建 ElementResizer 的 Mock 类
export class ElementResizer {
  target: HTMLElement;
  animationState: string = 'idle';
  isAnimating: boolean = false;

  constructor(options: { target: HTMLElement }) {
    this.target = options.target;
  }

  expand = vi.fn(() => {
    this.animationState = 'expanding';
    // 模拟异步操作
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

// 默认导出
export default ElementResizer;

// 其他可能的导出
export const createElementResizer = vi.fn((options) => new ElementResizer(options));
export const utils = {
  calculateSize: vi.fn(),
  animateElement: vi.fn()
};
```

#### 在其他包中使用 Mock

假设我们有一个新的包 `package-a` 需要依赖 `element-sizer`：

```typescript
// packages/package-a/src/__tests__/component.test.ts
import { describe, it, expect, vi } from 'vitest';
import { ElementResizer } from '@qlover/element-sizer'; // 自动指向 Mock
import { MyComponent } from '../component';

describe('MyComponent', () => {
  it('should use ElementResizer correctly', () => {
    const mockElement = document.createElement('div');
    const component = new MyComponent(mockElement);
    
    // 由于使用了 Mock，这里的 ElementResizer 是被 Mock 的版本
    expect(ElementResizer).toHaveBeenCalled();
    
    component.expand();
    expect(ElementResizer.prototype.expand).toHaveBeenCalled();
  });
});
```

#### 高级 Mock 配置

对于更复杂的 Mock 需求，可以创建多个 Mock 文件：

```
packages/element-sizer/__mocks__/
├── index.ts                 # 主 Mock 入口
├── element-resizer.ts       # ElementResizer 类的详细 Mock
├── utils.ts                 # 工具函数的 Mock
└── types.ts                 # 类型定义的 Mock
```

```typescript
// packages/element-sizer/__mocks__/element-resizer.ts
import { vi } from 'vitest';

export class ElementResizer {
  // 详细的 Mock 实现
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

#### 条件 Mock

有时你可能需要在不同的测试中使用不同的 Mock 行为：

```typescript
// packages/package-a/src/__tests__/advanced.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 动态导入以便重新 Mock
const mockElementResizer = vi.hoisted(() => ({
  ElementResizer: vi.fn()
}));

vi.mock('@qlover/element-sizer', () => mockElementResizer);

describe('Advanced Mock Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle success case', () => {
    // 配置成功的 Mock 行为
    mockElementResizer.ElementResizer.mockImplementation(() => ({
      expand: vi.fn().mockResolvedValue(true),
      animationState: 'expanded'
    }));
    
    // 测试代码...
  });

  it('should handle error case', () => {
    // 配置失败的 Mock 行为
    mockElementResizer.ElementResizer.mockImplementation(() => ({
      expand: vi.fn().mockRejectedValue(new Error('Animation failed')),
      animationState: 'error'
    }));
    
    // 测试代码...
  });
});
```

## 测试最佳实践

### 1. 测试文件组织

```
packages/element-sizer/
├── src/
│   ├── __tests__/           # 测试目录
│   │   ├── unit/           # 单元测试
│   │   ├── integration/    # 集成测试
│   │   └── fixtures/       # 测试数据
│   ├── element-sizer.ts
│   └── index.ts
├── __mocks__/               # Mock 入口目录 (用于其他包测试时的依赖 Mock)
│   ├── index.ts            # 主 Mock 入口
│   ├── element-resizer.ts  # 详细 Mock 实现
│   └── utils.ts            # 工具函数 Mock
├── dist/                   # 构建产物
└── package.json
```

### 2. 命名规范

- 测试文件：`*.test.ts` 或 `*.spec.ts`
- 测试描述：使用清晰的英文描述
- 测试用例：遵循 "should + 动作 + 期望结果" 格式
- Mock 文件：与原文件同名，放在 `__mocks__` 目录下

### 3. Mock 策略

#### 浏览器 API Mock

```typescript
// Mock DOM API
vi.mock('window', () => ({
  requestAnimationFrame: vi.fn((cb) => setTimeout(cb, 16)),
  cancelAnimationFrame: vi.fn()
}));

// Mock 第三方库
vi.mock('some-library', () => ({
  default: vi.fn(),
  namedExport: vi.fn()
}));
```

#### 包间依赖 Mock

通过 vitest 别名配置，自动将包依赖指向 `__mocks__` 目录：

```typescript
// 在测试中直接导入，会自动使用 Mock 版本
import { ElementResizer } from '@qlover/element-sizer';

// 这实际上导入的是 packages/element-sizer/__mocks__/index.ts
```

#### 创建包的 Mock 入口

每个包都应该提供 `__mocks__` 目录，方便其他包在测试时使用：

```typescript
// packages/element-sizer/__mocks__/index.ts
import { vi } from 'vitest';

export class ElementResizer {
  // Mock 实现，保持与真实 API 一致的接口
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

### 4. 异步测试

```typescript
it('should handle async operations', async () => {
  const resizer = new ElementResizer({ target: mockElement });
  
  // 使用 Promise
  await resizer.expand();
  expect(resizer.animationState).toBe('expanded');
  
  // 使用 waitFor
  await vi.waitFor(() => {
    expect(mockElement.style.height).toBe('auto');
  });
});
```

## 运行测试

### 基本命令

```bash
# 运行所有测试
pnpm test

# 运行特定包的测试
pnpm --filter @qlover/fe-corekit test

# 监听模式
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage
```

### CI/CD 中的测试

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

## 测试覆盖率

### 覆盖率目标

- **语句覆盖率**: >= 80%
- **分支覆盖率**: >= 75%
- **函数覆盖率**: >= 85%
- **行覆盖率**: >= 80%

### 查看覆盖率报告

```bash
# 生成覆盖率报告
pnpm test:coverage

# 在浏览器中查看详细报告
open coverage/index.html
```

## 调试测试

### VS Code 调试配置

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

### 调试技巧

```typescript
// 使用 console.log 调试
it('should debug test', () => {
  console.log('Debug info:', someVariable);
  expect(someVariable).toBe(expectedValue);
});

// 使用 debugger 断点
it('should use debugger', () => {
  debugger; // 在此处暂停
  expect(true).toBe(true);
});
```

## 常见问题

### Q: 如何测试 DOM 操作？
A: 使用 jsdom 环境，Vitest 会自动提供 DOM API。

### Q: 如何 Mock 浏览器 API？
A: 使用 `vi.mock()` 或在 `setupFiles` 中全局 Mock。

### Q: 测试运行缓慢怎么办？
A: 检查是否有不必要的异步操作，使用 `vi.useFakeTimers()` 加速时间相关测试。

### Q: 如何测试 TypeScript 类型？
A: 使用 `expectTypeOf` 或 `assertType` 进行类型测试。

```typescript
import { expectTypeOf } from 'vitest';

it('should have correct types', () => {
  expectTypeOf(resizer.target).toEqualTypeOf<HTMLElement>();
});
```

### Q: 如何在 monorepo 中测试包间依赖？
A: 使用 `__mocks__` 目录和 vitest 别名配置。在根目录的 `vitest.config.ts` 中配置别名，将包名指向对应的 `__mocks__` 目录。

### Q: __mocks__ 目录应该包含什么？
A: 
- `index.ts` - 主要的 Mock 导出，保持与真实包相同的 API 接口
- 具体的 Mock 实现文件，如 `element-resizer.ts`、`utils.ts` 等
- Mock 应该提供与真实实现相同的接口，但使用 `vi.fn()` 创建可控的函数

### Q: 如何更新 Mock 以保持与真实实现同步？
A: 
1. 在 CI/CD 中添加检查，确保 Mock 接口与真实接口一致
2. 使用 TypeScript 类型检查来验证 Mock 的正确性
3. 定期审查和更新 Mock 实现

### Q: 什么时候应该使用 vi.mock() 而不是 __mocks__ 目录？
A: 
- 使用 `__mocks__` 目录：包间依赖的持久 Mock，多个测试文件共享
- 使用 `vi.mock()`：特定测试的临时 Mock，需要不同行为的场景

```typescript
export default ElementResizer;
```

### 全局 Mock 配置

在 `vitest.config.ts` 中配置全局 Mock：

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
      // Mock 配置
      '@qlover/fe-corekit': resolve(__dirname, 'packages/fe-corekit/__mocks__'),
      '@qlover/logger': resolve(__dirname, 'packages/logger/__mocks__'),
      // '@qlover/fe-scripts': resolve(__dirname, 'packages/fe-scripts/__mocks__'),
      // '@qlover/code2markdown': resolve(__dirname, 'packages/code2markdown/__mocks__'),
    }
  }
});
```

#### 自动 Mock

```typescript
// 测试文件中自动使用 Mock
import { describe, it, expect } from 'vitest';
import { MyUtility } from '@qlover/fe-corekit'; // 自动指向 Mock

describe('MyComponent', () => {
  it('should use mocked utility', () => {
    const result = MyUtility.doSomething();
    expect(result).toBe('mocked result');
  });
});
```

#### 手动 Mock

```typescript
// 手动 Mock 特定模块
import { vi } from 'vitest';

const mockUtility = {
  doSomething: vi.fn(() => 'mocked result'),
  calculate: vi.fn((a: number, b: number) => a + b)
};

vi.mock('@qlover/fe-corekit', () => mockUtility);

// 测试代码
import { MyUtility } from '@qlover/fe-corekit';

describe('Manual Mock Test', () => {
  it('should use manual mock', () => {
    expect(MyUtility.doSomething()).toBe('mocked result');
    expect(mockUtility.doSomething).toHaveBeenCalled();
  });
});
```

#### 集成测试示例

```typescript
// packages/fe-corekit/__tests__/integration/index.test.ts
import { describe, it, expect } from 'vitest';
import { MyUtility } from '@qlover/fe-corekit';

describe('fe-corekit Integration Tests', () => {
  it('should work with real dependencies', () => {
    const result = MyUtility.processData('test input');
    expect(result).toContain('processed');
  });

  it('should handle edge cases', () => {
    expect(() => MyUtility.processData('')).not.toThrow();
  });
});