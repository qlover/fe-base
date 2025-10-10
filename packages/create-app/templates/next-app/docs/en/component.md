# Component Development and State Management Guide

## Table of Contents

1. [Component Architecture Overview](#component-architecture-overview)
2. [Component Architecture and Design Principles](#component-architecture-and-design-principles)
3. [State Management System](#state-management-system)
4. [Component Communication and Event Handling](#component-communication-and-event-handling)
5. [Component Testing and Performance Optimization](#component-testing-and-performance-optimization)
6. [Best Practices and Examples](#best-practices-and-examples)

## Component Architecture Overview

### 1. Overall Architecture

The project adopts a layered component architecture design:

```
Component Layer             State Layer
┌──────────────┐          ┌──────────────┐
│  UI Components│          │State Interface│
├──────────────┤          ├──────────────┤
│  Containers  │    ◄─────┤State Implement│
├──────────────┤          ├──────────────┤
│  Business    │          │State Actions  │
└──────────────┘          └──────────────┘
```

### 2. Core Concepts

- **UI Components**: Pure presentation components, no business logic
- **Container Components**: Responsible for state management and business logic
- **Business Components**: Components for specific business scenarios
- **State Management**: Store pattern-based state management system

### 3. Technology Stack

- **React + Next.js**: Base framework
- **TypeScript**: Type system
- **Inversify**: Dependency injection
- **Ant Design**: UI component library
- **Tailwind CSS**: Styling system

## Component Architecture and Design Principles

### 1. Component Categories

```typescript
// 1. UI Component
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

// 2. Container Component
export function UserProfileContainer() {
  const userStore = useIOC(UserStore);
  const user = useStore(userStore, userStore.selector.user);

  return <UserProfile user={user} />;
}

// 3. Business Component
export function LoginForm({ tt }: { tt: LoginI18nInterface }) {
  const userService = useIOC(I.UserServiceInterface);

  const handleLogin = async (values: LoginFormData) => {
    await userService.login(values);
  };

  return (
    <Form onFinish={handleLogin}>
      {/* Form content */}
    </Form>
  );
}
```

### 2. Component Providers

```typescript
// Combine multiple providers
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

### 3. Component Interface Design

```typescript
// 1. Component interface definition
interface ChatComponentInterface {
  // Property definitions
  messages: MessageInterface[];
  loading?: boolean;

  // Event handlers
  onSend: (message: string) => void;
  onClear: () => void;
}

// 2. Component implementation
@injectable()
export class ChatComponent implements ChatComponentInterface {
  constructor(
    @inject(ChatStore) private store: ChatStoreInterface,
    @inject(I.Logger) private logger: LoggerInterface
  ) {}

  // Implement interface methods
  async onSend(message: string) {
    try {
      await this.store.sendMessage(message);
    } catch (error) {
      this.logger.error('Failed to send message:', error);
    }
  }
}
```

## State Management System

### 1. State Interfaces

```typescript
// 1. State interface definition
export interface StoreStateInterface {
  readonly loading?: boolean;
  readonly error?: Error | null;
}

// 2. Async state interface
export interface AsyncStateInterface<T> {
  loading: boolean;
  result: T | null;
  error: unknown | null;
  startTime: number;
  endTime: number;
}

// 3. Request state implementation
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

### 2. Store Implementation

```typescript
// 1. Store base class
export abstract class StoreInterface<State extends StoreStateInterface> {
  protected state: State;
  protected subscribers: Set<(state: State) => void>;

  constructor(initialState: () => State) {
    this.state = initialState();
    this.subscribers = new Set();
  }

  // State update
  protected emit(newState: State): void {
    this.state = newState;
    this.subscribers.forEach((subscriber) => subscriber(this.state));
  }

  // Selectors
  selector = {
    loading: (state: State) => state.loading,
    error: (state: State) => state.error
  };
}

// 2. Concrete Store implementation
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

### 3. State Usage

```typescript
// 1. Using Store in components
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

// 2. Combining multiple Stores
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

## Component Communication and Event Handling

### 1. Event Handling

```typescript
// 1. Define event interface
interface ChatEvents {
  onSend: (message: string) => void;
  onClear: () => void;
  onError: (error: Error) => void;
}

// 2. Implement event handling
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

### 2. Component Communication

```typescript
// 1. Through props
export function ParentComponent() {
  const [data, setData] = useState<Data>();

  return (
    <ChildComponent
      data={data}
      onUpdate={setData}
    />
  );
}

// 2. Through Context
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

## Component Testing and Performance Optimization

### 1. Component Testing

```typescript
// 1. Unit testing
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

// 2. Integration testing
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

### 2. Performance Optimization

```typescript
// 1. Using memo for render optimization
const UserCard = memo(function UserCard({ user }: UserCardProps) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});

// 2. Using useMemo and useCallback
function UserList({ users }: UserListProps) {
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  const handleUserClick = useCallback((userId: string) => {
    // Handle user click
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

## Best Practices and Examples

### 1. Component Design Principles

```typescript
// 1. Single Responsibility Principle
// ❌ Wrong: Too many responsibilities
function UserCard({ user, onEdit, onDelete, onShare }) {
  return (
    <div>
      <UserInfo user={user} />
      <UserActions user={user} />
      <SocialSharing user={user} />
    </div>
  );
}

// ✅ Correct: Split into focused components
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

// 2. Composition over Inheritance
// ❌ Wrong: Using inheritance
class SpecialButton extends Button {
  render() {
    return <button className="special">{this.props.children}</button>;
  }
}

// ✅ Correct: Using composition
function Button({ variant, children, ...props }) {
  return (
    <button className={`btn-${variant}`} {...props}>
      {children}
    </button>
  );
}
```

### 2. State Management Best Practices

```typescript
// 1. State isolation
@injectable()
export class UserStore extends StoreInterface<UserState> {
  // Encapsulate state logic in Store
  private async validateUser(user: User): Promise<boolean> {
    return this.validator.validate(user);
  }

  async updateUser(user: User) {
    if (await this.validateUser(user)) {
      this.emit({ ...this.state, user });
    }
  }
}

// 2. Selector pattern
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

### 3. Performance Optimization Examples

```typescript
// 1. Virtualized list
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

// 2. Lazy loading components
const LazyUserProfile = lazy(() => import('./UserProfile'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyUserProfile />
    </Suspense>
  );
}
```

## Summary

The project's component and state management system follows these principles:

1. **Component Design**:
   - Clear responsibility separation
   - Reusable component interfaces
   - Type-safe property definitions

2. **State Management**:
   - Centralized state management
   - Reactive state updates
   - Type-safe state definitions

3. **Performance Optimization**:
   - Component-level optimization
   - State update optimization
   - Resource loading optimization

4. **Best Practices**:
   - Single Responsibility Principle
   - Composition over Inheritance
   - State Isolation Principle
