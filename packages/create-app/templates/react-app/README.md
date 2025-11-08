# FE-React Template

一个现代化的 React 前端项目模板，集成了多项实用功能和最佳实践。

[English](./README.en.md)

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

## 📚 文档指南

项目提供了详细的开发文档，涵盖了所有主要功能和最佳实践：

### 🚀 快速上手

- **[📖 项目文档](./docs/zh/index.md)** - 架构概览、核心理念和完整文档导航
- **[开发指南](./docs/zh/development-guide.md)** - 📝 完整的页面开发流程

### 🎯 核心功能

- **[Bootstrap 启动器](./docs/zh/bootstrap.md)** - ⚡ 应用启动和初始化
- **[IOC 容器](./docs/zh/ioc.md)** - 🔌 依赖注入和 UI 分离
- **[Store 状态管理](./docs/zh/store.md)** - 📡 应用层如何通知 UI 层
- **[环境变量管理](./docs/zh/env.md)** - ⚙️ 多环境配置
- **[国际化](./docs/zh/i18n.md)** - 🌍 i18n Key 和翻译管理

### 📖 辅助文档

- [为什么要禁用全局变量](./docs/zh/why-no-globals.md) - 全局变量使用规范
- [路由管理](./docs/zh/router.md) - 路由配置说明
- [主题系统](./docs/zh/theme.md) - 主题配置和切换
- [请求处理](./docs/zh/request.md) - API 请求处理
- [TypeScript 指南](./docs/zh/typescript-guide.md) - TypeScript 规范

## 🔨 核心功能

### IOC 容器

- 基于 TypeScript 的依赖注入系统
- 支持服务自动注册和依赖管理
- 提供完整的类型推导

### 环境配置

[vite 环境变量和模式](https://cn.vite.dev/guide/env-and-mode#env-variables-and-modes)

`vite dev` 默认 NODE_ENV 表示为 development, 他会加载可能的 `.env[mode]` 文件, 比如 .env.local -> .env

`vite build` 默认 NODE_ENV 表示为 production, 他会加载可能的 `.env[mode]` 文件, 比如 .env.production -> .env

Node.js NODE_ENV 只支持 development,production,test

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

### 控制器模式

提供多个开箱即用的控制器：

- JSONStorageController
- RequestController
- RouterController
- UserController
- ThemeController

## 🛠️ 开发指南

### API 开发规范

1. 在 `src/base/apis` 定义接口
2. 支持 Mock 数据配置

### 新增页面流程

1. 在 `src/pages` 创建页面组件
2. 更新 `config/app.router.json`
3. 添加对应的控制器（如需要）

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
