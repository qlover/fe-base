# 开发规范指南

## 目录

1. [项目结构规范](#项目结构规范)
2. [代码风格规范](#代码风格规范)
3. [组件开发规范](#组件开发规范)
4. [状态管理规范](#状态管理规范)
5. [路由开发规范](#路由开发规范)
6. [国际化开发规范](#国际化开发规范)
7. [主题样式规范](#主题样式规范)
8. [测试规范](#测试规范)
9. [文档规范](#文档规范)

## 项目结构规范

> 💡 这里仅列出基本规范，完整的项目结构说明请参考 [项目结构文档](./project-structure.md)

### 1. 目录结构

```
src/
├── base/               # 基础功能实现
│   ├── cases/         # 业务场景实现
│   ├── services/      # 核心服务实现
│   └── types/         # 类型定义
├── core/              # 核心功能
│   ├── bootstraps/    # 启动相关
│   ├── clientIoc/     # 客户端 IOC 实现
│   ├── serverIoc/     # 服务端 IOC 实现
│   └── globals.ts     # 全局变量
├── pages/             # 页面组件
│   ├── auth/          # 认证相关页面
│   └── base/          # 基础页面
├── styles/            # 样式文件
│   └── css/
│       ├── themes/    # 主题相关
│       └── antd-themes/ # Ant Design 主题
├── uikit/             # UI 组件库
│   ├── components/    # 通用组件
│   ├── contexts/      # React Context
│   ├── hooks/         # 自定义 Hooks
│   └── providers/     # 提供者组件
└── App.tsx            # 应用入口
```

### 2. 应用启动流程

#### 2.1 客户端启动流程

客户端的启动流程由 `BootstrapClient` 类负责，主要包含以下步骤：

1. **初始化 IOC 容器**
   ```typescript
   // 创建 IOC 容器实例
   const clientIOC = new ClientIOC();
   const ioc = clientIOC.create();
   ```

2. **注册依赖**
   - 通过 `ClientIOCRegister` 注册全局依赖和服务
   - 主要包括三类注册：
     ```typescript
     // 1. 注册全局依赖
     registerGlobals(ioc: IOCContainerInterface) {
       ioc.bind(I.JSONSerializer, JSON);
       ioc.bind(I.Logger, logger);
       ioc.bind(I.AppConfig, appConfig);
       ioc.bind(I.DialogHandler, dialogHandler);
     }

     // 2. 注册核心服务实现
     registerImplement(ioc: IOCContainerInterface) {
       ioc.bind(I.I18nServiceInterface, new I18nService());
       ioc.bind(I.RouterServiceInterface, ioc.get(RouterService));
       ioc.bind(I.UserServiceInterface, ioc.get(UserService));
     }

     // 3. 注册通用服务和插件
     registerCommon(ioc: IOCContainerInterface) {
       // 注册请求插件、Mock插件等
     }
     ```

3. **启动应用**
   ```typescript
   export class BootstrapClient {
     static async main(args: BootstrapAppArgs) {
       const bootstrap = new Bootstrap({
         root,
         logger,
         ioc: { manager: IOC },
         globalOptions: { sources: globals }
       });

       // 初始化启动器
       await bootstrap.initialize();

       // 注册启动插件
       const bootstrapsRegistry = new BootstrapsRegistry(args);
       await bootstrap.use(bootstrapsRegistry.register()).start();
     }
   }
   ```

4. **启动插件注册**
   ```typescript
   class BootstrapsRegistry {
     register(): BootstrapExecutorPlugin[] {
       return [
         i18nService,                    // 国际化服务
         new AppUserApiBootstrap(),      // 用户 API
         printBootstrap,                 // 开发环境打印
         IocIdentifierTest              // IOC 标识符测试
       ];
     }
   }
   ```

#### 2.2 服务端启动流程

服务端的启动流程由 `BootstrapServer` 类负责，主要包含以下步骤：

1. **初始化 IOC 容器**
   ```typescript
   export class ServerIOC {
     static create(): ServerIOC {
       if (this.instance) return this.instance;
       this.instance = new ServerIOC();
       return this.instance;
     }

     create() {
       this.ioc = createIOCFunction<IOCIdentifierMapServer>(
         new InversifyContainer()
       );
       const register = new ServerIOCRegister({
         appConfig: new AppConfig()
       });
       register.register(this.ioc.implemention!, this.ioc);
       return this.ioc;
     }
   }
   ```

2. **注册服务端依赖**
   - 通过 `ServerIOCRegister` 注册服务端特有的依赖：
     ```typescript
     class ServerIOCRegister {
       // 1. 注册全局依赖
       registerGlobals(ioc: IOCContainerInterface) {
         ioc.bind(I.AppConfig, appConfig);
         ioc.bind(I.Logger, new Logger({
           handlers: new ConsoleHandler(new TimestampFormatter()),
           level: appConfig.env === 'development' ? 'debug' : 'info'
         }));
       }

       // 2. 注册服务端实现
       registerImplement(ioc: IOCContainerInterface) {
         ioc.bind(I.DBBridgeInterface, ioc.get(SupabaseBridge));
       }
     }
     ```

3. **服务器启动**
   ```typescript
   export class BootstrapServer implements ServerInterface {
     constructor() {
       const serverIOC = ServerIOC.create();
       const ioc = serverIOC.create();
       const logger = ioc(I.Logger);

       this.executor = new AsyncExecutor();
       this.IOC = ioc;
       this.logger = logger;
     }

     // 注册服务端插件
     use(plugin: BootstrapExecutorPlugin): this {
       this.executor.use(plugin);
       return this;
     }

     // 执行启动任务
     execNoError(task?: PromiseTask) {
       const context = {
         logger: this.logger,
         root: this.root,
         ioc: this.IOC.implemention!,
         IOC: this.IOC
       };
       return this.executor.execNoError(context, task);
     }
   }
   ```

### 3. IOC 容器使用

#### 3.1 获取服务实例
```typescript
// 在组件中使用
function UserProfile() {
  const userService = IOC(UserService);
  const i18nService = IOC(I.I18nServiceInterface);
  
  // 使用服务...
}
```

#### 3.2 注册新服务
```typescript
// 1. 定义服务接口
interface MyServiceInterface {
  doSomething(): void;
}

// 2. 添加 IOC 标识符
export const IOCIdentifier = {
  MyService: Symbol('MyService')
} as const;

// 3. 实现服务
@injectable()
class MyService implements MyServiceInterface {
  doSomething() {
    // 实现...
  }
}

// 4. 在 IOC 注册器中注册
class ClientIOCRegister {
  registerImplement(ioc: IOCContainerInterface) {
    ioc.bind(I.MyService, ioc.get(MyService));
  }
}
```

### 2. 命名规范

- **文件命名**：
  - 组件文件：`PascalCase.tsx`（如：`UserProfile.tsx`）
  - 工具文件：`camelCase.ts`（如：`formatDate.ts`）
  - 类型文件：`PascalCase.types.ts`（如：`User.types.ts`）
  - 样式文件：`camelCase.css`（如：`buttonStyles.css`）

- **目录命名**：
  - 全小写，使用连字符分隔（如：`user-profile/`）
  - 功能模块使用单数形式（如：`auth/`，而不是 `auths/`）

## 代码风格规范

> 💡 这里仅列出基本规范，更多 TypeScript 和 React 开发规范请参考 [TypeScript 开发规范](./typescript-guide.md)

### 1. TypeScript 规范

```typescript
// 使用 interface 定义对象类型
interface UserProfile {
  id: string;
  name: string;
  age?: number; // 可选属性使用 ?
}

// 使用 type 定义联合类型或工具类型
type Theme = 'light' | 'dark' | 'pink';
type Nullable<T> = T | null;

// 使用 enum 定义常量枚举
enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}

// 函数类型声明
function processUser(user: UserProfile): void {
  // 实现
}

// 泛型使用有意义的名称
interface Repository<TEntity> {
  find(id: string): Promise<TEntity>;
}
```

### 2. React 规范

```tsx
// 函数组件使用 FC 类型
interface Props {
  name: string;
  age: number;
}

const UserCard: FC<Props> = ({ name, age }) => {
  return (
    <div>
      <h3>{name}</h3>
      <p>{age}</p>
    </div>
  );
};

// Hooks 规范
const useUser = (userId: string) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 实现
  }, [userId]);

  return { user, loading };
};
```

## 组件开发规范

> 💡 这里仅列出基本规范，完整的组件开发指南请参考 [组件开发指南](./component-guide.md)

### 1. 组件分类

- **页面组件**：放在 `pages/` 目录下
- **业务组件**：放在对应业务模块目录下
- **通用组件**：放在 `uikit/components/` 目录下
- **布局组件**：放在 `uikit/layouts/` 目录下

### 2. 组件实现

```tsx
// 1. 导入顺序
import { FC, useEffect, useState } from 'react'; // React 相关
import { useTranslation } from 'react-i18next'; // 第三方库
import { UserService } from '@/services/user'; // 项目内部导入
import { Button } from './Button'; // 相对路径导入

// 2. 类型定义
interface Props {
  userId: string;
  onUpdate?: (user: User) => void;
}

// 3. 组件实现
export const UserProfile: FC<Props> = ({ userId, onUpdate }) => {
  // 3.1 Hooks 声明
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);

  // 3.2 副作用
  useEffect(() => {
    // 实现
  }, [userId]);

  // 3.3 事件处理
  const handleUpdate = () => {
    // 实现
  };

  // 3.4 渲染方法
  const renderHeader = () => {
    return <h2>{user?.name}</h2>;
  };

  // 3.5 返回 JSX
  return (
    <div>
      {renderHeader()}
      <Button onClick={handleUpdate}>{t('common.update')}</Button>
    </div>
  );
};
```

## 状态管理规范

> 💡 这里仅列出基本规范，完整的状态管理指南请参考 [Store 开发指南](./store.md)

### 1. Store 实现

```typescript
// 1. 状态接口定义
interface UserState extends StoreStateInterface {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

// 2. Store 实现
@injectable()
export class UserStore extends StoreInterface<UserState> {
  constructor() {
    super(() => ({
      currentUser: null,
      loading: false,
      error: null
    }));
  }

  // 3. 选择器定义
  selector = {
    currentUser: (state: UserState) => state.currentUser,
    loading: (state: UserState) => state.loading
  };

  // 4. 操作方法
  async fetchUser(id: string) {
    try {
      this.emit({ ...this.state, loading: true });
      const user = await api.getUser(id);
      this.emit({ ...this.state, currentUser: user, loading: false });
    } catch (error) {
      this.emit({
        ...this.state,
        error: error.message,
        loading: false
      });
    }
  }
}
```

### 2. Store 使用

```tsx
function UserProfile() {
  const userStore = IOC(UserStore);
  const user = useStore(userStore, userStore.selector.currentUser);
  const loading = useStore(userStore, userStore.selector.loading);

  return <div>{loading ? <Loading /> : <UserInfo user={user} />}</div>;
}
```

## 路由开发规范

> 💡 这里仅列出基本规范，完整的路由开发指南请参考 [路由开发指南](./router.md)

### 1. 基本规范

- 路由配置集中管理在 `config/app.router.ts` 中
- 使用声明式路由配置
- 路由组件放置在 `pages` 目录下
- 支持路由级别的代码分割
- 路由配置包含元数据支持

### 2. 示例

```typescript
// 路由配置示例
export const baseRoutes: RouteConfigValue[] = [
  {
    path: '/:lng',
    element: 'base/Layout',
    meta: {
      category: 'main'
    },
    children: [
      {
        path: 'users',
        element: 'users/UserList',
        meta: {
          title: i18nKeys.PAGE_USERS_TITLE,
          auth: true
        }
      }
    ]
  }
];
```

更多路由配置和使用示例，请参考 [路由开发指南](./router.md)。

## 国际化开发规范

> 💡 这里仅列出基本规范，完整的国际化开发指南请参考 [国际化开发指南](./i18n.md)

### 1. 基本规范

- 使用标识符常量管理翻译键
- 通过 TypeScript 注释生成翻译资源
- 支持多语言路由
- 集中管理翻译文件

### 2. 示例

```typescript
/**
 * @description User list page title
 * @localZh 用户列表
 * @localEn User List
 */
export const PAGE_USERS_TITLE = 'page.users.title';
```

更多国际化配置和使用示例，请参考 [国际化开发指南](./i18n.md)。

## 主题样式规范

> 💡 这里仅列出基本规范，完整的主题开发指南请参考 [主题开发指南](./theme.md)

### 1. 基本规范

- 使用 CSS 变量管理主题
- 遵循 Tailwind CSS 使用规范
- 组件样式模块化
- 支持多主题切换

### 2. 示例

```css
:root {
  --color-brand: 37 99 235;
  --text-primary: 15 23 42;
}
```

更多主题配置和使用示例，请参考 [主题开发指南](./theme.md)。

## 测试规范

> 💡 这里仅列出基本规范，完整的测试指南请参考 [测试开发指南](./testing.md)

### 1. 基本规范

- 单元测试覆盖核心逻辑
- 组件测试关注交互和渲染
- 使用 Jest 和 Testing Library
- 保持测试简单和可维护

### 2. 示例

```typescript
describe('UserProfile', () => {
  it('should render user info', () => {
    const user = { id: '1', name: 'Test' };
    render(<UserProfile user={user} />);
    expect(screen.getByText(user.name)).toBeInTheDocument();
  });
});
```

更多测试示例和最佳实践，请参考 [测试开发指南](./testing.md)。

## 文档规范

> 💡 这里仅列出基本规范，完整的文档编写指南请参考 [文档编写指南](./documentation.md)

### 1. 代码注释

```typescript
/**
 * 用户服务
 *
 * @description 处理用户相关的业务逻辑
 * @example
 * const userService = IOC(UserService);
 * await userService.login(credentials);
 */
@injectable()
export class UserService {
  /**
   * 用户登录
   *
   * @param credentials - 登录凭证
   * @returns 登录成功的用户信息
   * @throws {AuthError} 认证失败时抛出
   */
  async login(credentials: Credentials): Promise<User> {
    // 实现
  }
}
```

### 2. 文档结构

- **README.md**：项目概述、安装说明、快速开始
- **docs/**：
  - `zh/`：中文文档
  - `en/`：英文文档
  - 按功能模块组织文档文件

### 3. 文档格式

```markdown
# 模块名称

## 概述

简要说明模块的功能和用途。

## 使用方式

代码示例和使用说明。

## API 文档

详细的 API 说明。

## 最佳实践

使用建议和注意事项。
```

## Git 提交规范

> 💡 这里仅列出基本规范，完整的 Git 工作流程请参考 [Git 工作流指南](./git-workflow.md)

### 1. 提交消息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **type**：
  - `feat`：新功能
  - `fix`：修复
  - `docs`：文档更新
  - `style`：代码格式（不影响代码运行的变动）
  - `refactor`：重构
  - `test`：增加测试
  - `chore`：构建过程或辅助工具的变动

- **scope**：影响范围（可选）
- **subject**：简短描述
- **body**：详细描述（可选）
- **footer**：不兼容变动、关闭 issue（可选）

### 2. 示例

```
feat(auth): 添加用户角色管理功能

- 添加角色创建和编辑界面
- 实现角色权限配置
- 添加角色分配功能

Closes #123
```

## 性能优化规范

> 💡 这里仅列出基本规范，完整的性能优化指南请参考 [性能优化指南](./performance.md)

### 1. 代码分割

```typescript
// 路由级别的代码分割
const UserModule = lazy(() => import('./pages/users'));

// 组件级别的代码分割
const HeavyComponent = lazy(() => import('./components/Heavy'));
```

### 2. 性能考虑

```typescript
// 使用 useMemo 缓存计算结果
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.name.localeCompare(b.name));
}, [users]);

// 使用 useCallback 缓存函数
const handleUpdate = useCallback(() => {
  // 实现
}, [dependencies]);

// 使用 React.memo 避免不必要的重渲染
const UserCard = React.memo(({ user }) => {
  return <div>{user.name}</div>;
});
```

## 安全规范

> 💡 这里仅列出基本规范，完整的安全开发指南请参考 [安全开发指南](./security.md)

### 1. 数据处理

```typescript
// 敏感数据加密
const encryptedData = encrypt(sensitiveData);

// XSS 防护
const sanitizedHtml = sanitizeHtml(userInput);

// CSRF 防护
api.defaults.headers['X-CSRF-Token'] = getCsrfToken();
```

### 2. 权限控制

```typescript
// 路由权限
const PrivateRoute: FC = ({ children }) => {
  const auth = useAuth();
  return auth.isAuthenticated ? children : <Navigate to="/login" />;
};

// 操作权限
function AdminPanel() {
  const { hasPermission } = useAuth();

  return (
    <div>
      {hasPermission('ADMIN') && (
        <button>管理员操作</button>
      )}
    </div>
  );
}
```