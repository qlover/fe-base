# 浏览器全局变量注入

## 什么是全局变量注入？

全局变量注入是 Bootstrap 的一个重要功能，它允许我们将应用的核心服务和工具注入到浏览器的全局环境中，方便在任何地方访问。

**简单来说**：就像把常用的工具放在工具箱里一样，我们把应用的核心功能（日志、存储、配置等）放到浏览器的全局环境中，这样在任何地方都能方便地使用。

## 工作原理

### 1. 全局变量注入流程

```
应用启动 → Bootstrap 初始化 → InjectGlobal 插件 → 注入到 window 对象 → 全局可访问
```

### 2. 核心技术栈

- **@qlover/corekit-bridge**：提供 InjectGlobal 插件
- **TypeScript**：提供类型安全
- **浏览器全局对象**：window 或 globalThis

### 3. 文件结构

```
config/
├── common.ts               # 全局变量名称配置
src/
├── core/
│   ├── globals.ts              # 全局变量定义
│   └── bootstraps/
│       └── BootstrapApp.ts     # Bootstrap 配置
├── base/
│   └── types/
│       └── global.d.ts         # 全局类型声明
└── config/
    └── common.ts               # 全局变量名称配置
```

## 项目中的实现

### 1. 全局变量定义

```tsx
// src/core/globals.ts
import { Logger, ConsoleHandler, ColorFormatter } from '@qlover/corekit-bridge';
import { AppConfig } from '@/base/cases/AppConfig';
import { DialogHandler } from '@/base/cases/DialogHandler';

// 应用配置
export const appConfig = new AppConfig();

// 对话框处理器
export const dialogHandler = new DialogHandler();

// 全局日志器
export const logger = new Logger({
  handlers: new ConsoleHandler(new ColorFormatter(loggerStyles)),
  silent: isProduction,
  level: 'debug'
});

// JSON 序列化器
export const JSON = new JSONSerializer();

// 本地存储
export const localStorage = new SyncStorage(new ObjectStorage(), [
  JSON,
  new Base64Serializer(),
  window.localStorage
]);

// 加密存储
export const localStorageEncrypt = localStorage;

// Cookie 存储
export const cookieStorage = new CookieStorage();
```

### 2. 全局类型声明

```tsx
// src/base/types/global.d.ts
import * as feGlobals from '@/core/globals';
import type { browserGlobalsName } from '@config/common';

declare global {
  interface Window {
    [browserGlobalsName]: Readonly<typeof feGlobals>;
  }
}
```

### 3. Bootstrap 中的注入配置

```tsx
// src/core/bootstraps/BootstrapApp.ts
import { Bootstrap } from '@qlover/corekit-bridge';
import { browserGlobalsName } from '@config/common';
import * as globals from '../globals';

const bootstrap = new Bootstrap({
  root: window,
  logger,
  ioc: {
    manager: IOC,
    register: new IocRegisterImpl({ pathname, appConfig })
  },
  globalOptions: {
    sources: globals, // 全局变量源
    target: browserGlobalsName // 注入目标名称
  }
});
```

### 4. 全局变量名称配置

```tsx
// config/common.ts
export const browserGlobalsName = 'feGlobals';
```

## InjectGlobal 插件工作原理

### 1. 插件实现

```tsx
// corekit-bridge/src/core/bootstrap/plugins/InjectGlobal.ts
export class InjectGlobal implements BootstrapExecutorPlugin {
  readonly pluginName = 'InjectGlobal';

  constructor(protected config: InjectGlobalConfig) {}

  onBefore(context: BootstrapContext): void {
    const { sources, target } = this.config;

    // 如果 target 是字符串，注入到 root 对象
    if (typeof target === 'string') {
      Object.assign(context.parameters.root!, {
        [target]: Object.freeze(Object.assign({}, sources))
      });
      return;
    }

    // 如果 target 是对象，直接注入到目标对象
    const _target = target || context.parameters.root;

    if (typeof _target !== 'object' || _target === null) {
      throw new Error('target must be an object');
    }

    // 注入全局变量到目标对象
    for (const key in sources) {
      const element = sources[key];
      Object.assign(_target, { [key]: element });
    }
  }
}
```

### 2. 注入过程

```tsx
// 注入前
window = {
  // 浏览器原生属性
  location: {...},
  document: {...},
  // 其他浏览器属性
}

// 注入后
window = {
  // 浏览器原生属性
  location: {...},
  document: {...},
  // 注入的全局变量
  feGlobals: {
    appConfig: AppConfig,
    logger: Logger,
    localStorage: SyncStorage,
    dialogHandler: DialogHandler,
    // ... 其他全局变量
  }
}
```

## 在代码中使用

### 1. 直接访问全局变量

```tsx
// 在任何地方都可以直接访问
function someFunction() {
  // 访问全局日志器
  window.feGlobals.logger.info('这是一条日志');

  // 访问应用配置
  const appName = window.feGlobals.appConfig.appName;

  // 访问本地存储
  window.feGlobals.localStorage.set('key', 'value');

  // 访问对话框处理器
  window.feGlobals.dialogHandler.showMessage('Hello World');
}
```

### 2. 在组件中使用

```tsx
import React from 'react';

function MyComponent() {
  const handleClick = () => {
    // 使用全局日志器
    window.feGlobals.logger.info('用户点击了按钮');

    // 使用全局对话框
    window.feGlobals.dialogHandler.showMessage('操作成功');
  };

  return <button onClick={handleClick}>点击我</button>;
}
```

### 3. 在服务中使用

```tsx
@injectable()
export class SomeService {
  async doSomething() {
    // 使用全局日志器记录操作
    window.feGlobals.logger.info('开始执行操作');

    try {
      // 业务逻辑
      const result = await this.performOperation();

      // 使用全局对话框显示结果
      window.feGlobals.dialogHandler.showMessage('操作完成');

      return result;
    } catch (error) {
      // 使用全局日志器记录错误
      window.feGlobals.logger.error('操作失败:', error);
      throw error;
    }
  }
}
```

### 4. 在工具函数中使用

```tsx
// utils/helper.ts
export function saveUserData(data: any) {
  try {
    // 使用全局存储
    window.feGlobals.localStorage.set('userData', data);

    // 使用全局日志器
    window.feGlobals.logger.info('用户数据已保存');

    return true;
  } catch (error) {
    window.feGlobals.logger.error('保存用户数据失败:', error);
    return false;
  }
}
```

## 实际应用场景

### 1. 调试和开发

```tsx
// 在浏览器控制台中调试
console.log('应用配置:', window.feGlobals.appConfig);
console.log('当前用户:', window.feGlobals.localStorage.get('userData'));

// 手动触发日志
window.feGlobals.logger.debug('调试信息');

// 手动显示对话框
window.feGlobals.dialogHandler.showMessage('测试消息');
```

### 2. 错误处理和监控

```tsx
// 全局错误处理
window.addEventListener('error', (event) => {
  window.feGlobals.logger.error('全局错误:', event.error);
});

// 未处理的 Promise 拒绝
window.addEventListener('unhandledrejection', (event) => {
  window.feGlobals.logger.error('未处理的 Promise 拒绝:', event.reason);
});
```

### 3. 第三方库集成

```tsx
// 与第三方库集成
import thirdPartyLib from 'third-party-lib';

// 配置第三方库使用我们的全局服务
thirdPartyLib.configure({
  logger: window.feGlobals.logger,
  storage: window.feGlobals.localStorage,
  dialog: window.feGlobals.dialogHandler
});
```

### 4. 浏览器扩展开发

```tsx
// 在浏览器扩展中使用
if (window.feGlobals) {
  // 扩展可以访问应用的全局服务
  const appConfig = window.feGlobals.appConfig;
  const logger = window.feGlobals.logger;

  // 执行扩展逻辑
  logger.info('浏览器扩展已加载');
}
```

## 最佳实践

### 1. 全局变量设计原则

```tsx
// ✅ 好的设计：只暴露核心服务
export const globals = {
  appConfig, // 应用配置
  logger, // 日志服务
  localStorage, // 存储服务
  dialogHandler // 对话框服务
  // 其他核心服务...
};

// ❌ 不好的设计：暴露太多细节
export const globals = {
  appConfig,
  logger,
  localStorage,
  dialogHandler,
  // 不应该暴露的实现细节
  internalService,
  privateHelper,
  implementationDetail
};
```

### 2. 类型安全

```tsx
// 确保全局变量有正确的类型
declare global {
  interface Window {
    feGlobals: {
      appConfig: AppConfig;
      logger: LoggerInterface;
      localStorage: SyncStorageInterface<string, string>;
      dialogHandler: DialogHandler;
      // 其他全局变量的类型...
    };
  }
}
```

### 3. 只读访问

```tsx
// 使用 Object.freeze 确保全局变量不被修改
Object.assign(context.parameters.root!, {
  [target]: Object.freeze(Object.assign({}, sources))
});
```

### 4. 命名空间隔离

```tsx
// 使用命名空间避免冲突
export const browserGlobalsName = 'feGlobals'; // 而不是 'globals'

// 在 window 上创建命名空间
window.feGlobals = {
  // 我们的全局变量
};
```

## 调试和故障排除

### 1. 检查全局变量注入

```tsx
// 在浏览器控制台中检查
console.log('全局变量:', window.feGlobals);
console.log('应用配置:', window.feGlobals?.appConfig);
console.log('日志器:', window.feGlobals?.logger);
```

### 2. 常见问题

**问题 1：全局变量未注入**

```tsx
// 检查 Bootstrap 配置
const bootstrap = new Bootstrap({
  globalOptions: {
    sources: globals, // 确保 sources 正确
    target: browserGlobalsName // 确保 target 正确
  }
});
```

**问题 2：类型错误**

```tsx
// 检查类型声明
declare global {
  interface Window {
    [browserGlobalsName]: Readonly<typeof feGlobals>;
  }
}
```

**问题 3：全局变量被修改**

```tsx
// 确保使用 Object.freeze
Object.freeze(Object.assign({}, sources));
```

### 3. 调试工具

```tsx
// 创建调试工具
export class GlobalDebugger {
  static logGlobals(): void {
    console.group('Global Variables Debug');
    console.log('feGlobals:', window.feGlobals);
    console.log('AppConfig:', window.feGlobals?.appConfig);
    console.log('Logger:', window.feGlobals?.logger);
    console.log('LocalStorage:', window.feGlobals?.localStorage);
    console.groupEnd();
  }
}

// 在开发环境中使用
if (import.meta.env.DEV) {
  GlobalDebugger.logGlobals();
}
```

## 安全考虑

### 1. 避免敏感信息

```tsx
// ❌ 不要暴露敏感信息
export const globals = {
  appConfig,
  logger,
  // 不要暴露 API 密钥、密码等敏感信息
  apiKey: 'secret_key', // 危险！
  password: 'password' // 危险！
};

// ✅ 只暴露必要的服务
export const globals = {
  appConfig,
  logger,
  localStorage,
  dialogHandler
  // 不包含敏感信息
};
```

### 2. 权限控制

```tsx
// 在生产环境中限制某些功能
if (import.meta.env.PROD) {
  // 禁用调试功能
  window.feGlobals.logger.setLevel('warn');
}
```

### 3. 命名空间隔离

```tsx
// 使用特定的命名空间避免冲突
export const browserGlobalsName = 'feGlobals'; // 而不是通用的 'globals'
```

## 总结

全局变量注入系统提供了：

1. **全局访问**：在任何地方都能访问核心服务
2. **类型安全**：通过 TypeScript 提供类型检查
3. **调试便利**：在浏览器控制台中直接调试
4. **第三方集成**：便于与第三方库集成
5. **开发体验**：提升开发效率和调试体验

通过合理使用全局变量注入，可以让应用的核心服务在任何地方都能方便地访问，同时保持代码的整洁和类型安全。
