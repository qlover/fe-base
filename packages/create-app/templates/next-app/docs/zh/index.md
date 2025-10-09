# Next.js 全栈应用开发文档

## 简介

这是一个基于 Next.js 的全栈应用模板，采用面向接口的设计模式，实现了清晰的分层架构。本模板提供了完整的全栈开发解决方案，包括服务端API、客户端状态管理、认证授权、国际化等核心功能。

### 主要特性

- 🏗️ **全栈架构**：基于 Next.js 的应用路由和API路由
- 🔌 **接口驱动**：完整的面向接口编程实践
- 🎨 **主题定制**：基于 Tailwind CSS 的主题系统
- 🌍 **国际化**：基于 next-intl 的多语言支持
- 🔄 **依赖注入**：基于 TypeScript 的 IOC 容器
- 🛡️ **身份认证**：完整的认证和授权方案
- 📡 **分层设计**：清晰的前后端分层架构
- 🎮 **状态管理**：基于控制器模式的状态管理
- 🔗 **数据访问**：灵活的数据库访问层

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发环境启动
pnpm dev
# cross-env APP_ENV=localhost next dev --turbopack --port 3100
# 自动加载 .env.localhost -> .env

# 预发环境启动
pnpm dev:staging
# cross-env APP_ENV=staging next dev --turbopack --port 3100
# 自动加载 .env.staging -> .env

# 构建生产版本
pnpm build
```

## 架构概览

### 1. 客户端架构

#### 接口定义 (src/base/port)
- AppUserApiInterface: 用户API接口
- AdminPageInterface: 管理页面接口
- AsyncStateInterface: 异步状态接口
- RouterInterface: 路由管理接口

#### 核心实现
- 控制器层：状态和业务逻辑管理
- 服务层：API调用和数据处理
- UI组件：可复用的展示组件

### 2. 服务端架构

#### 接口定义 (src/server/port)
- ServerAuthInterface: 认证接口
- DBBridgeInterface: 数据库操作接口
- UserRepositoryInterface: 用户仓库接口
- ValidatorInterface: 数据验证接口

#### 核心实现
- API路由层：请求处理和响应
- 服务层：业务逻辑实现
- 数据访问层：仓库和数据库交互

## 开发指南

### 1. API 开发流程

1. 定义接口 (src/server/port)
2. 实现验证器 (src/server/validators)
3. 实现服务层 (src/server/services)
4. 实现数据访问 (src/server/repositorys)
5. 创建API路由 (src/app/api)

### 2. 页面开发流程

1. 创建页面组件 (src/app/[locale])
2. 实现页面控制器
3. 添加API服务
4. 注册IOC容器

### 3. 最佳实践

#### 接口优先开发
- 先定义接口，再实现具体类
- 保持接口的单一职责
- 使用依赖注入管理依赖

#### 分层原则
- 保持层级间的清晰边界
- 通过接口进行层级间通信
- 避免跨层级直接调用

#### 状态管理
- 使用控制器管理复杂状态
- 保持状态的不可变性
- 统一的状态更新流程

## 核心功能文档

### 基础架构
- [项目结构说明](./project-structure.md)
- [开发规范指南](./development-guide.md)
- [环境配置指南](./env.md)

### 服务端开发
- [API开发指南](./api.md)
- [认证授权](./auth.md)
- [数据访问层](./database.md)
- [验证器开发](./validator.md)

### 客户端开发
- [页面开发指南](./page.md)
- [组件开发](./component.md)

### 功能模块
- [国际化开发](./i18n.md)
- [主题系统](./theme.md)
- [路由管理](./router.md)

## 常见问题

### 1. 开发环境配置

- Node.js >= 16
- pnpm >= 8.0
- 推荐使用 VSCode + 推荐插件

### 2. 开发相关

- 接口设计规范
- 依赖注入使用
- 控制器开发规范

### 3. 部署相关

- 环境变量配置
- 构建优化
- 部署流程

## 更新日志

查看 [CHANGELOG.md](../../CHANGELOG.md) 了解详细的更新历史。

## 支持和帮助

- 提交 Issue
- 查看 Wiki
- 参与讨论

## 许可证

本项目基于 [ISC 许可证](../../LICENSE) 开源。