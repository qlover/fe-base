# FE-React Template

一个现代化的 React 前端项目模板，集成了多项实用功能和最佳实践。

## 特性亮点

- 🚀 基于 Vite 的快速开发体验
- 🎨 集成 Tailwind CSS 的主题系统
- 🌍 完善的国际化支持
- 🔄 IOC 容器的依赖注入
- 📡 统一的 API 请求处理
- 🎮 控制器模式的状态管理

## 环境要求

- Node.js >= 16
- pnpm >= 8.0

## 配置说明

项目配置文件位于 `config/` 目录：

- `app.common.ts`: 应用通用配置，包含 API 配置、默认登录信息等
- `app.router.json`: 路由配置，定义应用的路由结构
- `i18n.ts`: 国际化配置，支持中英文切换
- `theme.json`: 主题配置，定义应用的主题系统

## 项目结构

├── config/ # 配置文件目录
│ ├── app.common.ts # 应用通用配置
│ ├── app.router.json # 路由配置
│ ├── i18n.ts # 国际化配置
│ └── theme.json # 主题配置
├── lib/ # 公共库目录
│ ├── fe-react-controller/ # React 控制器库
│ ├── fe-react-theme/ # React 主题库
│ ├── openAiApi/ # OpenAI API 封装
│ ├── request-common-plugin/ # 请求公共插件
│ └── tw-root10px/ # Tailwind 10px 根字体配置
├── public/ # 静态资源目录
│ └── locales/ # 国际化资源文件
├── src/ # 源代码目录
│ ├── base/ # 基础代码
│ │ ├── apis/ # API 接口定义
│ │ ├── cases/ # 业务用例
│ │ ├── port/ # 接口定义
│ │ └── types/ # 类型定义
│ ├── core/ # 核心代码
│ │ └── feIOC/ # IOC 容器实现
│ │ └── globals.ts # 全局变量
│ │ └── bootstrap.ts # 启动器
│ ├── pages/ # 页面组件
│ ├── services/ # 服务层
│ └── uikit/ # UI 组件库
└── vite.config.ts # Vite 配置文件

## 目录结构说明

1. `config/`: 集中管理配置文件，便于统一维护和修改
2. `lib/`: 可复用的独立功能库，方便跨项目使用
3. `src/base/`: 基础代码层，定义接口和类型
4. `src/core/`: 核心功能实现，包含 IOC 容器等基础设施
5. `src/pages/`: 页面组件，按功能模块组织
6. `src/services/`: 服务层，处理业务逻辑
7. `src/uikit/`: UI 组件库，提供可复用的界面组件

## 核心特性

### 1. IOC 容器

项目使用依赖注入容器管理依赖，主要包含:

- `FeIOC`: IOC 容器的核心实现
- `RegisterApi`: API 服务注册
- `RegisterCommon`: 通用服务注册
- `RegisterControllers`: 控制器注册

### 2. 国际化支持

- 支持中文和英文
- 使用 i18next 实现
- 按模块划分语言文件

### 3. 主题系统

- 支持主题切换
- 基于 Tailwind CSS
- 自定义 10px 根字体配置

### 4. API 请求处理

- 统一的请求处理机制
- 支持请求拦截和响应处理
- Mock 数据支持
- OpenAI API 集成

### 5. 控制器模式

采用控制器模式管理业务逻辑:

- `JSONStorageController`: JSON 存储控制
- `RequestController`: 请求控制
- `RouterController`: 路由控制
- `UserController`: 用户控制
- `ThemeController`: 主题控制

## 技术栈

- React
- TypeScript
- Vite
- Tailwind CSS
- i18next
- @qlover/fe-utils

## 开发

项目使用 pnpm 管理依赖，请先安装 pnpm

```bash
npm install -g pnpm
```

## 开发指南

### API 开发

项目使用统一的 API 请求处理机制：

- 支持请求拦截和响应处理
- 内置 Mock 数据支持
- 集成 OpenAI API

### 控制器开发

项目采用控制器模式管理业务逻辑：

- `JSONStorageController`: 处理 JSON 数据存储
- `RequestController`: 处理 API 请求
- `UserController`: 处理用户认证
- `ThemeController`: 处理主题切换

### 国际化开发

语言文件位于 `public/locales/` 目录：

- `zh/`: 中文语言包
- `en/`: 英文语言包

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm run dev
```

### 构建

```bash
pnpm run build
```

### 测试

```bash
pnpm run test
```

## 常见问题

### Q: 如何切换主题？

A: 项目支持主题切换功能，通过 ThemeController 进行控制。

### Q: 如何添加新的语言支持？

A: 在 `public/locales/` 目录下添加新的语言文件，并在 `i18n.ts` 中配置。

## 许可证

ISC
