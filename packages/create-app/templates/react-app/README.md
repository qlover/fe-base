# FE-React Template

一个现代化的 React 前端项目模板，集成了多项实用功能和最佳实践。

## 🌟 特性亮点

- 🚀 基于 Vite 的快速开发体验
- 🎨 集成 Tailwind CSS 的主题系统
- 🌍 完善的国际化支持（中英文）
- 🔄 基于 TypeScript 的 IOC 容器
- 📡 统一的 API 请求处理
- 🎮 控制器模式的状态管理
- 📦 使用 pnpm 进行包管理
- 🧪 内置测试支持

## 🔧 环境要求

- Node.js >= 16
- pnpm >= 8.0

## 📁 项目结构

```tree
├── config/                 # 配置文件目录
│   ├── app.router.json     # 路由页面配置
│   ├── common.ts           # 应用通用配置
│   ├── app.router.json     # 路由配置
│   ├── i18n.ts             # 国际化配置
│   └── theme.json          # 主题配置
├── lib/                    # 公共库目录
├── public/                 # 静态资源目录
├── src/
│   ├── base/           # 基础代码
│   ├── core/           # 核心代码
│   ├── pages/          # 页面组件
│   ├── services/       # 服务层
│   └── uikit/          # UI 组件库
└── vite.config.ts      # Vite 配置文件
```

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建项目

```bash
pnpm build
```

### 运行测试

```bash
pnpm test
```

## 🔨 核心功能

### IOC 容器

- 基于 TypeScript 的依赖注入系统
- 支持服务自动注册和依赖管理
- 提供完整的类型推导

### env 配置注入

[vite 环境变量和模式](https://cn.vite.dev/guide/env-and-mode#env-variables-and-modes)

`vite dev` 默认 NODE_ENV 表示为 development, 他会加载可能的 `.env[mode]` 文件, 比如 .env.local -> .env

`vite build`默认 NODE_ENV 表示为 production, 他会加载可能的 `.env[mode]` 文件, 比如 .env.production -> .env

Nodejs NODE_ENV 只支持 development,production,test

这个和 vite 中的 mode 是完全不一样的, mode 可以根据 `--mode` 指定不同模式，来加载不同的 env 配置

比如:

```bash
vite dev --mode staging # 加载 .env.staging
vite dev --mode local # 加载 .env.local
```

### 国际化支持

- 基于 i18next 的完整国际化解决方案
- 支持中文(zh)和英文(en)双语切换
- 基于 TypeScript 注释的自动国际化资源生成
- URL 路径语言检测和切换
- 内置语言切换组件

#### 国际化配置

项目使用 `@brain-toolkit/ts2locales` 插件从 TypeScript 注释自动生成国际化资源：

```typescript
// config/Identifier/I18n.ts
export const Messages = {
  /**
   * @description Home page welcome message
   * @localZh 欢迎来到主页
   * @localEn Welcome to the home page
   */
  HOME_WELCOME: 'home.welcome',

  /**
   * @description Get started button text
   * @localZh 开始使用
   * @localEn Get Started
   */
  HOME_GET_STARTED: 'home.get_started'
};
```

Vite 插件配置：

```typescript
// vite.config.ts
import ts2Locales from '@brain-toolkit/ts2locales/vite';
import i18nConfig from './config/i18n';

export default defineConfig({
  plugins: [
    ts2Locales({
      locales: i18nConfig.supportedLngs,
      options: [
        {
          source: './config/Identifier/Error.ts',
          target: './public/locales/{{lng}}/common.json'
        },
        {
          source: './config/Identifier/I18n.ts',
          target: './public/locales/{{lng}}/common.json'
        }
      ]
    })
  ]
});
```

#### 国际化服务

项目提供了 `I18nService` 用于管理国际化状态和语言切换：

```typescript
import { I18nService } from '@/base/services/I18nService';

// 获取当前语言
const currentLang = I18nService.getCurrentLanguage();

// 切换语言
await i18nService.changeLanguage('zh');
```

#### 在组件中使用

```typescript
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import * as i18nKeys from '@config/Identifier/I18n';

function MyComponent() {
  const { t } = useBaseRoutePage();

  return (
    <div>
      <h1>{t(i18nKeys.HOME_WELCOME)}</h1>
      <button>{t(i18nKeys.HOME_GET_STARTED)}</button>
    </div>
  );
}
```

#### 语言切换组件

项目提供了开箱即用的语言切换组件：

```typescript
import LanguageSwitcher from '@/uikit/components/LanguageSwitcher';

function Header() {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  );
}
```

#### 最佳实践

1. 国际化标识符管理：

   - 在 `config/Identifier/I18n.ts` 中集中管理UI文本
   - 在 `config/Identifier/Error.ts` 中集中管理错误信息
   - 使用有意义的 key 命名（如：'page.home.title'）

2. TypeScript 注释规范：

   - 使用 `@description` 描述文本用途
   - 使用 `@localZh` 定义中文文本
   - 使用 `@localEn` 定义英文文本

3. 路由配置：

   - 使用 `LocaleLink` 组件进行页面跳转
   - URL 格式：`/{lang}/path`（如：'/zh/about'）

4. 组件开发：
   - 使用 `useBaseRoutePage` hook 获取翻译函数
   - 从 `@config/Identifier/I18n` 引入国际化 key
   - 避免硬编码文本，始终使用国际化 key

### 主题系统

- 基于 Tailwind CSS 的主题配置
- 支持暗色/亮色模式
- 自定义设计令牌系统

### API 集成

项目提供了强大的 API 请求处理机制，基于插件化架构设计：

#### 请求控制器

使用 `RequestController` 统一管理 API 请求：

```typescript
@injectable()
export class RequestController extends StoreInterface<RequestControllerState> {
  constructor(
    @inject(FeApi) private readonly feApi: FeApi,
    @inject(UserApi) private readonly userApi: UserApi
  ) {
    super(createDefaultState);
  }

  // API 调用示例
  async onRandomUser() {
    if (this.state.randomUserState.loading) return;

    this.setState({
      randomUserState: { loading: true, result: null, error: null }
    });

    try {
      const result = await this.userApi.getRandomUser();
      this.setState({
        randomUserState: { loading: false, result, error: null }
      });
    } catch (error) {
      this.setState({
        randomUserState: { loading: false, result: null, error }
      });
    }
  }
}
```

#### 请求插件系统

项目内置多个实用的请求插件：

1. `FetchURLPlugin`: URL 处理和构建
2. `RequestCommonPlugin`: 通用请求配置
3. `ApiMockPlugin`: Mock 数据支持
4. `FetchAbortPlugin`: 请求中断控制
5. `RequestLogger`: 请求日志记录
6. `ApiCatchPlugin`: 统一错误处理

使用示例：

```typescript
// 配置请求适配器
const adapter = new RequestAdapter({
  plugins: [
    new FetchURLPlugin(),
    new RequestCommonPlugin(),
    new ApiMockPlugin(),
    new FetchAbortPlugin(),
    new RequestLogger()
  ]
});

// 发起请求
const response = await adapter.request({
  url: '/api/users',
  method: 'GET',
  requestId: 'uniqueId', // 用于中断请求
  mock: true // 启用 mock 数据
});
```

#### 请求调度器

使用 `RequestScheduler` 管理复杂的请求流程：

```typescript
export class FeApi extends RequestScheduler<RequestConfig> {
  async getIpInfo() {
    return this.request<void, IpInfo>({
      url: '/api/ip',
      method: 'GET'
    });
  }
}
```

#### Mock 数据支持

项目支持灵活的 Mock 数据配置：

```typescript
// 配置 Mock 数据
const mockConfig = {
  '/api/users': {
    GET: () => ({
      code: 200,
      data: {
        id: 1,
        name: 'John Doe'
      }
    })
  }
};

// 在请求中使用
const response = await api.request({
  url: '/api/users',
  method: 'GET',
  mock: true // 启用 mock
});
```

#### 最佳实践

1. API 定义：

   - 在 `src/base/apis` 中集中管理 API 定义
   - 使用 TypeScript 接口定义请求和响应类型
   - 遵循 RESTful API 设计规范

2. 错误处理：

   - 使用 `ApiCatchPlugin` 统一处理错误
   - 定义清晰的错误类型和错误码
   - 提供友好的错误提示

3. 请求状态管理：

   - 使用 `SliceStore` 管理请求状态
   - 处理加载、成功、错误等状态
   - 实现请求防抖和节流

4. Mock 数据：
   - 提供合理的 Mock 数据结构
   - 支持动态 Mock 数据生成
   - 便于本地开发和测试

### 控制器模式

提供多个开箱即用的控制器：

- JSONStorageController
- RequestController
- RouterController
- UserController
- ThemeController

## 📚 开发指南

### API 开发规范

1. 在 `src/base/apis` 定义接口
2. 支持 Mock 数据配置

### 新增页面流程

1. 在 `src/pages` 创建页面组件
2. 更新 `config/app.router.json`
3. 添加对应的控制器（如需要）

### 国际化开发

1. 在 `public/locales` 添加翻译文件
2. 使用 `useTranslation` hook 进行调用
3. 支持按需加载语言包

### 构建优化

项目使用 Vite 进行构建，并进行了以下优化：

#### 代码分割

自动进行智能代码分割，将代码分为以下几个主要块：

- react-vendor: React 核心库
- antd-core: Ant Design 核心组件
- antd-basic: 基础 UI 组件
- antd-advanced: 高级 UI 组件
- utils: 工具函数
- i18n: 国际化相关

#### 构建优化配置

```typescript
build: {
  // 分块大小警告限制设置为 600kb
  chunkSizeWarningLimit: 600,
  // 使用 terser 进行代码压缩
  minify: 'terser',
  terserOptions: {
    compress: {
      // 移除控制台输出和调试器语句
      drop_console: true,
      drop_debugger: true,
      // 移除特定的控制台函数调用
      pure_funcs: ['console.log', 'console.info', 'console.debug']
    }
  }
}
```

### 项目配置

#### 环境变量

- 使用 `@qlover/corekit-bridge/vite-env-config` 管理环境变量
- 自动注入应用名称和版本信息
- 支持环境变量前缀配置

#### 样式配置

- 集成 Tailwind CSS
- 按需加载 Ant Design 组件样式
- 支持主题模式覆盖

#### 开发服务器

```bash
# 默认端口 3200，可通过环境变量配置
VITE_SERVER_PORT=3000 pnpm dev
```

#### 测试配置

- 使用 Vitest 进行单元测试
- 支持 JSDOM 环境
- 内置测试工具配置
