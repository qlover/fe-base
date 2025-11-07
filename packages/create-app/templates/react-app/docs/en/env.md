# Environment Variable Management

## 📋 Table of Contents

- [What is Environment Variable Management](#-what-is-environment-variable-management)
- [Why Environment Variables are Needed](#-why-environment-variables-are-needed)
- [How It Works](#-how-it-works)
- [Implementation in the Project](#-implementation-in-the-project)
- [Multi-Environment Configuration](#-multi-environment-configuration)
- [Environment Variable Injection](#-environment-variable-injection)
- [AppConfig Usage](#-appconfig-usage)
- [Advanced Usage](#-advanced-usage)
- [Testing Configuration](#-testing-configuration)
- [Best Practices](#-best-practices)
- [FAQ](#-faq)

---

## 🎯 What is Environment Variable Management

Environment variable management is a core component of the Bootstrap architecture, responsible for using different configurations in different environments (development, testing, production) and passing configurations to the application through **automatic injection**.

### Core Workflow

```
Start App → Vite loads .env files → Bootstrap initializes → Inject env vars to AppConfig → IOC container → App uses them
```

### Key Concepts

```
┌─────────────────────────────────────────────────┐
│  Environment Variable Management System          │
│  ┌───────────────────────────────────────────┐  │
│  │ 1. Vite --mode selects environment        │  │
│  │ 2. Load corresponding .env file           │  │
│  │ 3. envConfig plugin preprocessing         │  │
│  │ 4. Bootstrap injects to AppConfig         │  │
│  │ 5. Register to IOC container              │  │
│  │ 6. App gets config through IOC            │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 🤔 Why Environment Variables are Needed

### Problem: Pain Points of Hard-coded Configuration

#### ❌ Traditional Approach: Configuration Scattered Everywhere

```typescript
// ❌ Problem 1: API address hard-coded in code
function fetchUserInfo() {
  // 😰 Dev and prod API addresses are different, need to change code every time
  return fetch('http://localhost:3000/api/user');
}

// ❌ Problem 2: Configuration scattered across files
function saveToken(token: string) {
  // 😰 Storage key hard-coded, difficult to manage uniformly
  localStorage.setItem('user_token', token);
}

// ❌ Problem 3: Sensitive information directly in code
function callAI(prompt: string) {
  // 😰 API Key directly exposed in code, security risk
  return fetch('https://api.openai.com/v1/chat', {
    headers: {
      Authorization: 'Bearer sk-xxxxxxxxxxxx' // 😰 Dangerous!
    }
  });
}

// ❌ Problem 4: Difficult to switch environments
if (window.location.host === 'localhost:3000') {
  // 😰 Need to manually determine environment
  apiUrl = 'http://localhost:3000/api';
} else if (window.location.host === 'staging.example.com') {
  apiUrl = 'https://api.staging.example.com';
} else {
  apiUrl = 'https://api.production.com';
}
```

**Problem Summary:**

- 😰 **Scattered configuration** - Config spread across multiple files, hard to manage
- 😰 **Difficult to switch environments** - Need to manually modify code or use complex conditions
- 😰 **Security risks** - Sensitive info may be committed to code repository
- 😰 **Hard to test** - Need to mock many hard-coded values when testing
- 😰 **Team collaboration difficulties** - Each developer may have different local configs

#### ✅ Solution: Environment Variables + AppConfig

```typescript
// ✅ 1. Environment variable files (different config for different environments)
// .env.localhost
VITE_API_BASE_URL=http://localhost:3000/api
VITE_AI_API_TOKEN=sk-dev-xxxxx

// .env.staging
VITE_API_BASE_URL=https://api.staging.example.com
VITE_AI_API_TOKEN=sk-staging-xxxxx

// .env.production
VITE_API_BASE_URL=https://api.production.com
VITE_AI_API_TOKEN=sk-prod-xxxxx

// ✅ 2. AppConfig manages configuration uniformly
export class AppConfig {
  readonly feApiBaseUrl = '';  // ← Auto-injected
  readonly aiApiToken = '';    // ← Auto-injected
  readonly userTokenStorageKey = '__fe_user_token__';
}

// ✅ 3. Get config through IOC container
@injectable()
export class UserService {
  constructor(
    @inject(IOCIdentifier.AppConfig) private config: AppConfig
  ) {}

  async fetchUserInfo() {
    // ✅ Get API address from config, automatically adapts to environment
    return fetch(`${this.config.feApiBaseUrl}/user`);
  }
}

// ✅ 4. Switch environments at runtime (no code changes needed)
npm run dev              # localhost environment
npm run dev:staging      # staging environment
npm run build:production # production environment
```

**Advantages:**

- ✅ **Centralized management** - All config managed uniformly in AppConfig
- ✅ **Easy environment switching** - Just switch run command
- ✅ **Secure** - Sensitive info managed through `.env.local`, not committed to repo
- ✅ **Easy to test** - Can easily mock AppConfig when testing
- ✅ **Team-friendly** - Each developer can have their own `.env.local`

---

## ⚙️ How It Works

### Environment Variable Loading Flow

```
┌────────────────────────────────────────────────────────────┐
│ 1. package.json: Define startup commands                   │
│    npm run dev → vite --mode localhost                     │
│    npm run dev:staging → vite --mode staging               │
│    npm run build:production → vite build --mode production │
└──────────────────┬─────────────────────────────────────────┘
                   ↓
┌────────────────────────────────────────────────────────────┐
│ 2. Vite: Load corresponding .env file based on --mode      │
│    --mode localhost → .env.localhost                       │
│    --mode staging → .env.staging                           │
│    --mode production → .env.production                     │
│                                                            │
│    Loading priority: .env.local > .env.[mode] > .env      │
└──────────────────┬─────────────────────────────────────────┘
                   ↓
┌────────────────────────────────────────────────────────────┐
│ 3. vite.config.ts: envConfig plugin preprocessing          │
│    - Inject APP_NAME, APP_VERSION, etc.                   │
│    - Set environment variable prefix (VITE_)               │
└──────────────────┬─────────────────────────────────────────┘
                   ↓
┌────────────────────────────────────────────────────────────┐
│ 4. BootstrapClient: Initialize Bootstrap                   │
│    envOptions: {                                           │
│      target: appConfig,     // Injection target           │
│      source: import.meta.env, // Env var source           │
│      prefix: 'VITE_',       // Prefix                     │
│      blackList: ['env', 'userNodeEnv'] // Blacklist       │
│    }                                                       │
└──────────────────┬─────────────────────────────────────────┘
                   ↓
┌────────────────────────────────────────────────────────────┐
│ 5. InjectEnv plugin: Auto-inject env vars to AppConfig     │
│    - VITE_APP_NAME → appConfig.appName                     │
│    - VITE_FE_API_BASE_URL → appConfig.feApiBaseUrl         │
│    - VITE_AI_API_TOKEN → appConfig.aiApiToken              │
└──────────────────┬─────────────────────────────────────────┘
                   ↓
┌────────────────────────────────────────────────────────────┐
│ 6. IOC container: Register AppConfig                       │
│    container.bind(IOCIdentifier.AppConfig).toConstantValue │
└──────────────────┬─────────────────────────────────────────┘
                   ↓
┌────────────────────────────────────────────────────────────┐
│ 7. App usage: Get config through IOC                       │
│    const config = useIOC('AppConfig');                     │
│    console.log(config.feApiBaseUrl);                       │
└────────────────────────────────────────────────────────────┘
```

### Naming Conversion Rules

Environment variable names are automatically converted to AppConfig property names:

```
VITE_APP_NAME          → appName
VITE_FE_API_BASE_URL   → feApiBaseUrl
VITE_AI_API_TOKEN      → aiApiToken
VITE_USER_TOKEN_STORAGE_KEY → userTokenStorageKey
```

**Conversion Rules:**

1. Remove prefix (`VITE_`)
2. Convert underscore-separated to camelCase
3. Match property name in AppConfig

---

## 🛠️ Implementation in the Project

### 1. Define Startup Commands

```json
// package.json
{
  "scripts": {
    "dev": "vite --mode localhost",
    "dev:staging": "vite --mode staging",
    "dev:prod": "vite --mode production",
    "build": "npm run lint && vite build",
    "build:staging": "npm run lint && vite build --mode staging",
    "build:production": "npm run lint && vite build --mode production"
  }
}
```

**Explanation:**

- `--mode` parameter determines which `.env` file to load
- Development environment: use `localhost` mode
- Staging environment: use `staging` mode
- Production environment: use `production` mode

### 2. Configure Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vitest/config';
import { envPrefix } from './config/common';
import { name, version } from './package.json';
import envConfig from '@qlover/corekit-bridge/build/vite-env-config';

export default defineConfig({
  plugins: [
    // ✅ envConfig plugin: preprocess environment variables
    envConfig({
      envPops: true, // Enable env var processing
      envPrefix, // Env var prefix: 'VITE_'
      records: [
        ['APP_NAME', name], // Inject app name
        ['APP_VERSION', version] // Inject app version
      ]
    })
    // ... other plugins
  ],
  envPrefix: envPrefix, // Vite env var prefix
  server: {
    port: Number(process.env.VITE_SERVER_PORT || 3200)
  }
});
```

**Key Configuration:**

- `envConfig` plugin handles preprocessing of environment variables
- `records` can inject additional variables (like info from package.json)
- `envPrefix` set to `'VITE_'`, only variables with this prefix are exposed to client

### 3. Define Common Configuration

```typescript
// config/common.ts
export const envPrefix = 'VITE_';

/**
 * Bootstrap env var injection blacklist
 * These properties won't be injected from env vars
 */
export const envBlackList = ['env', 'userNodeEnv'];

export const browserGlobalsName = 'feGlobals';
```

### 4. Define AppConfig

```typescript
// src/base/cases/AppConfig.ts
import type { EnvConfigInterface } from '@qlover/corekit-bridge';

/**
 * Application configuration class
 *
 * All properties will be automatically injected with corresponding env var values during Bootstrap initialization
 *
 * Environment variable naming rules:
 * - Property names are converted to UPPER_SNAKE_CASE
 * - Add VITE_ prefix
 *
 * Examples:
 * - appName → VITE_APP_NAME
 * - feApiBaseUrl → VITE_FE_API_BASE_URL
 * - aiApiToken → VITE_AI_API_TOKEN
 */
export class AppConfig implements EnvConfigInterface {
  constructor(
    /**
     * Current environment mode
     * @description Automatically set from Vite's MODE
     */
    readonly env: string = import.meta.env.VITE_USER_NODE_ENV
  ) {}

  /**
   * Application name
   * @description Injected from VITE_APP_NAME environment variable
   */
  readonly appName = '';

  /**
   * Application version
   * @description Injected from VITE_APP_VERSION environment variable
   */
  readonly appVersion = '';

  /**
   * User token storage key
   * @description Injected from VITE_USER_TOKEN_STORAGE_KEY environment variable
   */
  readonly userTokenStorageKey = '__fe_user_token__';

  /**
   * User info storage key
   * @description Injected from VITE_USER_INFO_STORAGE_KEY environment variable
   */
  readonly userInfoStorageKey = '__fe_user_info__';

  /**
   * Frontend API base URL
   * @description Injected from VITE_FE_API_BASE_URL environment variable
   */
  readonly feApiBaseUrl = '';

  /**
   * User API base URL
   * @description Injected from VITE_USER_API_BASE_URL environment variable
   */
  readonly userApiBaseUrl = '';

  /**
   * AI API base URL
   * @description Injected from VITE_AI_API_BASE_URL environment variable
   */
  readonly aiApiBaseUrl = 'https://api.openai.com/v1';

  /**
   * AI API token
   * @description Injected from VITE_AI_API_TOKEN environment variable
   */
  readonly aiApiToken = '';

  /**
   * AI API token prefix
   * @description Injected from VITE_AI_API_TOKEN_PREFIX environment variable
   */
  readonly aiApiTokenPrefix = 'Bearer';

  /**
   * Whether AI API token is required
   * @description Injected from VITE_AI_API_REQUIRE_TOKEN environment variable
   */
  readonly aiApiRequireToken = true;

  /**
   * Default login username
   * @description Injected from VITE_LOGIN_USER environment variable
   */
  readonly loginUser = '';

  /**
   * Default login password
   * @description Injected from VITE_LOGIN_PASSWORD environment variable
   */
  readonly loginPassword = '';

  /**
   * OpenAI available models list
   */
  readonly openAiModels = [
    'gpt-4o-mini',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-2',
    'gpt-4',
    'gpt-4-32k'
  ];

  /**
   * OpenAI API base URL
   * @description Injected from VITE_OPEN_AI_BASE_URL environment variable
   */
  readonly openAiBaseUrl = '';

  /**
   * OpenAI API token
   * @description Injected from VITE_OPEN_AI_TOKEN environment variable
   */
  readonly openAiToken = '';

  /**
   * OpenAI API token prefix
   * @description Injected from VITE_OPEN_AI_TOKEN_PREFIX environment variable
   */
  readonly openAiTokenPrefix = '';

  /**
   * Whether OpenAI API token is required
   * @description Injected from VITE_OPEN_AI_REQUIRE_TOKEN environment variable
   */
  readonly openAiRequireToken = true;

  /**
   * Project startup URL
   * @description Injected from Bootstrap's BOOT_HREF
   */
  readonly bootHref = '';

  /**
   * Whether is production environment
   */
  get isProduction(): boolean {
    return this.env === 'production';
  }
}
```

### 5. Bootstrap Configuration

```typescript
// src/core/bootstraps/BootstrapClient.ts
import { envBlackList, envPrefix, browserGlobalsName } from '@config/common';
import { Bootstrap } from '@qlover/corekit-bridge';
import * as globals from '../globals';

export class BootstrapClient {
  static async main(args: BootstrapClientArgs) {
    const { root, bootHref, ioc, iocRegister } = args;
    const { logger, appConfig } = globals;

    // Create IOC container
    const IOC = ioc.create({
      pathname: bootHref,
      appConfig: appConfig
    });

    // Create Bootstrap instance
    const bootstrap = new Bootstrap({
      root,
      logger,
      ioc: {
        manager: IOC,
        register: iocRegister
      },
      // ✅ Environment variable injection configuration
      envOptions: {
        target: appConfig, // Injection target: AppConfig instance
        source: Object.assign({}, import.meta.env, {
          [envPrefix + 'BOOT_HREF']: bootHref // Additionally inject startup URL
        }),
        prefix: envPrefix, // Env var prefix: 'VITE_'
        blackList: envBlackList // Blacklist: ['env', 'userNodeEnv']
      },
      // Global variable encapsulation configuration
      globalOptions: {
        sources: globals,
        target: browserGlobalsName
      }
    });

    try {
      logger.info('bootstrap start...');

      // ✅ Initialize Bootstrap (env var injection executes here)
      await bootstrap.initialize();

      // Register business plugins
      const bootstrapsRegistry = new BootstrapsRegistry(IOC);
      await bootstrap.use(bootstrapsRegistry.register()).start();

      logger.info('bootstrap completed successfully');
    } catch (error) {
      logger.error(`${appConfig.appName} startup error:`, error);
    }

    return args;
  }
}
```

**Key Flow:**

1. `appConfig` is an AppConfig instance with default values for all properties
2. `bootstrap.initialize()` executes the `InjectEnv` plugin
3. `InjectEnv` plugin iterates through `appConfig` properties, looking for corresponding env vars in `import.meta.env`
4. If an env var is found and value is not empty, it overwrites the default value
5. Finally `appConfig` is registered to the IOC container

---

## 🌍 Multi-Environment Configuration

### Environment File Structure

```
Project root/
├── .env                    # Default config (shared across all environments)
├── .env.localhost          # Local development environment
├── .env.staging            # Staging environment
├── .env.production         # Production environment
├── .env.local              # Local override config (not committed to git)
└── .env.template           # Env var template (committed to git)
```

### Loading Priority

```
.env.local > .env.[mode] > .env
```

**Example:**

```bash
# Run: npm run dev (vite --mode localhost)
# Loading order:
# 1. .env.local      # Highest priority
# 2. .env.localhost  # Second
# 3. .env            # Last

# Run: npm run build:production (vite build --mode production)
# Loading order:
# 1. .env.local
# 2. .env.production
# 3. .env
```

### Example 1: Default Configuration

```bash
# .env
# Configuration shared across all environments

VITE_APP_NAME=MyApp
VITE_USER_TOKEN_STORAGE_KEY=__fe_user_token__
VITE_USER_INFO_STORAGE_KEY=__fe_user_info__
VITE_AI_API_TOKEN_PREFIX=Bearer
VITE_AI_API_REQUIRE_TOKEN=true
```

### Example 2: Local Development Environment

```bash
# .env.localhost
# Local development environment config

# API configuration
VITE_FE_API_BASE_URL=http://localhost:3000/api
VITE_USER_API_BASE_URL=http://localhost:3000/api/user
VITE_AI_API_BASE_URL=http://localhost:3001/v1

# AI configuration (dev environment may use local Mock)
VITE_AI_API_TOKEN=sk-dev-xxxxx
VITE_AI_API_REQUIRE_TOKEN=false

# Debug configuration
VITE_LOG_LEVEL=debug
VITE_DEBUG=true

# Default login info (convenient for development)
VITE_LOGIN_USER=admin
VITE_LOGIN_PASSWORD=admin123
```

### Example 3: Staging Environment

```bash
# .env.staging
# Staging environment config

# API configuration
VITE_FE_API_BASE_URL=https://api.staging.example.com
VITE_USER_API_BASE_URL=https://api.staging.example.com/user
VITE_AI_API_BASE_URL=https://api.staging.example.com/ai

# AI configuration
VITE_AI_API_TOKEN=sk-staging-xxxxx
VITE_AI_API_REQUIRE_TOKEN=true

# Debug configuration
VITE_LOG_LEVEL=info
VITE_DEBUG=true
```

### Example 4: Production Environment

```bash
# .env.production
# Production environment config

# API configuration
VITE_FE_API_BASE_URL=https://api.example.com
VITE_USER_API_BASE_URL=https://api.example.com/user
VITE_AI_API_BASE_URL=https://api.openai.com/v1

# AI configuration
VITE_AI_API_TOKEN=sk-prod-xxxxx
VITE_AI_API_REQUIRE_TOKEN=true

# Debug configuration
VITE_LOG_LEVEL=error
VITE_DEBUG=false
```

### Example 5: Local Override Configuration

```bash
# .env.local
# Local personal config, not committed to git

# Override AI API Token (use your own key)
VITE_AI_API_TOKEN=sk-my-personal-key

# Override API address (connect to your local service)
VITE_FE_API_BASE_URL=http://192.168.1.100:3000/api

# Enable specific features
VITE_ENABLE_EXPERIMENTAL_FEATURES=true
```

### Example 6: Environment Variable Template

```bash
# .env.template
# Env var template, committed to git for team reference

# ===== Required Configuration =====
VITE_FE_API_BASE_URL=https://your-api-url.com
VITE_AI_API_TOKEN=your-ai-api-token-here

# ===== Optional Configuration =====
VITE_LOGIN_USER=your-default-username
VITE_LOGIN_PASSWORD=your-default-password

# ===== Instructions =====
# 1. Copy this file as .env.local
# 2. Fill in actual configuration values
# 3. .env.local won't be committed to git
```

---

## 🔄 Environment Variable Injection

### InjectEnv Plugin Working Principle

```typescript
// @qlover/corekit-bridge/src/core/bootstrap/plugins/InjectEnv.ts (simplified)
export class InjectEnv implements BootstrapExecutorPlugin {
  readonly pluginName = 'InjectEnv';

  constructor(protected options: InjectEnvConfig) {}

  /**
   * Execute before Bootstrap initialization
   */
  onBefore(): void {
    const { target, source, prefix, blackList } = this.options;

    // Iterate through all properties of target object
    for (const key in target) {
      // Skip properties in blacklist
      if (blackList.includes(key)) {
        continue;
      }

      const currentValue = target[key as keyof typeof target];

      // Get corresponding env var value
      const envValue = this.getEnvValue(key, currentValue);

      // If env var exists and differs from default value, inject it
      if (!this.isEmpty(envValue) && envValue !== currentValue) {
        target[key as keyof typeof target] = envValue;
      }
    }
  }

  /**
   * Get environment variable value
   */
  private getEnvValue<D>(key: string, defaultValue?: D): D {
    const { prefix = '', source = {} } = this.options;

    // Convert camelCase to UPPER_SNAKE_CASE
    // appName → APP_NAME
    // feApiBaseUrl → FE_API_BASE_URL
    const formattedKey = key.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();

    // Add prefix
    const envKey = `${prefix}${formattedKey}`;

    // Get env var value
    const value = source[envKey];

    // If it's a JSON string, parse it
    if (typeof value === 'string' && this.isJSONString(value)) {
      return JSON.parse(value);
    }

    return (value ?? defaultValue) as D;
  }

  /**
   * Check if value is empty
   */
  private isEmpty(value: any): boolean {
    return value === undefined || value === null || value === '';
  }

  /**
   * Check if it's a JSON string
   */
  private isJSONString(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
}
```

### Injection Example

```typescript
// Assuming the following environment variables:
VITE_APP_NAME=MyApp
VITE_FE_API_BASE_URL=https://api.example.com
VITE_AI_API_TOKEN=sk-xxxxx

// AppConfig initial state:
const appConfig = new AppConfig();
console.log(appConfig.appName);        // ''
console.log(appConfig.feApiBaseUrl);   // ''
console.log(appConfig.aiApiToken);     // ''

// After Bootstrap initialization (after InjectEnv plugin execution):
await bootstrap.initialize();

console.log(appConfig.appName);        // 'MyApp'
console.log(appConfig.feApiBaseUrl);   // 'https://api.example.com'
console.log(appConfig.aiApiToken);     // 'sk-xxxxx'
```

---

## 📦 AppConfig Usage

### 1. Use in Services (Recommended) ⭐

```typescript
// src/base/services/UserService.ts
import { injectable, inject } from 'inversify';
import { IOCIdentifier } from '@config/IOCIdentifier';
import type { AppConfig } from '@/base/cases/AppConfig';

@injectable()
export class UserService {
  constructor(
    @inject(IOCIdentifier.AppConfig) private config: AppConfig,
    @inject(UserApi) private api: UserApi
  ) {}

  async login(username: string, password: string) {
    // ✅ Use API address from config
    const response = await this.api.post(
      `${this.config.userApiBaseUrl}/login`,
      { username, password }
    );

    // ✅ Use storage key from config
    this.storage.setItem(this.config.userTokenStorageKey, response.token);

    return response.user;
  }
}
```

### 2. Use in UI Components

```typescript
// src/pages/base/HomePage.tsx
import { useIOC } from '@/uikit/hooks/useIOC';

function HomePage() {
  // ✅ Get config through Hook
  const config = useIOC('AppConfig');

  return (
    <div>
      <h1>{config.appName}</h1>
      <p>Version: {config.appVersion}</p>
      <p>Environment: {config.env}</p>
      {!config.isProduction && <p>🚧 Development Mode</p>}
    </div>
  );
}
```

### 3. Use in Plugins

```typescript
// src/base/apis/feApi/FeApiBootstrap.ts
export class FeApiBootstarp implements BootstrapExecutorPlugin {
  readonly pluginName = 'FeApiBootstarp';

  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    const feApi = ioc.get<FeApi>(FeApi);
    // ✅ Get config from IOC
    const config = ioc.get<AppConfig>(IOCIdentifier.AppConfig);

    // ✅ Use config to set API base URL
    feApi.setBaseURL(config.feApiBaseUrl);

    // Add other plugins
    feApi.usePlugin(
      new AuthTokenPlugin({
        getToken: () => {
          const storage = ioc.get(IOCIdentifier.LocalStorageEncrypt);
          return storage.getItem(config.userTokenStorageKey);
        }
      })
    );
  }
}
```

### 4. Use Environment Variables Directly in Code

```typescript
// Note: Using import.meta.env directly is not recommended as it can't be managed by IOC

// ❌ Not recommended: Direct use (bypasses AppConfig)
function MyComponent() {
  const apiUrl = import.meta.env.VITE_FE_API_BASE_URL;
  // ...
}

// ✅ Recommended: Use through AppConfig
function MyComponent() {
  const config = useIOC('AppConfig');
  const apiUrl = config.feApiBaseUrl;
  // ...
}
```

---

## 🚀 Advanced Usage

### 1. Dynamically Modify Configuration

Sometimes you may need to dynamically modify configuration at runtime (rather than through environment variables):

```typescript
// ✅ Method 1: Modify before Bootstrap initialization
const appConfig = new AppConfig();

// Dynamically modify config
if (window.location.hostname.includes('localhost')) {
  // Use different API address for local development
  (appConfig as any).feApiBaseUrl = 'http://localhost:3000/api';
}

// Then pass to Bootstrap
const bootstrap = new Bootstrap({
  envOptions: {
    target: appConfig, // Use modified config
    source: import.meta.env,
    prefix: 'VITE_',
    blackList: envBlackList
  }
});

await bootstrap.initialize();
```

```typescript
// ✅ Method 2: Create config factory function
export function createAppConfig(): AppConfig {
  const config = new AppConfig();

  // Dynamically set config based on specific conditions
  if (someCondition) {
    (config as any).aiApiBaseUrl = 'https://custom-api.com';
  }

  return config;
}

// Use in Bootstrap
const appConfig = createAppConfig();
```

### 2. Configuration Validation

```typescript
// src/base/cases/AppConfig.ts
export class AppConfig implements EnvConfigInterface {
  // ... property definitions

  /**
   * Validate required configuration items
   */
  validate(): void {
    const required: (keyof AppConfig)[] = [
      'appName',
      'feApiBaseUrl',
      'userTokenStorageKey'
    ];

    for (const key of required) {
      if (!this[key]) {
        throw new Error(`Missing required configuration: ${key}`);
      }
    }
  }
}

// Use in Bootstrap
const appConfig = new AppConfig();

await bootstrap.initialize();

// Validate after initialization
appConfig.validate();
```

### 3. Configuration Composition

```typescript
// ✅ Method 3: Compose config from multiple sources
const appConfig = new AppConfig();

const bootstrap = new Bootstrap({
  envOptions: {
    target: appConfig,
    // Merge multiple config sources
    source: Object.assign(
      {},
      import.meta.env, // Vite environment variables
      { VITE_BOOT_HREF: window.location.href }, // Runtime info
      window.__APP_CONFIG__ // Server-injected config
    ),
    prefix: 'VITE_',
    blackList: envBlackList
  }
});
```

### 4. Conditional Configuration

```typescript
// src/core/bootstraps/BootstrapClient.ts
const appConfig = new AppConfig();

// ✅ Set different config sources based on environment
const configSource =
  import.meta.env.VITE_USER_NODE_ENV === 'production'
    ? import.meta.env // Production: only use env vars
    : {
        ...import.meta.env,
        ...window.__DEV_CONFIG__ // Development: allow window injection
      };

const bootstrap = new Bootstrap({
  envOptions: {
    target: appConfig,
    source: configSource,
    prefix: 'VITE_',
    blackList: envBlackList
  }
});
```

---

## 🧪 Testing Configuration

### 1. Mock AppConfig in Tests

```typescript
// __tests__/src/base/services/UserService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '@/base/services/UserService';
import type { AppConfig } from '@/base/cases/AppConfig';

describe('UserService', () => {
  let userService: UserService;
  let mockConfig: AppConfig;

  beforeEach(() => {
    // ✅ Create mock config
    mockConfig = {
      userApiBaseUrl: 'http://localhost:3000/api',
      userTokenStorageKey: '__test_token__',
      userInfoStorageKey: '__test_user__',
      isProduction: false
    } as AppConfig;

    // Create service
    userService = new UserService(mockConfig, mockApi, mockStorage);
  });

  it('should use config values', async () => {
    await userService.login('user', 'pass');

    // ✅ Verify config values were used
    expect(mockApi.post).toHaveBeenCalledWith(
      `${mockConfig.userApiBaseUrl}/login`,
      expect.any(Object)
    );
  });
});
```

### 2. Test Different Environment Configurations

```typescript
// __tests__/src/base/cases/AppConfig.test.ts
import { describe, it, expect } from 'vitest';
import { AppConfig } from '@/base/cases/AppConfig';

describe('AppConfig', () => {
  it('should detect production environment', () => {
    const config = new AppConfig('production');
    expect(config.isProduction).toBe(true);
  });

  it('should detect non-production environment', () => {
    const config = new AppConfig('localhost');
    expect(config.isProduction).toBe(false);
  });

  it('should have default values', () => {
    const config = new AppConfig();
    expect(config.appName).toBe('');
    expect(config.userTokenStorageKey).toBe('__fe_user_token__');
  });
});
```

### 3. Test Environment Variable Injection

```typescript
// __tests__/src/core/bootstraps/BootstrapClient.test.ts
import { describe, it, expect, vi } from 'vitest';
import { BootstrapClient } from '@/core/bootstraps/BootstrapClient';

describe('BootstrapClient', () => {
  it('should inject environment variables to AppConfig', async () => {
    const mockArgs = {
      root: {},
      bootHref: 'http://localhost:3000',
      ioc: {
        create: vi.fn().mockReturnValue(mockIOC)
      }
    };

    // Execute startup
    await BootstrapClient.main(mockArgs);

    // ✅ Verify config was injected
    const globals = (mockArgs.root as any).feGlobals;
    expect(globals.appConfig).toBeDefined();
    expect(globals.appConfig.appName).toBeTruthy();
  });
});
```

---

## 💎 Best Practices

### 1. ✅ Use Environment Variable Prefix

```bash
# ✅ Good naming: Use VITE_ prefix
VITE_APP_NAME=MyApp
VITE_API_BASE_URL=https://api.example.com

# ❌ Wrong naming: No prefix
APP_NAME=MyApp
API_BASE_URL=https://api.example.com
```

### 2. ✅ Use .env.local for Sensitive Information

```bash
# .env.local (not committed to git)
VITE_AI_API_TOKEN=sk-your-secret-key
VITE_DATABASE_PASSWORD=your-password

# .gitignore
.env.local
```

### 3. ✅ Provide .env.template

```bash
# .env.template (committed to git)
# Team members can copy this file as .env.local and fill in actual values

VITE_AI_API_TOKEN=your-api-token-here
VITE_DATABASE_PASSWORD=your-password-here
```

### 4. ✅ Use Type-safe Configuration

```typescript
// ✅ Good practice: Access through AppConfig
const config = useIOC('AppConfig');
const apiUrl = config.feApiBaseUrl; // ✅ Type-safe

// ❌ Bad practice: Direct access to env vars
const apiUrl = import.meta.env.VITE_FE_API_BASE_URL; // ❌ May be undefined
```

### 5. ✅ Add Comments to AppConfig

```typescript
export class AppConfig {
  /**
   * AI API base URL
   * @description Injected from VITE_AI_API_BASE_URL environment variable
   * @default 'https://api.openai.com/v1'
   * @example 'https://api.openai.com/v1'
   */
  readonly aiApiBaseUrl = 'https://api.openai.com/v1';
}
```

### 6. ✅ Avoid Environment Checks in Code

```typescript
// ❌ Bad: Check environment in code
if (process.env.NODE_ENV === 'production') {
  apiUrl = 'https://api.production.com';
} else {
  apiUrl = 'http://localhost:3000';
}

// ✅ Good: Manage through config
const config = useIOC('AppConfig');
const apiUrl = config.feApiBaseUrl; // Automatically uses correct value based on environment
```

### 7. ✅ Configuration Naming Conventions

```bash
# ✅ Good naming: Clear and specific
VITE_FE_API_BASE_URL=https://api.example.com
VITE_USER_TOKEN_STORAGE_KEY=__fe_user_token__
VITE_AI_API_REQUIRE_TOKEN=true

# ❌ Bad naming: Vague, abbreviated
VITE_API=https://api.example.com
VITE_KEY=__token__
VITE_REQ=true
```

---

## ❓ FAQ

### Q1: Why aren't my environment variables being injected?

**A:** Check the following points:

1. **Environment variable prefix**

```bash
# ✅ Correct: Use VITE_ prefix
VITE_APP_NAME=MyApp

# ❌ Wrong: No prefix
APP_NAME=MyApp
```

2. **AppConfig property name**

```typescript
// ✅ Correct: Property exists
export class AppConfig {
  readonly appName = ''; // ← VITE_APP_NAME will inject here
}

// ❌ Wrong: No corresponding property
export class AppConfig {
  // No appName property, VITE_APP_NAME won't be injected
}
```

3. **Blacklist configuration**

```typescript
// config/common.ts
export const envBlackList = ['env', 'userNodeEnv'];
// Make sure your property is not in the blacklist
```

### Q2: How to use different configurations in different environments?

**A:** Use the `--mode` parameter:

```json
{
  "scripts": {
    "dev": "vite --mode localhost", // Load .env.localhost
    "dev:staging": "vite --mode staging", // Load .env.staging
    "build:prod": "vite build --mode production" // Load .env.production
  }
}
```

### Q3: How to handle sensitive information?

**A:** Use `.env.local`:

```bash
# .env.local (not committed to git)
VITE_AI_API_TOKEN=sk-your-secret-key

# .gitignore
.env.local
```

### Q4: Can configuration be dynamically modified at runtime?

**A:** Yes, but it needs to be done before Bootstrap initialization:

```typescript
const appConfig = new AppConfig();

// ✅ Modify before Bootstrap initialization
(appConfig as any).feApiBaseUrl = 'https://custom-api.com';

const bootstrap = new Bootstrap({
  envOptions: {
    target: appConfig, // Use modified config
    source: import.meta.env,
    prefix: 'VITE_',
    blackList: envBlackList
  }
});

await bootstrap.initialize();
```

### Q5: Why recommend using AppConfig instead of import.meta.env directly?

**A:**

| Feature                    | import.meta.env     | AppConfig                    |
| -------------------------- | ------------------- | ---------------------------- |
| **Type Safety**            | ❌ May be undefined | ✅ Complete type definitions |
| **Default Values**         | ❌ None             | ✅ Has default values        |
| **Testability**            | ❌ Hard to mock     | ✅ Easy to mock              |
| **Centralized Management** | ❌ Scattered        | ✅ Unified management        |
| **Runtime Modification**   | ❌ Not possible     | ✅ Possible                  |

### Q6: What's the difference between environment variables and config files?

**A:**

**Environment variables:** Suitable for:

- Configuration that differs by environment (API addresses, tokens, etc.)
- Sensitive information
- Configuration that needs to be modified during deployment

**Config files (config/):** Suitable for:

- Application logic configuration (routes, themes, i18n, etc.)
- Configuration that doesn't change with environment
- Code-level configuration

---

## 📚 Related Documentation

- [Project Architecture Design](./index.md) - Understand overall architecture
- [Bootstrap Initializer](./bootstrap.md) - Bootstrap details
- [IOC Container](./ioc.md) - Dependency injection details
- [Global Variable Encapsulation](./global.md) - Browser API encapsulation

---

## 🎉 Summary

The environment variable management system, through the combination of **Bootstrap + AppConfig + IOC**, provides:

1. **Environment Isolation** 🌍 - Different environments use different configs, no code changes needed
2. **Type Safety** 🔒 - Complete type checking through TypeScript
3. **Centralized Management** 📦 - All config managed uniformly in AppConfig
4. **Auto Injection** ⚡ - Bootstrap automatically injects env vars to AppConfig
5. **Easy to Test** 🧪 - Can easily mock AppConfig for testing
6. **Flexible Extension** 🚀 - Supports multiple config sources and dynamic modification

Through proper use of environment variable management, you can build a more robust, flexible, and maintainable application architecture.

---

**Feedback:**  
If you have any questions or suggestions about environment variable management, please discuss in the team channel or submit an Issue.
