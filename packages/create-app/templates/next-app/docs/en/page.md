# Next.js Page Development Guide

## Table of Contents

1. [Page Development Overview](#page-development-overview)
2. [Server Components in Detail](#server-components-in-detail)
3. [Client Components in Detail](#client-components-in-detail)
4. [Data Fetching and State Management](#data-fetching-and-state-management)
5. [Page Routing and Metadata](#page-routing-and-metadata)
6. [Best Practices and Performance Optimization](#best-practices-and-performance-optimization)

## Page Development Overview

### 1. Server Components vs Client Components

In Next.js 13+, all components are Server Components by default unless explicitly declared as Client Components.

```typescript
// Server Component (default)
// page.tsx
export default function Page() {
  return <div>Server-rendered content</div>;
}

// Client Component
// Requires 'use client' directive at the top of the file
'use client';

export function ClientComponent() {
  return <div>Client-rendered content</div>;
}
```

### 2. Selection Guide

**Use Server Components when**:

- Direct access to backend resources is needed
- Contains sensitive information (API keys, tokens, etc.)
- Depends on heavy backend operations
- Need to reduce client-side JavaScript bundle size
- SEO optimization is required
- For page-level components
- No client-side interaction needed
- No browser APIs needed

**Use Client Components when**:

- Need to add interactions and event handling
- Using browser APIs
- Using React hooks
- Need to maintain component state
- Need client-specific lifecycles
- Using third-party libraries that depend on browser APIs

## Server Components in Detail

### 1. Basic Structure

```typescript
// app/[locale]/login/page.tsx
export default async function LoginPage(props: PageParamsProps) {
  // 1. Parameter validation
  if (!props.params) {
    return notFound();
  }

  // 2. Server initialization
  const params = await props.params;
  const pageParams = new PageParams(params);
  const server = new BootstrapServer();

  // 3. Server-side data fetching and validation
  if (await server.getIOC(ServerAuth).hasAuth()) {
    return redirect({ href: '/', locale: params.locale! });
  }

  // 4. Get internationalized text
  const tt = await pageParams.getI18nInterface(loginI18n);

  // 5. Render page
  return (
    <BaseLayout>
      <div>{/* Page content */}</div>
      <ClientComponent /> {/* Embed client component */}
    </BaseLayout>
  );
}
```

### 2. Server-Side Data Fetching

```typescript
// Fetch data directly in server component
export default async function UsersPage() {
  const server = new BootstrapServer();

  const result = await server
    .use(new AdminAuthPlugin())  // Use server middleware
    .execNoError(async ({ parameters: { IOC } }) => {
      const userService = IOC(UserService);
      return userService.getUsers();
    });

  // Pass data directly to client component
  return <UserList initialData={result.data} />;
}
```

### 3. Static Generation and Dynamic Rendering

```typescript
// Static page generation
export const dynamic = 'force-static'; // Force static generation
export const revalidate = 3600; // Regenerate every hour

// Dynamic page generation
export const dynamic = 'force-dynamic'; // Force dynamic generation

// Generate static route parameters
export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}
```

## Client Components in Detail

### 1. Basic Structure

```typescript
'use client';  // Declare as client component

export function LoginForm(props: { tt: LoginI18nInterface }) {
  // 1. Hooks usage
  const [loading, setLoading] = useState(false);
  const userService = useIOC(I.UserServiceInterface);

  // 2. Event handling
  const handleLogin = async (values: LoginFormData) => {
    try {
      setLoading(true);
      await userService.login(values);
      routerService.gotoHome();
    } catch (error) {
      logger.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Render UI
  return (
    <Form onFinish={handleLogin}>
      {/* Form content */}
    </Form>
  );
}
```

### 2. Client-Side State Management

```typescript
'use client';

export function UserProfile() {
  // 1. Local state
  const [isEditing, setIsEditing] = useState(false);

  // 2. Service state
  const userStore = useIOC(UserStore);
  const user = useStore(userStore, userStore.selector.currentUser);

  // 3. Form state
  const [form] = Form.useForm();

  // 4. Side effects
  useEffect(() => {
    if (user) {
      form.setFieldsValue(user);
    }
  }, [user, form]);

  return (
    <div>{/* Component content */}</div>
  );
}
```

### 3. Interaction with Server Components

```typescript
// 1. Receive server data through props
interface Props {
  initialData: UserData;    // Initial data from server
  tt: I18nInterface;        // Translation text from server
}

'use client';
export function UserList({ initialData, tt }: Props) {
  const [data, setData] = useState(initialData);

  // Initialize client state with server data
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  return (
    <div>{/* Component content */}</div>
  );
}
```

## Data Fetching and State Management

### 1. Server-Side Data Fetching

```typescript
// 1. Fetch data in server component
export default async function DashboardPage() {
  const server = new BootstrapServer();

  // Parallel data fetching
  const [userData, statsData] = await Promise.all([
    server.execNoError(async ({ IOC }) => IOC(UserService).getCurrentUser()),
    server.execNoError(async ({ IOC }) => IOC(StatsService).getStats())
  ]);

  return (
    <Dashboard
      userData={userData}
      statsData={statsData}
    />
  );
}

// 2. Use server action
export async function fetchUserData(userId: string) {
  'use server';  // Declare as server action

  const server = new BootstrapServer();
  return server.execNoError(async ({ IOC }) => {
    return IOC(UserService).getUserById(userId);
  });
}
```

### 2. Client-Side State Management

```typescript
'use client';

// 1. Use Store for state management
@injectable()
export class UserProfileStore extends StoreInterface<UserProfileState> {
  constructor() {
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

// 2. Use Store in component
export function UserProfile() {
  const store = useIOC(UserProfileStore);
  const user = useStore(store, store.selector.user);
  const loading = useStore(store, store.selector.loading);

  return (
    <div>
      {loading ? <Loading /> : <UserInfo user={user} />}
    </div>
  );
}
```

## Page Routing and Metadata

### 1. Dynamic Routing

```typescript
// app/[locale]/users/[id]/page.tsx
export default async function UserPage({
  params: { locale, id }
}: {
  params: { locale: string; id: string };
}) {
  // Handle route parameters
}

// Generate static routes
export async function generateStaticParams() {
  const users = await fetchUsers();

  return users.map((user) => ({
    locale: ['en', 'zh'],
    id: user.id
  }));
}
```

### 2. Metadata Generation

```typescript
// 1. Static metadata
export const metadata: Metadata = {
  title: 'User Profile',
  description: 'User profile page'
};

// 2. Dynamic metadata
export async function generateMetadata({
  params
}: {
  params: PageParamsType;
}): Promise<Metadata> {
  const pageParams = new PageParams(await params);
  const tt = await pageParams.getI18nInterface(userI18n);

  return {
    title: tt.pageTitle,
    description: tt.pageDescription
  };
}
```

## Best Practices and Performance Optimization

### 1. Component Splitting Principles

```typescript
// ❌ Wrong: Mixing server and client logic in one component
export default function Page() {
  const [state, setState] = useState();  // Error: Server components can't use hooks
  const data = await fetchData();        // Correct: Server-side data fetching

  return <div>{/* ... */}</div>;
}

// ✅ Correct: Separate server and client logic
// page.tsx (Server Component)
export default async function Page() {
  const data = await fetchData();  // Server-side data fetching
  return <ClientComponent data={data} />;
}

// ClientComponent.tsx (Client Component)
'use client';
export function ClientComponent({ data }) {
  const [state, setState] = useState();  // Client-side state management
  return <div>{/* ... */}</div>;
}
```

### 2. Performance Optimization Strategies

```typescript
// 1. Component-level caching
export default async function UserList() {
  const users = await fetchUsers();

  return (
    <div>
      {users.map(user => (
        <Suspense key={user.id} fallback={<Loading />}>
          <UserCard user={user} />
        </Suspense>
      ))}
    </div>
  );
}

// 2. Route-level caching
export const revalidate = 3600;  // Cache for one hour

// 3. Selective hydration
export default function Page() {
  return (
    <>
      <StaticContent />
      <Suspense fallback={<Loading />}>
        <DynamicContent />
      </Suspense>
    </>
  );
}
```

### 3. Error Handling

```typescript
// 1. Error boundary
'use client';
export function ErrorBoundary({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// 2. Loading state
export default async function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <SlowComponent />
    </Suspense>
  );
}
```

## Summary

Key points for Next.js 13+ page development:

1. **Component Type Selection**:
   - Use Server Components by default
   - Use Client Components only when necessary
   - Properly split component responsibilities

2. **Data Flow Handling**:
   - Prioritize server-side data fetching
   - Pass data to client through props
   - Use Store for client-side state management

3. **Performance Optimization**:
   - Use caching strategies appropriately
   - Implement selective hydration
   - Optimize loading performance

4. **Development Experience**:
   - Clear code organization
   - Type safety
   - Comprehensive error handling

5. **Best Practices**:
   - Follow Single Responsibility Principle
   - Implement graceful degradation
   - Maintain code maintainability
