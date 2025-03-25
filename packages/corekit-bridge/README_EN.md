# @qlover/corekit-bridge

Abstraction tool bridge for fe-corekit in real development environments

## Introduction

@qlover/corekit-bridge is a bridge library for connecting fe-corekit core tools with actual development environments. It provides a series of utility tools and plugins to simplify the development process of frontend applications.

## Installation

```bash
npm install @qlover/corekit-bridge
```

or

```bash
yarn add @qlover/corekit-bridge
```

## Main Features

### Bootstrap System

A bootstrap system for application initialization and dependency injection:

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

### IOC Container Interface

Provides a standard interface for dependency injection containers:

```typescript
import { IOCContainerInterface } from '@qlover/corekit-bridge';

class MyContainer implements IOCContainerInterface {
  // Implement interface methods
}
```

### API Request Plugins

A series of plugins to enhance API request functionality:

- ApiCatchPlugin: Captures API request errors
- ApiMockPlugin: Provides API mock data functionality
- ApiPickDataPlugin: Extracts data from responses
- RequestCommonPlugin: Handles common request configurations

```typescript
import { ApiMockPlugin, ApiCatchPlugin } from '@qlover/corekit-bridge';

const mockPlugin = new ApiMockPlugin(mockData, logger);
const catchPlugin = new ApiCatchPlugin(logger, errorCatcher);
```

### Build Tools

Provides a series of useful build and configuration tools:

#### Tailwind 10px Root Font Size Configuration

```typescript
import tailwindRoot10px from '@qlover/corekit-bridge/build/tw-root10px';

// Use in tailwind.config.js
module.exports = {
  theme: {
    ...tailwindRoot10px.themes
  },
  plugins: [tailwindRoot10px.plugin]
};
```

#### Vite Environment Configuration Plugin

```typescript
import viteEnvConfig from '@qlover/corekit-bridge/build/vite-env-config';

// Use in vite.config.js
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

#### TypeScript to Localization Files Conversion Tool

```typescript
import viteTs2Locales from '@qlover/corekit-bridge/build/vite-ts-to-locales';

// Use in vite.config.js
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

### Color Logger

Provides console log output with colors:

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

logger.debug('Debug information');
logger.info('Normal information');
```

## Other Tools

- Thread Utils (ThreadUtil)
- Storage Token Service (StorageTokenService)
- Theme Service (ThemeService)

## License

ISC
