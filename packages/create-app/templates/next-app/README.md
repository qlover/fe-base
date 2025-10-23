# Next.js Full-Stack Application Template

一个基于 Next.js 的全栈应用模板，采用面向接口的设计模式，实现了清晰的前后端分层架构。

[English](./README.en.md)

## 🌟 特性亮点

- 🏗️ 基于 Next.js 的全栈应用架构
- 🔌 面向接口的设计模式（Interface-Driven Development）
- 🎨 集成 Tailwind CSS 的主题系统
- 🌍 完善的国际化支持（中英文）
- 🔄 基于 TypeScript 的 IOC 容器
- 🛡️ 完整的身份验证和授权系统
- 📡 分层的 API 架构（控制器、服务、仓库）
- 🎮 状态管理与页面控制器模式
- 🔗 SQL 数据库桥接层
- 📦 使用 pnpm 进行包管理

## 🔧 环境要求

- Node.js >= 16
- pnpm >= 8.0

## 📁 项目结构

```tree
├── config/                     # 配置文件目录
│   ├── i18n/                  # 国际化配置
│   ├── Identifier/            # 依赖注入标识符
│   ├── common.ts              # 应用通用配置
│   ├── IOCIdentifier.ts       # IOC容器配置
│   └── theme.ts               # 主题配置
├── public/                    # 静态资源目录
├── src/
│   ├── app/                  # Next.js 应用目录
│   │   ├── [locale]/        # 国际化路由
│   │   ├── api/            # API 路由处理器
│   │   └── layout.tsx      # 应用布局
│   ├── base/               # 客户端基础代码
│   │   ├── port/          # 客户端接口定义
│   │   ├── cases/         # 业务用例实现
│   │   ├── services/      # 客户端服务实现
│   │   └── types/         # 类型定义
│   ├── server/            # 服务端代码
│   │   ├── port/         # 服务端接口定义
│   │   ├── services/     # 服务实现
│   │   ├── repositorys/  # 数据仓库
│   │   ├── validators/   # 请求验证器
│   │   └── sqlBridges/   # 数据库桥接层
│   ├── uikit/            # UI 组件库
│   │   ├── components/   # 可复用组件
│   │   ├── context/     # React Context
│   │   └── hook/        # React Hooks
│   └── styles/          # 样式文件
└── next.config.ts       # Next.js 配置文件
```

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
# cross-env APP_ENV=localhost next dev --turbopack --port 3100
# 自动加载 .env.localhost -> .env

pnpm dev:staging
# cross-env APP_ENV=staging next dev --turbopack --port 3100
# 自动加载 .env.staging -> .env
```

### 构建项目

```bash
pnpm build
```

## 📚 文档指南

项目提供了详细的开发文档，涵盖了所有主要功能和最佳实践：

### 基础文档

- [项目概述](./docs/zh/index.md) - 项目整体介绍和快速开始指南
- [项目结构](./docs/zh/project-structure.md) - 详细的项目目录结构说明
- [开发指南](./docs/zh/development-guide.md) - 项目开发规范和最佳实践
- [环境配置](./docs/zh/env.md) - 环境变量和配置管理说明
- [全局配置](./docs/zh/global.md) - 应用全局配置和设置说明

### 核心功能

- [启动流程](./docs/zh/bootstrap.md) - 应用启动流程和生命周期管理
- [IOC容器](./docs/zh/ioc.md) - 依赖注入系统的使用说明
- [路由管理](./docs/zh/router.md) - 路由配置和页面导航说明
- [状态管理](./docs/zh/store.md) - 应用状态管理方案说明
- [请求处理](./docs/zh/request.md) - API 请求处理机制说明

### 功能扩展

- [国际化](./docs/zh/i18n.md) - 多语言支持和翻译管理
- [主题系统](./docs/zh/theme.md) - 主题配置和暗色模式支持
- [TypeScript指南](./docs/zh/typescript-guide.md) - TypeScript 使用规范和最佳实践

## 🔨 架构设计

### 面向接口的设计模式

项目采用面向接口的设计模式，通过接口定义实现解耦和可测试性：

#### 客户端接口 (src/base/port)

- **AppUserApiInterface**: 用户认证相关API接口
- **AsyncStateInterface**: 异步状态管理接口
- **RouterInterface**: 路由管理接口
- **I18nServiceInterface**: 国际化服务接口

#### 服务端接口 (src/server/port)

- **ServerAuthInterface**: 服务端认证接口
- **DBBridgeInterface**: 数据库操作桥接接口
- **UserRepositoryInterface**: 用户数据仓库接口
- **ValidatorInterface**: 数据验证接口
- **ParamsHandlerInterface**: 参数处理接口
