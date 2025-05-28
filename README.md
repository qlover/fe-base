# fe-base

前端基础工具包 - 专为前端应用设计的强大工具集合

## 📖 目录

- [项目简介](#-项目简介)
- [特性](#-特性)
- [快速开始](#-快速开始)
  - [环境要求](#环境要求)
  - [安装](#安装)
  - [基础使用](#基础使用)
- [包列表](#-包列表)
- [开发指南](#-开发指南)
  - [项目的构建与依赖管理](./docs/zh/project-builder.md)
  - [提交规范](./docs/zh/commit-convention.md)
  - [项目发布](./docs/zh/project-release.md)
  - [如何增加一个子包](./docs/zh/how-to-add-a-subpackage.md)
  - [测试指南](./docs/zh/testing-guide.md)
  - [打包格式指南](./docs/zh/build-formats.md)
- [脚本命令](#-脚本命令)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [贡献指南](#-贡献指南)
- [版本发布](#-版本发布)
- [常见问题](#-常见问题)
- [许可证](#-许可证)

## 📋 项目简介

fe-base 是一个专为前端应用设计的工具包集合，采用 monorepo 架构，提供模块化的前端解决方案。项目包含了从核心工具库到开发脚本、从日志系统到代码生成等多个实用工具包。

## ✨ 特性

- 🎯 **模块化设计** - 基于 pnpm workspace 的 monorepo 架构
- 🔧 **TypeScript 支持** - 完整的类型定义和智能提示
- 📦 **独立发布** - 每个包可独立安装和使用
- 🚀 **现代化工具链** - 使用 Vite、ESLint、Prettier 等现代工具
- 🔄 **自动化发布** - 基于 Changesets 的版本管理和发布流程
- 🧪 **测试覆盖** - 集成 Vitest 测试框架
- 🛠️ **开发工具** - 提供完整的开发工具链和脚本

## 🚀 快速开始

### 环境要求

- Node.js >= 18.19.0
- pnpm >= 8.0.0

### 安装

```bash
# 克隆项目
git clone https://github.com/qlover/fe-base.git
cd fe-base

# 安装依赖
pnpm install

# 构建所有包
pnpm build
```

### 基础使用

```bash
# 安装核心工具包
npm install @qlover/fe-corekit

# 安装开发脚本工具
npm install @qlover/fe-scripts

# 安装日志工具
npm install @qlover/logger

# 或使用 pnpm
pnpm add @qlover/fe-corekit @qlover/fe-scripts @qlover/logger
```

## 📦 包列表

| 包名 | 版本 | 描述 |
| ---- | ---- | ---- |
| [@qlover/fe-corekit](./packages/fe-corekit/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/fe-corekit) | 前端核心工具包，提供存储、序列化、请求等功能 |
| [@qlover/fe-scripts](./packages/fe-scripts/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/fe-scripts) | 前端开发脚本工具集，包含清理、提交、检查等命令 |
| [@qlover/fe-code2markdown](./packages/fe-code2markdown/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/fe-code2markdown) | 代码转 Markdown 文档生成工具 |
| [@qlover/fe-release](./packages/fe-release/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/fe-release) | 项目发布管理工具 |
| [@qlover/logger](./packages/logger/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/logger) | 灵活的日志记录系统 |
| [@qlover/env-loader](./packages/env-loader/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/env-loader) | 环境变量加载工具 |
| [@qlover/fe-standard](./packages/fe-standard/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/fe-standard) | 前端开发标准和规范 |
| [@qlover/eslint-plugin-fe-dev](./packages/eslint-plugin-fe-dev/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/eslint-plugin-fe-dev) | 前端开发 ESLint 插件 |
| [@qlover/scripts-context](./packages/scripts-context/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/scripts-context) | 脚本执行上下文工具 |
| [@qlover/corekit-bridge](./packages/corekit-bridge/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/corekit-bridge) | 核心工具包桥接器 |
| [@qlover/corekit-node](./packages/corekit-node/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/corekit-node) | Node.js 环境核心工具 |
| [@qlover/create-app](./packages/create-app/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/create-app) | 应用脚手架生成工具 |

## 🛠️ 开发指南

- [项目的构建与依赖管理](./docs/zh/project-builder.md)
- [提交规范](./docs/zh/commit-convention.md)
- [项目发布](./docs/zh/project-release.md)
- [如何增加一个子包](./docs/zh/how-to-add-a-subpackage.md)
- [测试指南](./docs/zh/testing-guide.md)
- [打包格式指南](./docs/zh/build-formats.md)

## 📜 脚本命令

```bash
# 构建所有包
pnpm build

# 代码检查和格式化
pnpm lint
pnpm prettier

# 运行测试
pnpm test

# 清理构建产物
pnpm clean:build

# 提交代码（使用 commitizen）
pnpm commit

# 检查包依赖
pnpm check-packages

# 清理分支
pnpm clean-branch

# 发布版本
pnpm release
```

## 🔧 技术栈

- **构建工具**: Vite, Rollup, tsup
- **包管理**: pnpm workspace
- **代码质量**: ESLint, Prettier, Husky
- **测试框架**: Vitest
- **版本管理**: Changesets
- **任务运行**: Nx
- **语言**: TypeScript

## 📁 项目结构

```
fe-base/
├── packages/                 # 子包目录
│   ├── fe-corekit/          # 前端核心工具包
│   ├── fe-scripts/          # 开发脚本工具
│   ├── fe-code2markdown/    # 代码文档生成工具
│   ├── fe-release/          # 发布管理工具
│   ├── logger/              # 日志系统
│   ├── env-loader/          # 环境变量加载器
│   ├── fe-standard/         # 开发标准
│   ├── eslint-plugin-fe-dev/ # ESLint 插件
│   ├── scripts-context/     # 脚本上下文
│   ├── corekit-bridge/      # 核心工具桥接器
│   ├── corekit-node/        # Node.js 核心工具
│   └── create-app/          # 应用脚手架
├── docs/                     # 文档目录
│   ├── zh/                   # 中文文档
│   └── en/                   # 英文文档
├── .github/                  # GitHub 配置
├── .changeset/               # 版本变更配置
├── package.json              # 根包配置
├── pnpm-workspace.yaml       # pnpm 工作空间配置
├── fe-config.json            # 前端工具配置
└── README.md                 # 项目说明
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`pnpm commit`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📋 版本发布

本项目使用 [Changesets](https://github.com/changesets/changesets) 进行版本管理：

```bash
# 添加变更记录
pnpm changeset

# 发布版本
pnpm changeset version
pnpm changeset publish
```

## ❓ 常见问题

- [如何增加一个子包](./docs/zh/how-to-add-a-subpackage.md)

## 📄 许可证

[ISC](./LICENSE)
