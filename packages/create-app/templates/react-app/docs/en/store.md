# Store State Management

## Core Concepts

The Store design philosophy is based on the following core concepts:

1. **Logic and UI Separation**
   - Business logic centralized in Store management
   - UI components only handle rendering and user interaction
   - Logic dependency injection through IOC container

2. **Reactive Data Flow**
   - Based on publish-subscribe pattern
   - State changes automatically trigger UI updates
   - Precise component re-rendering control

3. **State Slice Management**
   - Break down complex states into independent slices
   - Each slice handles specific business domain
   - Slices can be combined and communicate

## How It Works

### 1. State Subscription Mechanism

```typescript
// Store implements publish-subscribe mechanism internally
class SliceStore<T> {
  private listeners = new Set<(state: T) => void>();

  // Publish state updates
  protected emit(newState: T) {
    this.state = newState;
    this.listeners.forEach((listener) => listener(this.state));
  }

  // Subscribe to state changes
  subscribe(listener: (state: T) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
```

### 2. State Update Flow

```
User Action → Call Store Method → Update State → Notify Subscribers → UI Update
```

1. User triggers action (e.g., button click)
2. Calls method in Store
3. Store uses emit to publish new state
4. Components subscribed to that state receive notification
5. Components re-render, displaying latest state

### 3. Component Integration

```tsx
// Using Store in components
function UserProfile() {
  // useStore hook automatically handles subscription and unsubscription
  const user = useStore(IOC(UserService), (state) => state.userInfo);

  return <div>{user.name}</div>;
}
```

### 4. State Slice Example

```typescript
// Authentication slice
class AuthStore extends StoreInterface<AuthState> {
  constructor() {
    super(() => ({
      isLoggedIn: false,
      user: null
    }));
  }

  login(credentials: Credentials) {
    // Handle login logic
    this.emit({
      isLoggedIn: true,
      user: userData
    });
  }
}

// Theme settings slice
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

## Overview

Store is the application's state management solution, implemented based on `@qlover/slice-store-react`. It manages state using slices and has the following features:

- **Type Safety**: Based on TypeScript, providing complete type inference
- **Lightweight**: No complex configuration, easy to use
- **High Performance**: Precise component updates, avoiding unnecessary renders
- **Modular**: Supports state slicing, convenient for managing large applications
- **IOC Integration**: Perfect integration with dependency injection system

## Core Concepts

### 1. Store Interface

The Store system is based on two core interfaces:

#### StoreStateInterface

```typescript
/**
 * Store state interface
 *
 * Purpose: Define contract for store state objects
 * Core Idea: Enforce consistent structure for store states
 * Main Function: Serve as base for all store state types
 * Main Goal: Ensure state type safety and extensibility
 */
interface StoreStateInterface {
  // Define your own properties here
  // ...
}
```

#### StoreInterface

```typescript
/**
 * Store interface
 *
 * Purpose: Abstract base class for all state stores
 * Core Idea: Provide unified state management API, including reset and clone helper methods
 * Main Function: Extend SliceStore, add resetState and cloneState utility methods
 * Main Goal: Simplify store implementation and ensure consistency
 */
abstract class StoreInterface<
  T extends StoreStateInterface
> extends SliceStore<T> {
  constructor(protected stateFactory: () => T) {
    super(stateFactory);
  }

  // Reset store state
  resetState(): void {
    this.emit(this.stateFactory());
  }

  // Clone store state
  cloneState(source?: Partial<T>): T {
    const cloned = clone(this.state);
    if (typeof cloned === 'object' && cloned !== null) {
      Object.assign(cloned, source);
    }
    return cloned;
  }
}
```

### 2. State Slices

State slices divide application state into independent parts:

```typescript
// User state slice example
class UserState implements StoreStateInterface {
  isLoggedIn: boolean = false;
  userInfo: {
    name: string;
    role: string;
  } | null = null;
}

// Store implementation example
export class UserStore extends StoreInterface<UserState> {
  constructor() {
    super(() => new UserState());
  }
}
```

## Usage in Project

### 1. Creating Store Controller

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

  // Selectors
  selector = {
    helloState: (state: ExecutorState) => state.helloState,
    tasks: (state: ExecutorState) => state.tasks
  };
}
```

### 2. Using in Components

Use the `useStore` Hook to access state:

```tsx
function MyComponent() {
  // Get complete state
  const state = useStore(IOC(ExecutorController));

  // Use selector to get specific state
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

### 3. Updating State

Update state through controller methods:

```typescript
@injectable()
class ExecutorController extends StoreInterface<ExecutorState> {
  // ... constructor and other code

  updateHelloState(newState: string) {
    this.emit({ ...this.state, helloState: newState });
  }

  async fetchTasks() {
    const tasks = await api.getTasks();
    this.emit({ ...this.state, tasks });
  }

  // Use cloneState for state updates
  updateWithClone(newState: Partial<ExecutorState>) {
    this.emit(this.cloneState(newState));
  }
}
```

## Best Practices

1. **State Organization**
   - Divide state by functional modules
   - Avoid state redundancy
   - Keep state flat

2. **Performance Optimization**
   - Use selectors to get state, avoid unnecessary re-renders
   - Reasonably split components, avoid large components subscribing to too many states
   - Use `cloneState` method to ensure state update immutability

3. **Type Safety**
   - Define interfaces for all states
   - Use TypeScript's type inference
   - Avoid using any type

4. **Bootstrap Integration**
   - Initialize store during Bootstrap phase
   - Manage store instances through IOC container
   - Use plugin system to extend functionality

## Common Issues

### 1. State Updates Not Working

Check the following:

- Ensure correct use of `emit` method to update state
- Use `cloneState` method to ensure state immutability
- Check if component correctly subscribes to state

### 2. Component Re-rendering Issues

Possible solutions:

- Use selectors to subscribe only to needed state
- Check if dependencies are correctly set
- Consider using React.memo for component optimization

### 3. TypeScript Type Errors

Common solutions:

- Ensure correct inheritance from StoreInterface
- Check if generic parameters are correct
- Ensure state types implement StoreStateInterface
