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

### 基本使用

```typescript
import { FeScriptContext } from '@qlover/scripts-context';

// 创建脚本上下文
const context = new FeScriptContext({
  verbose: true,  // 启用详细日志
  dryRun: false   // 实际执行命令
});

// 使用 logger
context.logger.info('开始执行脚本');
context.logger.error('发生错误');

// 使用 shell 执行命令
await context.shell.exec('npm run build');
```

### 配置搜索

```typescript
import { ConfigSearch } from '@qlover/scripts-context';

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
