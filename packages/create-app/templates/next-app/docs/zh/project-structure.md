# 项目结构详细说明

## 目录结构概览

```
next-app/
├── config/           # 全局配置文件
├── src/             # 源代码目录
│   ├── app/         # Next.js 应用路由
│   ├── base/        # 客户端核心代码
│   ├── core/        # 核心启动和IOC配置
│   ├── server/      # 服务端代码
│   ├── styles/      # 样式文件
│   └── uikit/       # UI组件库
└── public/          # 静态资源
```

## 详细结构说明

### 1. 客户端架构 (src/base)

#### 1.1 接口层 (src/base/port)

- `AdminLayoutInterface.ts` - 管理布局接口
- `AdminPageInterface.ts` - 管理页面接口
- `AppApiInterface.ts` - 应用API接口
- `AppUserApiInterface.ts` - 用户API接口
- `AsyncStateInterface.ts` - 异步状态接口
- `I18nServiceInterface.ts` - 国际化服务接口
- `IOCInterface.ts` - 依赖注入接口
- `RouterInterface.ts` - 路由接口
- `UserServiceInterface.ts` - 用户服务接口

#### 1.2 业务逻辑层 (src/base/cases)

- 状态管理控制器
- 对话框处理
- 路由服务
- 用户服务
- 加密服务

#### 1.3 服务实现层 (src/base/services)

- `AdminUserService.ts` - 管理用户服务
- `I18nService.ts` - 国际化服务
- `UserService.ts` - 用户服务
- `adminApi/` - 管理API实现
- `appApi/` - 应用API实现

### 2. 服务端架构 (src/server)

#### 2.1 接口层 (src/server/port)

- `CrentialTokenInterface.ts` - 凭证令牌接口
- `DBBridgeInterface.ts` - 数据库桥接接口
- `DBTableInterface.ts` - 数据表接口
- `PaginationInterface.ts` - 分页接口
- `ParamsHandlerInterface.ts` - 参数处理接口
- `ServerAuthInterface.ts` - 服务认证接口
- `ServerInterface.ts` - 服务器接口
- `UserRepositoryInterface.ts` - 用户仓库接口
- `ValidatorInterface.ts` - 验证器接口

#### 2.2 核心实现

- `AppErrorApi.ts` - API错误处理
- `AppSuccessApi.ts` - API成功响应
- `ServerAuth.ts` - 服务认证实现
- `UserCredentialToken.ts` - 用户凭证令牌

#### 2.3 服务层 (src/server/services)

- `AdminAuthPlugin.ts` - 管理认证插件
- `AIService.ts` - AI服务
- `ApiUserService.ts` - API用户服务
- `UserService.ts` - 用户服务

#### 2.4 数据访问层

- `repositorys/UserRepository.ts` - 用户数据仓库
- `sqlBridges/SupabaseBridge.ts` - Supabase数据库桥接

#### 2.5 验证器 (src/server/validators)

- `LoginValidator.ts` - 登录验证
- `PaginationValidator.ts` - 分页验证

### 3. API路由结构 (src/app/api)

```
api/
├── admin/           # 管理接口
│   └── users/       # 用户管理
├── ai/             # AI相关接口
│   └── completions/ # AI补全
└── user/           # 用户接口
    ├── login/      # 登录
    ├── logout/     # 登出
    └── register/   # 注册
```

### 4. 页面路由结构 (src/app/[locale])

```
[locale]/
├── admin/          # 管理页面
│   └── users/      # 用户管理
├── login/          # 登录页面
├── register/       # 注册页面
└── page.tsx        # 首页
```

### 5. UI组件库 (src/uikit)

#### 5.1 组件 (components)

- `AdminLayout.tsx` - 管理布局
- `BaseHeader.tsx` - 基础头部
- `BaseLayout.tsx` - 基础布局
- `ChatRoot.tsx` - 聊天根组件
- `LanguageSwitcher.tsx` - 语言切换
- `ThemeSwitcher.tsx` - 主题切换
- 其他通用组件

#### 5.2 Hooks和Context

- `useI18nInterface.ts` - 国际化Hook
- `useIOC.ts` - IOC容器Hook
- `useStore.ts` - 状态管理Hook
- `IOCContext.ts` - IOC上下文

## 技术特点

1. **依赖注入模式**
   - 使用 IOC 容器管理依赖
   - 客户端和服务端分别维护独立的 IOC 容器
   - 通过接口进行解耦

2. **分层架构**
   - 清晰的接口定义
   - 职责分明的实现层
   - 松耦合的模块设计

3. **状态管理**
   - 基于控制器的状态管理
   - 响应式数据流
   - 可预测的状态变更

4. **国际化支持**
   - 基于 next-intl 的多语言支持
   - 动态语言切换
   - 路由级别的语言隔离

5. **主题系统**
   - 基于 Tailwind CSS
   - 暗黑模式支持
   - 可配置的主题变量

## 开发流程

1. **API开发**
   - 定义接口 (port)
   - 实现验证器 (validators)
   - 实现服务 (services)
   - 创建API路由 (api)

2. **页面开发**
   - 创建页面组件
   - 实现控制器
   - 注册依赖
   - 添加路由

3. **组件开发**
   - 创建UI组件
   - 实现业务逻辑
   - 注入依赖
   - 添加样式
