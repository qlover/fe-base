# fe-corekit

## 简介

fe-corekit (@qlover/fe-corekit) 是一个功能全面的前端核心工具包，提供了多种实用工具和模块，帮助开发者更高效地构建前端应用。它包含了存储管理、序列化、网络请求、日志记录、任务执行等多个核心功能模块。

## 安装

使用 npm、yarn 或 pnpm 安装:

```bash
# npm
npm install @qlover/fe-corekit

# yarn
yarn add @qlover/fe-corekit

# pnpm
pnpm add @qlover/fe-corekit
```

## 使用方式

fe-corekit 支持多种导入方式，可以根据需要导入整个库或特定模块：

### 导入整个库

```typescript
import * as CoreKit from '@qlover/fe-corekit';

const logger = new CoreKit.Logger();
logger.info('Hello, world!');
```

### 按需导入

```typescript
// 导入日志模块
import { Logger } from '@qlover/fe-corekit';

const logger = new Logger();
logger.info('Hello, world!');

// 导入存储模块
import { JSONStorage } from '@qlover/fe-corekit';

const storage = new JSONStorage();
storage.setItem('key', { data: 'value' });
```

## 核心功能

### 核心模块

- **存储 (storage)**: 提供 JSON 数据的存储、检索和管理功能，支持自定义存储后端和序列化器
- **序列化 (serializer)**: 数据序列化和反序列化工具
- **请求 (request)**: 网络请求工具，简化 API 调用
- **日志 (logger)**: 灵活的日志记录系统
- **执行器 (executor)**: 任务执行管理
- **接口定义**: 提供了一系列标准接口定义，确保各模块之间的一致性和互操作性

## 使用示例

### JSON 存储

```typescript
// 创建内存存储
const storage = new JSONStorage();
storage.setItem('key', { data: 'value' }, 3600); // 设置过期时间为3600毫秒
const value = storage.getItem('key');
// => { data: 'value' }
```

### 使用本地存储

```typescript
// 使用浏览器的 localStorage
const storage = new JSONStorage(localStorage);
storage.setItem('key', { data: 'value' });
const value = storage.getItem('key');
// => { data: 'value' }
```

### 自定义序列化器和存储

```typescript
// 使用自定义序列化器和存储后端
const customSerializer = {
  serialize: JSON.stringify,
  deserialize: JSON.parse
};

const customStorage = {
  setItem: (key: string, value: string) => {
    localStorage.setItem(key, value);
  },
  getItem: (key: string) => {
    return localStorage.getItem(key);
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  }
};

const storage = new JSONStorage(customStorage, customSerializer);
storage.setItem('key', { data: 'value' });
```

### 日志记录

```typescript
const logger = new Logger();
logger.info('应用启动');
logger.warn('警告信息');
logger.error('错误信息');
```

## TypeScript 支持

fe-corekit 完全使用 TypeScript 编写，提供了完整的类型定义，可以获得良好的 IDE 提示和类型检查。

## 快速导航

- [核心模块文档](./common/)

## 兼容性

fe-corekit 支持所有现代浏览器和 Node.js 环境。支持 ES 模块和 CommonJS 两种模块系统。

## 版本信息

当前版本: 1.2.0

有关更新和变更的详细信息，请查看[更新日志](./CHANGELOG.md)。
