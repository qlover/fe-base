# @qlover/scripts-context

`scripts-context` 是一个用于管理和执行脚本的工具包，提供了配置搜索、日志记录、命令执行等功能。它旨在为脚本执行提供统一的上下文环境。

## Install

```bash
npm i @qlover/scripts-context
# or
yarn add @qlover/scripts-context
# or
pnpm add @qlover/scripts-context
```

## Usage

```typescript
import { ConfigSearch } from './ConfigSearch';
const configSearch = new ConfigSearch({
  name: 'myapp',
  defaultConfig: { port: 3000 }
});

const config = configSearch.config;
console.log(config.port); // => 3000
```

## 贡献

欢迎对 `scripts-context` 进行贡献！请确保在提交代码前运行所有测试，并遵循项目的代码风格指南。

### 配置搜索
