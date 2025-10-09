# Next.js 页面开发指南

## 目录

1. [页面开发概述](#页面开发概述)
2. [服务端组件详解](#服务端组件详解)
3. [客户端组件详解](#客户端组件详解)
4. [数据获取和状态管理](#数据获取和状态管理)
5. [页面路由和元数据](#页面路由和元数据)
6. [最佳实践和性能优化](#最佳实践和性能优化)

## 页面开发概述

### 1. 服务端组件 vs 客户端组件

在 Next.js 13+ 中，所有组件默认都是服务端组件（Server Components），除非显式声明为客户端组件。

```typescript
// 服务端组件（默认）
// page.tsx
export default function Page() {
  return <div>服务端渲染的内容</div>;
}

// 客户端组件
// 需要在文件顶部添加 'use client' 指令
'use client';

export function ClientComponent() {
  return <div>客户端渲染的内容</div>;
}
```

### 2. 选择指南

**使用服务端组件的场景**：
- 需要直接访问后端资源
- 包含敏感信息（API 密钥、tokens 等）
- 依赖后端的重量级操作
- 需要减少客户端 JavaScript 体积
- 需要 SEO 优化
- 页面级组件
- 不需要客户端交互
- 不需要浏览器 API

**使用客户端组件的场景**：
- 需要添加交互和事件处理
- 使用浏览器 API
- 使用 React hooks
- 需要维护组件状态
- 需要使用客户端特有的生命周期
- 使用依赖浏览器 API 的第三方库

## 服务端组件详解

### 1. 基本结构

```typescript
// app/[locale]/login/page.tsx
export default async function LoginPage(props: PageParamsProps) {
  // 1. 参数验证
  if (!props.params) {
    return notFound();
  }

  // 2. 服务端初始化
  const params = await props.params;
  const pageParams = new PageParams(params);
  const server = new BootstrapServer();

  // 3. 服务端数据获取和验证
  if (await server.getIOC(ServerAuth).hasAuth()) {
    return redirect({ href: '/', locale: params.locale! });
  }

  // 4. 获取国际化文本
  const tt = await pageParams.getI18nInterface(loginI18n);

  // 5. 渲染页面
  return (
    <BaseLayout>
      <div>{/* 页面内容 */}</div>
      <ClientComponent /> {/* 嵌入客户端组件 */}
    </BaseLayout>
  );
}
```

### 2. 服务端数据获取

```typescript
// 直接在服务端组件中获取数据
export default async function UsersPage() {
  const server = new BootstrapServer();
  
  const result = await server
    .use(new AdminAuthPlugin())  // 使用服务端中间件
    .execNoError(async ({ parameters: { IOC } }) => {
      const userService = IOC(UserService);
      return userService.getUsers();
    });

  // 数据直接传递给客户端组件
  return <UserList initialData={result.data} />;
}
```

### 3. 静态生成和动态渲染

```typescript
// 静态页面生成
export const dynamic = 'force-static';  // 强制静态生成
export const revalidate = 3600;         // 每小时重新生成

// 动态页面生成
export const dynamic = 'force-dynamic'; // 强制动态生成

// 生成静态路由参数
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'zh' }
  ];
}
```

## 客户端组件详解

### 1. 基本结构

```typescript
'use client';  // 声明为客户端组件

export function LoginForm(props: { tt: LoginI18nInterface }) {
  // 1. Hooks 使用
  const [loading, setLoading] = useState(false);
  const userService = useIOC(I.UserServiceInterface);
  
  // 2. 事件处理
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

  // 3. 渲染 UI
  return (
    <Form onFinish={handleLogin}>
      {/* 表单内容 */}
    </Form>
  );
}
```

### 2. 客户端状态管理

```typescript
'use client';

export function UserProfile() {
  // 1. 本地状态
  const [isEditing, setIsEditing] = useState(false);
  
  // 2. 服务状态
  const userStore = useIOC(UserStore);
  const user = useStore(userStore, userStore.selector.currentUser);
  
  // 3. 表单状态
  const [form] = Form.useForm();
  
  // 4. 副作用
  useEffect(() => {
    if (user) {
      form.setFieldsValue(user);
    }
  }, [user, form]);

  return (
    <div>{/* 组件内容 */}</div>
  );
}
```

### 3. 与服务端组件交互

```typescript
// 1. 通过属性接收服务端数据
interface Props {
  initialData: UserData;    // 从服务端获取的初始数据
  tt: I18nInterface;        // 从服务端获取的翻译文本
}

'use client';
export function UserList({ initialData, tt }: Props) {
  const [data, setData] = useState(initialData);
  
  // 使用服务端数据初始化客户端状态
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  return (
    <div>{/* 组件内容 */}</div>
  );
}
```

## 数据获取和状态管理

### 1. 服务端数据获取

```typescript
// 1. 在服务端组件中获取数据
export default async function DashboardPage() {
  const server = new BootstrapServer();
  
  // 并行数据获取
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

// 2. 使用服务端 action
export async function fetchUserData(userId: string) {
  'use server';  // 声明为服务端 action
  
  const server = new BootstrapServer();
  return server.execNoError(async ({ IOC }) => {
    return IOC(UserService).getUserById(userId);
  });
}
```

### 2. 客户端状态管理

```typescript
'use client';

// 1. 使用 Store 管理状态
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

// 2. 在组件中使用 Store
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

## 页面路由和元数据

### 1. 动态路由

```typescript
// app/[locale]/users/[id]/page.tsx
export default async function UserPage({
  params: { locale, id }
}: {
  params: { locale: string; id: string };
}) {
  // 处理路由参数
}

// 生成静态路由
export async function generateStaticParams() {
  const users = await fetchUsers();
  
  return users.map((user) => ({
    locale: ['en', 'zh'],
    id: user.id
  }));
}
```

### 2. 元数据生成

```typescript
// 1. 静态元数据
export const metadata: Metadata = {
  title: 'User Profile',
  description: 'User profile page'
};

// 2. 动态元数据
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

## 最佳实践和性能优化

### 1. 组件分割原则

```typescript
// ❌ 错误：在一个组件中混合服务端和客户端逻辑
export default function Page() {
  const [state, setState] = useState();  // 错误：服务端组件不能使用 hooks
  const data = await fetchData();        // 正确：服务端数据获取
  
  return <div>{/* ... */}</div>;
}

// ✅ 正确：分离服务端和客户端逻辑
// page.tsx (服务端组件)
export default async function Page() {
  const data = await fetchData();  // 服务端数据获取
  return <ClientComponent data={data} />;
}

// ClientComponent.tsx (客户端组件)
'use client';
export function ClientComponent({ data }) {
  const [state, setState] = useState();  // 客户端状态管理
  return <div>{/* ... */}</div>;
}
```

### 2. 性能优化策略

```typescript
// 1. 组件级缓存
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

// 2. 路由级缓存
export const revalidate = 3600;  // 缓存一小时

// 3. 选择性水合
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

### 3. 错误处理

```typescript
// 1. 错误边界
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
      <h2>出错了！</h2>
      <button onClick={reset}>重试</button>
    </div>
  );
}

// 2. 加载状态
export default async function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <SlowComponent />
    </Suspense>
  );
}
```

## 总结

Next.js 13+ 的页面开发需要注意以下几点：

1. **组件类型选择**：
   - 默认使用服务端组件
   - 只在必要时使用客户端组件
   - 合理分割组件职责

2. **数据流处理**：
   - 服务端优先获取数据
   - 通过属性传递给客户端
   - 使用 Store 管理客户端状态

3. **性能优化**：
   - 合理使用缓存策略
   - 实现选择性水合
   - 优化加载性能

4. **开发体验**：
   - 清晰的代码组织
   - 类型安全
   - 完善的错误处理

5. **最佳实践**：
   - 遵循单一职责原则
   - 实现优雅降级
   - 保持代码可维护性
