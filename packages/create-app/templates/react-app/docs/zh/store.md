# Store 状态管理

## 核心思想

Store 的设计理念基于以下几个核心思想：

1. **逻辑与 UI 分离**
   - 业务逻辑集中在 Store 中管理
   - UI 组件只负责渲染和用户交互
   - 通过 IOC 容器实现逻辑的依赖注入

2. **响应式数据流**
   - 基于发布订阅模式
   - 状态变更自动触发 UI 更新
   - 精确的组件重渲染控制

3. **状态分片管理**
   - 将复杂状态分解为独立的分片
   - 每个分片负责特定的业务领域
   - 分片之间可以组合和通信

## 工作原理

### 1. 状态订阅机制

```typescript
// Store 内部实现了发布订阅机制
class SliceStore<T> {
  private listeners = new Set<(state: T) => void>();

  // 发布状态更新
  protected emit(newState: T) {
    this.state = newState;
    this.listeners.forEach((listener) => listener(this.state));
  }

  // 订阅状态变化
  subscribe(listener: (state: T) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
```

### 2. 状态更新流程

```
用户操作 → 调用 Store 方法 → 更新状态 → 通知订阅者 → UI 更新
```

1. 用户触发操作（如点击按钮）
2. 调用 Store 中的方法
3. Store 使用 emit 发布新状态
4. 订阅该状态的组件收到通知
5. 组件重新渲染，显示最新状态

### 3. 组件集成

```tsx
// 在组件中使用 Store
function UserProfile() {
  // useStore hook 自动处理订阅和取消订阅
  const user = useStore(IOC(UserService), (state) => state.userInfo);

  return <div>{user.name}</div>;
}
```

### 4. 状态分片示例

```typescript
// 用户认证分片
class AuthStore extends StoreInterface<AuthState> {
  constructor() {
    super(() => ({
      isLoggedIn: false,
      user: null
    }));
  }

  login(credentials: Credentials) {
    // 处理登录逻辑
    this.emit({
      isLoggedIn: true,
      user: userData
    });
  }
}

// 主题设置分片
class ThemeStore extends StoreInterface<ThemeState> {
  constructor() {
    super(() => ({
      mode: 'light',
      colors: defaultColors
    }));
  }

  toggleTheme() {
    const mode = this.state.mode === 'light' ? 'dark' : 'light';
    this.emit({
      ...this.state,
      mode
    });
  }
}
```

## 概述

Store 是应用的状态管理解决方案，基于 `@qlover/slice-store-react` 实现。它采用分片（Slice）的方式来管理状态，具有以下特点：

- **类型安全**：基于 TypeScript，提供完整的类型推导
- **轻量级**：无需复杂的配置，易于使用
- **高性能**：精确的组件更新，避免不必要的渲染
- **模块化**：支持状态分片，便于管理大型应用
- **IOC 集成**：与依赖注入系统完美配合

## 核心概念

### 1. Store 接口

Store 系统基于两个核心接口：

#### StoreStateInterface

```typescript
/**
 * Store 状态接口
 *
 * 作用：定义 store 状态对象的契约
 * 核心思想：为 store 状态强制实施一致的结构
 * 主要功能：作为所有 store 状态类型的基础
 * 主要目的：确保状态类型安全和可扩展性
 */
interface StoreStateInterface {
  // 可以在这里定义自己的属性
  // ...
}
```

#### StoreInterface

```typescript
/**
 * Store 接口
 *
 * 作用：所有状态存储的抽象基类
 * 核心思想：提供统一的状态管理 API，包含重置和克隆辅助方法
 * 主要功能：扩展 SliceStore，添加 resetState 和 cloneState 工具方法
 * 主要目的：简化 store 实现并确保一致性
 */
abstract class StoreInterface<
  T extends StoreStateInterface
> extends SliceStore<T> {
  constructor(protected stateFactory: () => T) {
    super(stateFactory);
  }

  // 重置 store 状态
  resetState(): void {
    this.emit(this.stateFactory());
  }

  // 克隆 store 状态
  cloneState(source?: Partial<T>): T {
    const cloned = clone(this.state);
    if (typeof cloned === 'object' && cloned !== null) {
      Object.assign(cloned, source);
    }
    return cloned;
  }
}
```

### 2. 状态分片

状态分片（Slice）是将应用状态分割成独立的部分：

```typescript
// 用户状态分片示例
class UserState implements StoreStateInterface {
  isLoggedIn: boolean = false;
  userInfo: {
    name: string;
    role: string;
  } | null = null;
}

// Store 实现示例
export class UserStore extends StoreInterface<UserState> {
  constructor() {
    super(() => new UserState());
  }
}
```

## 在项目中使用

### 1. 创建 Store Controller

```typescript
import { StoreInterface, StoreStateInterface } from '@qlover/corekit-bridge';

interface ExecutorState extends StoreStateInterface {
  helloState: string;
  tasks: Task[];
}

@injectable()
export class ExecutorController extends StoreInterface<ExecutorState> {
  constructor() {
    super(() => ({
      helloState: '',
      tasks: []
    }));
  }

  // 选择器
  selector = {
    helloState: (state: ExecutorState) => state.helloState,
    tasks: (state: ExecutorState) => state.tasks
  };
}
```

### 2. 在组件中使用

使用 `useStore` Hook 访问状态：

```tsx
function MyComponent() {
  // 获取完整状态
  const state = useStore(IOC(ExecutorController));

  // 使用选择器获取特定状态
  const helloState = useStore(
    IOC(ExecutorController),
    (controller) => controller.selector.helloState
  );

  return (
    <div>
      <h1>{helloState}</h1>
    </div>
  );
}
```

### 3. 更新状态

通过 controller 方法更新状态：

```typescript
@injectable()
class ExecutorController extends StoreInterface<ExecutorState> {
  // ... 构造函数等其他代码

  updateHelloState(newState: string) {
    this.emit({ ...this.state, helloState: newState });
  }

  async fetchTasks() {
    const tasks = await api.getTasks();
    this.emit({ ...this.state, tasks });
  }

  // 使用 cloneState 进行状态更新
  updateWithClone(newState: Partial<ExecutorState>) {
    this.emit(this.cloneState(newState));
  }
}
```

## 最佳实践

1. **状态组织**
   - 按功能模块划分状态
   - 避免状态冗余
   - 保持状态扁平化

2. **性能优化**
   - 使用选择器获取状态，避免不必要的重渲染
   - 合理拆分组件，避免大组件订阅过多状态
   - 使用 `cloneState` 方法确保状态更新的不可变性

3. **类型安全**
   - 为所有状态定义接口
   - 使用 TypeScript 的类型推导
   - 避免使用 any 类型

4. **与启动器集成**
   - 在 Bootstrap 阶段初始化 store
   - 通过 IOC 容器管理 store 实例
   - 使用插件系统扩展功能

## 常见问题

### 1. 状态更新不生效

检查以下几点：

- 确保正确使用 `emit` 方法更新状态
- 使用 `cloneState` 方法确保状态不可变性
- 检查组件是否正确订阅了状态

### 2. 组件重复渲染

可能的解决方案：

- 使用选择器只订阅需要的状态
- 检查依赖项是否正确设置
- 考虑使用 React.memo 优化组件

### 3. TypeScript 类型报错

常见解决方法：

- 确保正确继承 StoreInterface
- 检查泛型参数是否正确
- 确保状态类型实现了 StoreStateInterface
