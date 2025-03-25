# @qlover/corekit-bridge

fe-corekit 实际开发环境的抽象工具桥接

## 简介

@qlover/corekit-bridge 是一个用于连接 fe-corekit 核心工具和实际开发环境的桥接库。它提供了一系列实用工具和插件，简化了前端应用程序的开发流程。

## 安装

```bash
npm install @qlover/corekit-bridge
```

或者

```bash
yarn add @qlover/corekit-bridge
```

## 主要功能

### Bootstrap 引导系统

用于应用程序初始化和依赖注入的引导系统：

```typescript
import {
  Bootstrap,
  InjectIOC,
  InjectEnv,
  InjectGlobal
} from '@qlover/corekit-bridge';

const bootstrap = new Bootstrap(window, iocContainer, logger);

bootstrap
  .use(new InjectIOC(iocManager, registers))
  .use(new InjectEnv(config, process.env, 'APP_'))
  .use(new InjectGlobal(globals, 'AppGlobals'))
  .start();
```

### IOC 容器接口

提供依赖注入容器的标准接口：

```typescript
import { IOCContainerInterface } from '@qlover/corekit-bridge';

class MyContainer implements IOCContainerInterface {
  // 实现接口方法
}
```

### API 请求插件

一系列增强 API 请求功能的插件：

- ApiCatchPlugin: 捕获 API 请求错误
- ApiMockPlugin: 提供 API 模拟数据功能
- ApiPickDataPlugin: 从响应中提取数据
- RequestCommonPlugin: 处理通用请求配置

```typescript
import { ApiMockPlugin, ApiCatchPlugin } from '@qlover/corekit-bridge';

const mockPlugin = new ApiMockPlugin(mockData, logger);
const catchPlugin = new ApiCatchPlugin(logger, errorCatcher);
```

### 构建工具

提供一系列有用的构建和配置工具：

#### Tailwind 10px 根字体配置

```typescript
import tailwindRoot10px from '@qlover/corekit-bridge/build/tw-root10px';

// 在 tailwind.config.js 中使用
module.exports = {
  theme: {
    ...tailwindRoot10px.themes
  },
  plugins: [tailwindRoot10px.plugin]
};
```

#### Vite 环境配置插件

```typescript
import viteEnvConfig from '@qlover/corekit-bridge/build/vite-env-config';

// 在 vite.config.js 中使用
export default {
  plugins: [
    viteEnvConfig({
      envPrefix: 'APP_',
      records: [
        ['APP_NAME', 'appName'],
        ['APP_VERSION', 'appVersion']
      ]
    })
  ]
};
```

#### TypeScript 到本地化文件转换工具

```typescript
import viteTs2Locales from '@qlover/corekit-bridge/build/vite-ts-to-locales';

// 在 vite.config.js 中使用
export default {
  plugins: [
    viteTs2Locales({
      locales: ['en', 'zh'],
      options: [
        {
          source: './config/ErrorIdentifier.ts',
          target: './locales/{{lng}}/common.json'
        }
      ]
    })
  ]
};
```

### 彩色日志 ColorLogger

提供带颜色的控制台日志输出：

```typescript
import { ColorLogger } from '@qlover/corekit-bridge';

const logger = new ColorLogger({
  debug: true,
  colorsMaps: {
    DEBUG: 'color: blue;',
    INFO: 'color: green;',
    WARN: 'color: orange;',
    ERROR: 'color: red;'
  }
});

logger.debug('调试信息');
logger.info('普通信息');
```

## 其他工具

- 线程工具 (ThreadUtil)
- 存储令牌服务 (StorageTokenService)
- 主题服务 (ThemeService)

## 许可证

ISC
