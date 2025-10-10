# 组件开发和状态管理指南

## 目录

1. [组件架构概述](#组件架构概述)
2. [组件架构和设计原则](#组件架构和设计原则)
3. [状态管理系统](#状态管理系统)
4. [组件通信和事件处理](#组件通信和事件处理)
5. [组件测试和性能优化](#组件测试和性能优化)
6. [最佳实践和示例](#最佳实践和示例)

## 组件架构概述

### 1. 整体架构

项目采用分层的组件架构设计：

```
组件层                      状态层
┌──────────────┐          ┌──────────────┐
│   UI 组件    │          │  状态接口    │
├──────────────┤          ├──────────────┤
│   容器组件   │    ◄─────┤  状态实现    │
├──────────────┤          ├──────────────┤
│   业务组件   │          │  状态动作    │
└──────────────┘          └──────────────┘
```

### 2. 核心概念

- **UI 组件**：纯展示组件，不包含业务逻辑
- **容器组件**：负责状态管理和业务逻辑
- **业务组件**：特定业务场景的组件
- **状态管理**：基于 Store 模式的状态管理系统

### 3. 技术栈

- **React + Next.js**：基础框架
- **TypeScript**：类型系统
- **Inversify**：依赖注入
- **Ant Design**：UI 组件库
- **Tailwind CSS**：样式系统

## 组件架构和设计原则

### 1. 组件分类

```typescript
// 1. UI 组件
export function Button({ onClick, children }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-primary text-white rounded"
    >
      {children}
    </button>
  );
}

// 2. 容器组件
export function UserProfileContainer() {
  const userStore = useIOC(UserStore);
  const user = useStore(userStore, userStore.selector.user);

  return <UserProfile user={user} />;
}

// 3. 业务组件
export function LoginForm({ tt }: { tt: LoginI18nInterface }) {
  const userService = useIOC(I.UserServiceInterface);

  const handleLogin = async (values: LoginFormData) => {
    await userService.login(values);
  };

  return (
    <Form onFinish={handleLogin}>
      {/* 表单内容 */}
    </Form>
  );
}
```

### 2. 组件提供者

```typescript
// 组合多个提供者
export function ComboProvider({
  themeConfig,
  children
}: Props) {
  const mounted = useMountedClient();
  const IOC = clientIOC.create();

  return (
    <AntdThemeProvider theme={themeConfig.antdTheme}>
      <ThemeProvider
        themes={themeConfig.supportedThemes}
        defaultTheme={themeConfig.defaultTheme}
      >
        <BootstrapsProvider>
          <AntdRegistry>
            {mounted ? children : null}
          </AntdRegistry>
        </BootstrapsProvider>
      </ThemeProvider>
    </AntdThemeProvider>
  );
}
```

### 3. 组件接口设计

```typescript
// 1. 组件接口定义
interface ChatComponentInterface {
  // 属性定义
  messages: MessageInterface[];
  loading?: boolean;

  // 事件处理
  onSend: (message: string) => void;
  onClear: () => void;
}

// 2. 组件实现
@injectable()
export class ChatComponent implements ChatComponentInterface {
  constructor(
    @inject(ChatStore) private store: ChatStoreInterface,
    @inject(I.Logger) private logger: LoggerInterface
  ) {}

  // 实现接口方法
  async onSend(message: string) {
    try {
      await this.store.sendMessage(message);
    } catch (error) {
      this.logger.error('Failed to send message:', error);
    }
  }
}
```

## 状态管理系统

### 1. 状态接口

```typescript
// 1. 状态接口定义
export interface StoreStateInterface {
  readonly loading?: boolean;
  readonly error?: Error | null;
}

// 2. 异步状态接口
export interface AsyncStateInterface<T> {
  loading: boolean;
  result: T | null;
  error: unknown | null;
  startTime: number;
  endTime: number;
}

// 3. 请求状态实现
export class RequestState<T = unknown> implements AsyncStateInterface<T> {
  startTime: number;
  endTime: number;

  constructor(
    public loading: boolean = false,
    public result: T | null = null,
    public error: unknown | null = null
  ) {
    this.startTime = Date.now();
    this.endTime = 0;
  }

  end(): this {
    this.endTime = Date.now();
    return this;
  }
}
```

### 2. Store 实现

```typescript
// 1. Store 基类
export abstract class StoreInterface<State extends StoreStateInterface> {
  protected state: State;
  protected subscribers: Set<(state: State) => void>;

  constructor(initialState: () => State) {
    this.state = initialState();
    this.subscribers = new Set();
  }

  // 状态更新
  protected emit(newState: State): void {
    this.state = newState;
    this.subscribers.forEach((subscriber) => subscriber(this.state));
  }

  // 选择器
  selector = {
    loading: (state: State) => state.loading,
    error: (state: State) => state.error
  };
}

// 2. 具体 Store 实现
@injectable()
export class UserStore extends StoreInterface<UserState> {
  constructor(@inject(UserService) private userService: UserServiceInterface) {
    super(() => ({
      user: null,
      loading: false,
      error: null
    }));
  }

  async fetchUser(id: string) {
    this.emit({ ...this.state, loading: true });
    try {
      const user = await this.userService.getUser(id);
      this.emit({ ...this.state, user, loading: false });
    } catch (error) {
      this.emit({ ...this.state, error, loading: false });
    }
  }
}
```

### 3. 状态使用

```typescript
// 1. 在组件中使用 Store
export function UserProfile() {
  const userStore = useIOC(UserStore);
  const user = useStore(userStore, userStore.selector.user);
  const loading = useStore(userStore, userStore.selector.loading);

  useEffect(() => {
    userStore.fetchUser(userId);
  }, [userStore, userId]);

  if (loading) return <Loading />;
  if (!user) return <NotFound />;

  return <UserInfo user={user} />;
}

// 2. 组合多个 Store
export function Dashboard() {
  const userStore = useIOC(UserStore);
  const statsStore = useIOC(StatsStore);

  const user = useStore(userStore, userStore.selector.user);
  const stats = useStore(statsStore, statsStore.selector.stats);

  return (
    <div>
      <UserWidget user={user} />
      <StatsWidget stats={stats} />
    </div>
  );
}
```

## 组件通信和事件处理

### 1. 事件处理

```typescript
// 1. 定义事件接口
interface ChatEvents {
  onSend: (message: string) => void;
  onClear: () => void;
  onError: (error: Error) => void;
}

// 2. 实现事件处理
export function ChatComponent({ onSend, onClear, onError }: ChatEvents) {
  const handleSend = useCallback(async (message: string) => {
    try {
      await onSend(message);
    } catch (error) {
      onError(error as Error);
    }
  }, [onSend, onError]);

  return (
    <div>
      <ChatInput onSend={handleSend} />
      <ClearButton onClick={onClear} />
    </div>
  );
}
```

### 2. 组件通信

```typescript
// 1. 通过属性传递
export function ParentComponent() {
  const [data, setData] = useState<Data>();

  return (
    <ChildComponent
      data={data}
      onUpdate={setData}
    />
  );
}

// 2. 通过 Context 共享
const ThemeContext = createContext<Theme>(defaultTheme);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState(defaultTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

## 组件测试和性能优化

### 1. 组件测试

```typescript
// 1. 单元测试
describe('UserProfile', () => {
  it('should render user info', () => {
    const user = { id: '1', name: 'Test' };
    render(<UserProfile user={user} />);

    expect(screen.getByText(user.name)).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    render(<UserProfile loading />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});

// 2. 集成测试
describe('LoginForm', () => {
  it('should handle login flow', async () => {
    const mockLogin = jest.fn();
    const { getByLabelText, getByRole } = render(
      <LoginForm onLogin={mockLogin} />
    );

    await userEvent.type(getByLabelText('Email'), 'test@example.com');
    await userEvent.type(getByLabelText('Password'), 'password');
    await userEvent.click(getByRole('button', { name: 'Login' }));

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
  });
});
```

### 2. 性能优化

```typescript
// 1. 使用 memo 优化渲染
const UserCard = memo(function UserCard({ user }: UserCardProps) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});

// 2. 使用 useMemo 和 useCallback
function UserList({ users }: UserListProps) {
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  const handleUserClick = useCallback((userId: string) => {
    // 处理用户点击
  }, []);

  return (
    <div>
      {sortedUsers.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onClick={handleUserClick}
        />
      ))}
    </div>
  );
}
```

## 最佳实践和示例

### 1. 组件设计原则

```typescript
// 1. 单一职责原则
// ❌ 错误：组件职责过多
function UserCard({ user, onEdit, onDelete, onShare }) {
  return (
    <div>
      <UserInfo user={user} />
      <UserActions user={user} />
      <SocialSharing user={user} />
    </div>
  );
}

// ✅ 正确：拆分为多个专注的组件
function UserCard({ user }) {
  return <UserInfo user={user} />;
}

function UserActions({ user }) {
  return (
    <div>
      <EditButton user={user} />
      <DeleteButton user={user} />
    </div>
  );
}

// 2. 组合优于继承
// ❌ 错误：使用继承
class SpecialButton extends Button {
  render() {
    return <button className="special">{this.props.children}</button>;
  }
}

// ✅ 正确：使用组合
function Button({ variant, children, ...props }) {
  return (
    <button className={`btn-${variant}`} {...props}>
      {children}
    </button>
  );
}
```

### 2. 状态管理最佳实践

```typescript
// 1. 状态隔离
@injectable()
export class UserStore extends StoreInterface<UserState> {
  // 将状态逻辑封装在 Store 中
  private async validateUser(user: User): Promise<boolean> {
    return this.validator.validate(user);
  }

  async updateUser(user: User) {
    if (await this.validateUser(user)) {
      this.emit({ ...this.state, user });
    }
  }
}

// 2. 选择器模式
@injectable()
export class DashboardStore extends StoreInterface<DashboardState> {
  selector = {
    ...super.selector,
    activeUsers: (state: DashboardState) =>
      state.users.filter((u) => u.isActive),
    totalRevenue: (state: DashboardState) =>
      state.transactions.reduce((sum, t) => sum + t.amount, 0)
  };
}
```

### 3. 性能优化示例

```typescript
// 1. 虚拟列表
function VirtualizedList({ items }: Props) {
  return (
    <VirtualScroller
      itemCount={items.length}
      itemSize={50}
      height={400}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <ListItem item={items[index]} />
        </div>
      )}
    </VirtualScroller>
  );
}

// 2. 懒加载组件
const LazyUserProfile = lazy(() => import('./UserProfile'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyUserProfile />
    </Suspense>
  );
}
```

## 总结

项目的组件和状态管理系统遵循以下原则：

1. **组件设计**：
   - 清晰的职责划分
   - 可复用的组件接口
   - 类型安全的属性定义

2. **状态管理**：
   - 集中的状态管理
   - 响应式的状态更新
   - 类型安全的状态定义

3. **性能优化**：
   - 组件级别的优化
   - 状态更新的优化
   - 资源加载的优化

4. **最佳实践**：
   - 单一职责原则
   - 组合优于继承
   - 状态隔离原则
