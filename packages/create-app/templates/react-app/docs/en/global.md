# Browser Global Variable Injection

## What is Global Variable Injection?

Global variable injection is a crucial feature of Bootstrap that allows us to inject core services and utilities into the browser's global environment, making them accessible from anywhere.

**In simple terms**: Just like putting commonly used tools in a toolbox, we place the application's core functionalities (logging, storage, configuration, etc.) into the browser's global environment, making them easily accessible from anywhere.

## How It Works

### 1. Global Variable Injection Process

```
App Start → Bootstrap Initialization → InjectGlobal Plugin → Inject into window Object → Globally Accessible
```

### 2. Core Technology Stack

- **@qlover/corekit-bridge**: Provides InjectGlobal plugin
- **TypeScript**: Provides type safety
- **Browser Global Object**: window or globalThis

### 3. File Structure

```
config/
├── common.ts               # Global variable name configuration
src/
├── core/
│   ├── globals.ts              # Global variable definitions
│   └── bootstraps/
│       └── BootstrapApp.ts     # Bootstrap configuration
├── base/
│   └── types/
│       └── global.d.ts         # Global type declarations
```

## Implementation in Project

### 1. Global Variable Definition

```tsx
// src/core/globals.ts
import { Logger, ConsoleHandler, ColorFormatter } from '@qlover/corekit-bridge';
import { AppConfig } from '@/base/cases/AppConfig';
import { DialogHandler } from '@/base/cases/DialogHandler';

// Application configuration
export const appConfig = new AppConfig();

// Dialog handler
export const dialogHandler = new DialogHandler();

// Global logger
export const logger = new Logger({
  handlers: new ConsoleHandler(new ColorFormatter(loggerStyles)),
  silent: isProduction,
  level: 'debug'
});

// JSON serializer
export const JSON = new JSONSerializer();

// Local storage
export const localStorage = new SyncStorage(new ObjectStorage(), [
  JSON,
  new Base64Serializer(),
  window.localStorage
]);

// Encrypted storage
export const localStorageEncrypt = localStorage;

// Cookie storage
export const cookieStorage = new CookieStorage();
```

### 2. Global Type Declaration

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

### 3. Injection Configuration in Bootstrap

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
    sources: globals, // Global variable source
    target: browserGlobalsName // Injection target name
  }
});
```

### 4. Global Variable Name Configuration

```tsx
// config/common.ts
export const browserGlobalsName = 'feGlobals';
```

## InjectGlobal Plugin Working Principle

### 1. Plugin Implementation

```tsx
// corekit-bridge/src/core/bootstrap/plugins/InjectGlobal.ts
export class InjectGlobal implements BootstrapExecutorPlugin {
  readonly pluginName = 'InjectGlobal';

  constructor(protected config: InjectGlobalConfig) {}

  onBefore(context: BootstrapContext): void {
    const { sources, target } = this.config;

    // If target is string, inject into root object
    if (typeof target === 'string') {
      Object.assign(context.parameters.root!, {
        [target]: Object.freeze(Object.assign({}, sources))
      });
      return;
    }

    // If target is object, inject directly into target object
    const _target = target || context.parameters.root;

    if (typeof _target !== 'object' || _target === null) {
      throw new Error('target must be an object');
    }

    // Inject global variables into target object
    for (const key in sources) {
      const element = sources[key];
      Object.assign(_target, { [key]: element });
    }
  }
}
```

### 2. Injection Process

```tsx
// Before injection
window = {
  // Browser native properties
  location: {...},
  document: {...},
  // Other browser properties
}

// After injection
window = {
  // Browser native properties
  location: {...},
  document: {...},
  // Injected global variables
  feGlobals: {
    appConfig: AppConfig,
    logger: Logger,
    localStorage: SyncStorage,
    dialogHandler: DialogHandler,
    // ... other global variables
  }
}
```

## Usage in Code

### 1. Direct Access to Global Variables

```tsx
// Accessible from anywhere
function someFunction() {
  // Access global logger
  window.feGlobals.logger.info('This is a log message');

  // Access application configuration
  const appName = window.feGlobals.appConfig.appName;

  // Access local storage
  window.feGlobals.localStorage.set('key', 'value');

  // Access dialog handler
  window.feGlobals.dialogHandler.showMessage('Hello World');
}
```

### 2. Using in Components

```tsx
import React from 'react';

function MyComponent() {
  const handleClick = () => {
    // Use global logger
    window.feGlobals.logger.info('User clicked button');

    // Use global dialog
    window.feGlobals.dialogHandler.showMessage('Operation successful');
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### 3. Using in Services

```tsx
@injectable()
export class SomeService {
  async doSomething() {
    // Use global logger to record operation
    window.feGlobals.logger.info('Starting operation');

    try {
      // Business logic
      const result = await this.performOperation();

      // Use global dialog to show result
      window.feGlobals.dialogHandler.showMessage('Operation complete');

      return result;
    } catch (error) {
      // Use global logger to record error
      window.feGlobals.logger.error('Operation failed:', error);
      throw error;
    }
  }
}
```

### 4. Using in Utility Functions

```tsx
// utils/helper.ts
export function saveUserData(data: any) {
  try {
    // Use global storage
    window.feGlobals.localStorage.set('userData', data);

    // Use global logger
    window.feGlobals.logger.info('User data saved');

    return true;
  } catch (error) {
    window.feGlobals.logger.error('Failed to save user data:', error);
    return false;
  }
}
```

## Practical Application Scenarios

### 1. Debugging and Development

```tsx
// Debug in browser console
console.log('App config:', window.feGlobals.appConfig);
console.log('Current user:', window.feGlobals.localStorage.get('userData'));

// Manually trigger logs
window.feGlobals.logger.debug('Debug information');

// Manually show dialog
window.feGlobals.dialogHandler.showMessage('Test message');
```

### 2. Error Handling and Monitoring

```tsx
// Global error handling
window.addEventListener('error', (event) => {
  window.feGlobals.logger.error('Global error:', event.error);
});

// Unhandled Promise rejection
window.addEventListener('unhandledrejection', (event) => {
  window.feGlobals.logger.error('Unhandled Promise rejection:', event.reason);
});
```

### 3. Third-party Library Integration

```tsx
// Integrate with third-party library
import thirdPartyLib from 'third-party-lib';

// Configure third-party library to use our global services
thirdPartyLib.configure({
  logger: window.feGlobals.logger,
  storage: window.feGlobals.localStorage,
  dialog: window.feGlobals.dialogHandler
});
```

### 4. Browser Extension Development

```tsx
// Use in browser extension
if (window.feGlobals) {
  // Extension can access application's global services
  const appConfig = window.feGlobals.appConfig;
  const logger = window.feGlobals.logger;

  // Execute extension logic
  logger.info('Browser extension loaded');
}
```

## Best Practices

### 1. Global Variable Design Principles

```tsx
// ✅ Good design: only expose core services
export const globals = {
  appConfig, // Application configuration
  logger, // Logging service
  localStorage, // Storage service
  dialogHandler // Dialog service
  // Other core services...
};

// ❌ Bad design: exposing too many details
export const globals = {
  appConfig,
  logger,
  localStorage,
  dialogHandler,
  // Implementation details that shouldn't be exposed
  internalService,
  privateHelper,
  implementationDetail
};
```

### 2. Type Safety

```tsx
// Ensure global variables have correct types
declare global {
  interface Window {
    feGlobals: {
      appConfig: AppConfig;
      logger: LoggerInterface;
      localStorage: SyncStorageInterface<string, string>;
      dialogHandler: DialogHandler;
      // Types for other global variables...
    };
  }
}
```

### 3. Read-only Access

```tsx
// Use Object.freeze to ensure global variables can't be modified
Object.assign(context.parameters.root!, {
  [target]: Object.freeze(Object.assign({}, sources))
});
```

### 4. Namespace Isolation

```tsx
// Use namespace to avoid conflicts
export const browserGlobalsName = 'feGlobals'; // instead of 'globals'

// Create namespace on window
window.feGlobals = {
  // Our global variables
};
```

## Debugging and Troubleshooting

### 1. Check Global Variable Injection

```tsx
// Check in browser console
console.log('Global variables:', window.feGlobals);
console.log('App config:', window.feGlobals?.appConfig);
console.log('Logger:', window.feGlobals?.logger);
```

### 2. Common Issues

**Issue 1: Global Variables Not Injected**

```tsx
// Check Bootstrap configuration
const bootstrap = new Bootstrap({
  globalOptions: {
    sources: globals, // Ensure sources is correct
    target: browserGlobalsName // Ensure target is correct
  }
});
```

**Issue 2: Type Errors**

```tsx
// Check type declarations
declare global {
  interface Window {
    [browserGlobalsName]: Readonly<typeof feGlobals>;
  }
}
```

**Issue 3: Global Variables Modified**

```tsx
// Ensure using Object.freeze
Object.freeze(Object.assign({}, sources));
```

### 3. Debugging Tools

```tsx
// Create debugging tool
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

// Use in development environment
if (import.meta.env.DEV) {
  GlobalDebugger.logGlobals();
}
```

## Security Considerations

### 1. Avoid Sensitive Information

```tsx
// ❌ Don't expose sensitive information
export const globals = {
  appConfig,
  logger,
  // Don't expose API keys, passwords, or other sensitive information
  apiKey: 'secret_key', // Dangerous!
  password: 'password' // Dangerous!
};

// ✅ Only expose necessary services
export const globals = {
  appConfig,
  logger,
  localStorage,
  dialogHandler
  // No sensitive information
};
```

### 2. Access Control

```tsx
// Restrict certain features in production
if (import.meta.env.PROD) {
  // Disable debug features
  window.feGlobals.logger.setLevel('warn');
}
```

### 3. Namespace Isolation

```tsx
// Use specific namespace to avoid conflicts
export const browserGlobalsName = 'feGlobals'; // instead of generic 'globals'
```

## Summary

The global variable injection system provides:

1. **Global Access**: Core services accessible from anywhere
2. **Type Safety**: Type checking through TypeScript
3. **Debugging Convenience**: Direct debugging in browser console
4. **Third-party Integration**: Easy integration with third-party libraries
5. **Development Experience**: Improved development efficiency and debugging experience

Through proper use of global variable injection, core application services can be conveniently accessed from anywhere while maintaining code cleanliness and type safety.
