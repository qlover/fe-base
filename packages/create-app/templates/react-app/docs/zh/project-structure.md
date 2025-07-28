# 项目结构说明

## 目录结构

```
src/
├── base/               # 基础功能实现
│   ├── apis/          # API 接口定义和实现
│   │   └── userApi/   # 用户相关 API
│   ├── cases/         # 业务场景实现
│   │   ├── AppConfig.ts           # 应用配置
│   │   ├── RouterLoader.ts        # 路由加载器
│   │   └── I18nKeyErrorPlugin.ts  # 国际化错误处理
│   ├── services/      # 核心服务实现
│   │   ├── UserService.ts         # 用户服务
│   │   ├── RouteService.ts        # 路由服务
│   │   └── I18nService.ts         # 国际化服务
│   └── types/         # 类型定义
├── core/              # 核心功能
│   ├── bootstraps/    # 启动相关
│   │   └── BootstrapApp.ts        # 应用启动器
│   ├── registers/     # 注册器
│   │   ├── RegisterCommon.ts      # 通用服务注册
│   │   └── RegisterGlobals.ts     # 全局变量注册
│   └── IOC.ts         # IOC 容器
├── pages/             # 页面组件
│   ├── auth/          # 认证相关页面
│   │   ├── LoginPage.tsx          # 登录页面
│   │   └── RegisterPage.tsx       # 注册页面
│   └── base/          # 基础页面
│       ├── HomePage.tsx           # 首页
│       └── ErrorPage.tsx         # 错误页面
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

## 已实现功能

### 1. 用户认证系统

#### 登录功能

- 支持邮箱密码登录
- 记住登录状态
- 登录状态持久化
- 登录错误处理
- 支持第三方登录（预留接口）

```typescript
// 登录服务示例
class UserService extends UserAuthService<UserInfo> {
  async login(credentials: LoginFormData) {
    // 登录实现
  }

  async logout() {
    // 登出实现
  }
}
```

#### 注册功能

- 用户注册表单
- 表单验证
- 密码强度检查
- 服务条款同意
- 注册成功跳转

```typescript
// 注册功能示例
async register(params: RegisterFormData) {
  const response = await this.api.register(params);
  // 处理注册逻辑
}
```

### 2. 路由系统

#### 特性

- 配置式路由
- 路由级别代码分割
- 路由守卫
- 路由元信息
- 多语言路由支持

```typescript
// 路由配置示例
export const baseRoutes: RouteConfigValue[] = [
  {
    path: '/:lng',
    element: 'base/Layout',
    meta: {
      category: 'main'
    },
    children: [...]
  }
];
```

### 3. 国际化系统

#### 特性

- 支持中英文切换
- 路由级别的语言切换
- 基于 TypeScript 注释的翻译生成
- 动态加载语言包
- 完整的类型支持

### 4. 主题系统

#### 特性

- 支持多主题切换
- CSS 变量驱动
- Tailwind CSS 集成
- Ant Design 主题定制
- 响应式设计

### 5. 状态管理

#### 特性

- 基于 Store 的状态管理
- 响应式数据流
- 状态持久化
- 状态分片
- 完整的类型支持

### 6. UI 组件库

#### 已实现组件

- 布局组件
  - BaseLayout：基础布局
  - AuthLayout：认证页面布局
- 通用组件
  - ThemeSwitcher：主题切换器
  - LanguageSwitcher：语言切换器
  - Loading：加载状态
- 表单组件
  - LoginForm：登录表单
  - RegisterForm：注册表单

### 7. 工具集成

#### 开发工具

- TypeScript 支持
- ESLint 配置
- Prettier 格式化
- Jest 测试框架
- Vite 构建工具

#### 辅助功能

- 路由自动生成
- API 请求封装
- 错误处理
- 日志系统
- 缓存管理

### 8. 安全特性

#### 已实现

- CSRF 防护
- XSS 防护
- 请求加密
- 数据脱敏
- 权限控制

## 扩展点

### 1. 认证系统扩展

- 添加更多第三方登录
- 实现手机号登录
- 添加双因素认证
- 实现密码重置

### 2. UI 组件扩展

- 添加更多业务组件
- 扩展主题系统
- 添加动画效果
- 优化移动端适配

### 3. 功能扩展

- 添加文件上传
- 实现实时通讯
- 添加数据可视化
- 实现离线支持

## 项目依赖说明

### 核心依赖

#### React 相关

- **react** (^18.3.1)
  - 核心框架
  - 使用最新的 React 18 特性
  - 支持并发模式和 Suspense

- **react-dom** (^18.3.1)
  - React 的 DOM 渲染器
  - 用于 Web 平台渲染

- **react-router-dom** (^7.1.5)
  - 路由管理
  - 使用最新的数据路由功能
  - 支持嵌套路由和路由守卫

#### 状态管理

- **@qlover/slice-store-react** (^1.0.8)
  - 状态管理解决方案
  - 基于发布订阅模式
  - 支持状态分片和响应式更新

- **@qlover/corekit-bridge**
  - 核心功能桥接层
  - 提供状态管理与 UI 的连接
  - 实现依赖注入和服务管理

#### UI 框架

- **antd** (^5.25.3)
  - UI 组件库
  - 使用 v5 版本
  - 支持主题定制和 CSS-in-JS

- **@brain-toolkit/antd-theme-override** (^0.0.3)
  - Ant Design 主题覆盖工具
  - 实现主题变量的动态切换
  - 支持自定义主题配置

#### 样式工具

- **tailwindcss** (^4.1.8)
  - 原子化 CSS 框架
  - 用于快速构建响应式界面
  - 与主题系统集成

- **clsx** (^2.1.1)
  - 类名管理工具
  - 用于条件性类名拼接
  - 提供类型安全的 API

#### 国际化

- **i18next** (^24.2.0)
  - 国际化框架
  - 支持动态语言切换
  - 提供完整的翻译管理

- **i18next-browser-languagedetector** (^8.0.2)
  - 浏览器语言检测
  - 自动检测用户语言偏好
  - 支持多种检测策略

- **i18next-http-backend** (^3.0.1)
  - 翻译资源加载器
  - 支持动态加载翻译文件
  - 实现按需加载

#### 依赖注入

- **inversify** (^7.1.0)
  - IoC 容器实现
  - 用于依赖注入
  - 提供服务管理和注册

- **reflect-metadata** (^0.2.2)
  - 元数据反射支持
  - 用于装饰器实现
  - 支持依赖注入的类型信息

### 开发依赖

#### 构建工具

- **vite** (^6.3.5)
  - 现代构建工具
  - 提供快速的开发服务器
  - 支持 ESM 和资源优化

- **@vitejs/plugin-react** (^4.4.1)
  - React 插件
  - 提供 React 特定优化
  - 支持 Fast Refresh

#### 类型支持

- **typescript** (^5.6.3)
  - JavaScript 超集
  - 提供类型检查
  - 增强开发体验

#### 代码质量

- **eslint** (^9.15.0)
  - 代码检查工具
  - 确保代码质量
  - 支持自定义规则

- **prettier** (^3.5.3)
  - 代码格式化工具
  - 统一代码风格
  - 与 ESLint 集成

#### 测试工具

- **vitest** (^3.0.5)
  - 单元测试框架
  - 与 Vite 深度集成
  - 提供快速的测试执行

### 自定义工具包

#### 日志系统

- **@qlover/logger** (^0.1.1)
  - 统一的日志管理
  - 支持不同级别的日志
  - 提供格式化输出

#### 环境配置

- **@qlover/env-loader**
  - 环境变量加载
  - 支持多环境配置
  - 类型安全的配置访问

#### 开发工具

- **@qlover/fe-scripts**
  - 开发脚本集合
  - 提供常用的开发命令
  - 简化开发流程

#### 代码规范

- **@qlover/fe-standard** (^0.0.4)
  - 统一的代码规范
  - ESLint 规则集
  - TypeScript 配置

## 依赖版本管理

### 版本更新策略

- 核心依赖：谨慎更新，需要完整测试
- UI 框架：跟随官方 LTS 版本
- 工具依赖：定期更新到最新版本
- 自定义包：使用 latest 标签跟踪最新版本

### 依赖检查

```bash
# 检查过期依赖
npm outdated

# 更新依赖
npm update

# 安装特定版本
npm install package@version
```

## 开发指南

### 1. 开始开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 2. 添加新功能

1. 在 `src/base/services` 添加服务
2. 在 `src/base/apis` 添加 API
3. 在 `src/pages` 添加页面组件
4. 在 `config/app.router.ts` 添加路由配置
5. 在 `src/uikit/components` 添加通用组件

### 3. 测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test <test-file>

# 更新快照
npm test -- -u
```

## 注意事项

1. **代码组织**
   - 遵循目录结构规范
   - 使用适当的文件命名
   - 保持代码模块化

2. **性能考虑**
   - 合理使用代码分割
   - 优化组件渲染
   - 控制依赖大小

3. **安全性**
   - 遵循安全最佳实践
   - 正确处理用户数据
   - 保护敏感信息
