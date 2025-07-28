# Environment Variables Injection

## What is Environment Variables Injection?

Environment variables injection is a crucial feature of Bootstrap that allows us to automatically inject environment variables into application configuration, enabling centralized configuration management and environment isolation.

**In simple terms**: Just like dressing your application in different clothes, based on different environments (development, testing, production), the application will use different configurations.

## How It Works

### 1. Environment Variables Loading Process

```
App Start → Bootstrap Initialization → InjectEnv Plugin → Load Environment Variables → Inject into AppConfig → App Uses Config
```

### 2. Core Technology Stack

- **@qlover/env-loader**: Environment variables loader
- **@qlover/corekit-bridge/vite-env-config**: Vite environment variables configuration plugin
- **dotenv**: .env file parser
- **Vite**: Frontend build tool

### 3. File Structure

```
Project Root/
├── .env                    # Default environment variables
├── .env.local             # Local environment variables (git ignored)
├── .env.development       # Development environment variables
├── .env.production        # Production environment variables
├── .env.staging          # Testing environment variables
├── vite.config.ts         # Vite configuration
└── src/
    └── base/
        └── cases/
            └── AppConfig.ts # Application configuration class
```

## Environment Variable Files

### 1. File Loading Priority

Vite loads environment variable files in the following priority:

```
.env.local > .env.[mode] > .env
```

**Examples**:

```bash
# Development mode
vite dev --mode development
# Loading order: .env.local > .env.development > .env

# Production mode
vite build --mode production
# Loading order: .env.local > .env.production > .env

# Custom mode
vite dev --mode staging
# Loading order: .env.local > .env.staging > .env
```

### 2. Environment Variable File Examples

```bash
# .env (default configuration)
VITE_APP_NAME=MyApp
VITE_API_BASE_URL=http://api.example.com
VITE_USER_TOKEN_KEY=user_token

# .env.development (development environment)
VITE_API_BASE_URL=http://localhost:3000/api
VITE_DEBUG=true

# .env.production (production environment)
VITE_API_BASE_URL=https://api.production.com
VITE_DEBUG=false

# .env.local (local override, not committed to git)
VITE_API_KEY=your_secret_key
VITE_LOCAL_DEBUG=true
```

## Implementation in Project

### 1. Vite Configuration

```tsx
// vite.config.ts
import envConfig from '@qlover/corekit-bridge/vite-env-config';

export default defineConfig({
  plugins: [
    envConfig({
      envPops: true, // Enable environment variables loading
      envPrefix: 'VITE_', // Environment variables prefix
      records: [
        ['APP_NAME', name], // Inject application name
        ['APP_VERSION', version] // Inject application version
      ]
    })
  ],
  envPrefix: 'VITE_', // Vite environment variables prefix
  server: {
    port: Number(process.env.VITE_SERVER_PORT || 3200)
  }
});
```

### 2. Application Configuration Class

```tsx
// src/base/cases/AppConfig.ts
export class AppConfig implements EnvConfigInterface {
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
   * Current environment mode
   * @description Retrieved from Vite's mode
   */
  readonly env: string = import.meta.env.MODE;

  /**
   * User token storage key
   * @description Injected from VITE_USER_TOKEN_STORAGE_KEY environment variable
   */
  readonly userTokenStorageKey = '__fe_user_token__';

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

  // ... more configuration items
}
```

### 3. Injection in Bootstrap

```tsx
// src/core/bootstraps/BootstrapApp.ts
const bootstrap = new Bootstrap({
  root: window,
  logger,
  ioc: {
    manager: IOC,
    register: new IocRegisterImpl({ pathname, appConfig })
  },
  envOptions: {
    target: appConfig, // Injection target
    source: {
      ...import.meta.env, // Environment variables source
      [envPrefix + 'BOOT_HREF']: root.location.href
    },
    prefix: envPrefix, // Environment variables prefix
    blackList: envBlackList // Blacklist (variables not to inject)
  }
});
```

## Multi-Environment Configuration

### 1. Development Environment Configuration

```bash
# package.json
{
  "scripts": {
    "dev": "vite --mode localhost",
    "dev:staging": "vite --mode staging",
    "dev:prod": "vite --mode production"
  }
}
```

```bash
# .env.development
VITE_APP_NAME=MyApp Dev
VITE_API_BASE_URL=http://localhost:3000/api
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

### 2. Testing Environment Configuration

```bash
# .env.staging
VITE_APP_NAME=MyApp Staging
VITE_API_BASE_URL=https://api.staging.com
VITE_DEBUG=true
VITE_LOG_LEVEL=info
```

### 3. Production Environment Configuration

```bash
# .env.production
VITE_APP_NAME=MyApp
VITE_API_BASE_URL=https://api.production.com
VITE_DEBUG=false
VITE_LOG_LEVEL=warn
```

### 4. Local Override Configuration

```bash
# .env.local (not committed to git)
VITE_API_KEY=your_secret_key
VITE_LOCAL_DEBUG=true
VITE_CUSTOM_FEATURE=true
```

## Usage in Code

### 1. Direct Use of Environment Variables

```tsx
// Using in components directly
function App() {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const isDebug = import.meta.env.VITE_DEBUG === 'true';

  return (
    <div>
      <p>API URL: {apiUrl}</p>
      {isDebug && <p>Debug mode enabled</p>}
    </div>
  );
}
```

### 2. Using Through AppConfig

```tsx
// Getting configuration through IOC
function UserService() {
  const appConfig = IOC(IOCIdentifier.AppConfig);

  const apiUrl = appConfig.aiApiBaseUrl;
  const token = appConfig.aiApiToken;

  // Using configuration for API calls
  const response = await fetch(`${apiUrl}/chat`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
```

### 3. Using in Services

```tsx
@injectable()
export class ApiService {
  constructor(@inject(IOCIdentifier.AppConfig) private appConfig: AppConfig) {}

  async makeRequest() {
    const baseUrl = this.appConfig.aiApiBaseUrl;
    const token = this.appConfig.aiApiToken;

    return fetch(`${baseUrl}/api/endpoint`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}
```

## Environment Variables Injection Plugin

### 1. InjectEnv Plugin Working Principle

```tsx
// corekit-bridge/src/core/bootstrap/plugins/InjectEnv.ts
export class InjectEnv implements BootstrapExecutorPlugin {
  readonly pluginName = 'InjectEnv';

  constructor(protected options: InjectEnvConfig) {}

  onBefore(): void {
    const { target, source, prefix, blackList } = this.options;

    // Iterate through target object properties
    for (const key in target) {
      if (blackList.includes(key)) {
        continue; // Skip properties in blacklist
      }

      const value = target[key as keyof typeof target];
      const envValue = this.env(key, value); // Get environment variable value

      // If environment variable exists and differs from default value, inject it
      if (!this.isEmpty(envValue) && envValue !== value) {
        target[key as keyof typeof target] = envValue;
      }
    }
  }
}
```

### 2. Environment Variable Retrieval Logic

```tsx
env<D>(key: string, defaultValue?: D): D {
  const { prefix = '', source = {} } = this.options;

  // Convert camelCase to SNAKE_CASE
  const formattedKey = key.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
  const envKey = `${prefix}${formattedKey}`;

  const value = source[envKey];

  // If it's a JSON string, parse it
  if (typeof value === 'string' && InjectEnv.isJSONString(value)) {
    return JSON.parse(value);
  }

  return (value ?? defaultValue) as D;
}
```

## Best Practices

### 1. Environment Variable Naming Conventions

```bash
# ✅ Good naming
VITE_APP_NAME=MyApp
VITE_API_BASE_URL=https://api.example.com
VITE_USER_TOKEN_STORAGE_KEY=user_token
VITE_DEBUG=true

# ❌ Bad naming
VITE_app_name=MyApp
VITE_API_BASE_URL=https://api.example.com
VITE_USER_TOKEN_STORAGE_KEY=user_token
VITE_DEBUG=true
```

### 2. Sensitive Information Handling

```bash
# .env.local (not committed to git)
VITE_API_KEY=your_secret_key
VITE_DATABASE_PASSWORD=your_password

# .env.template (committed to git, as template)
VITE_API_KEY=your_api_key_here
VITE_DATABASE_PASSWORD=your_password_here
```

### 3. Type Safety

```tsx
// Define environment variables type
interface EnvVariables {
  VITE_APP_NAME: string;
  VITE_API_BASE_URL: string;
  VITE_DEBUG: boolean;
  VITE_PORT: number;
}

// Use in AppConfig
export class AppConfig implements EnvConfigInterface {
  readonly appName: string = '';
  readonly apiBaseUrl: string = '';
  readonly debug: boolean = false;
  readonly port: number = 3000;
}
```

### 4. Environment Variables Validation

```tsx
// Validate required environment variables at application startup
export class AppConfig implements EnvConfigInterface {
  constructor() {
    this.validateRequiredEnvVars();
  }

  private validateRequiredEnvVars(): void {
    const required = ['VITE_API_BASE_URL', 'VITE_APP_NAME'];

    for (const envVar of required) {
      if (!import.meta.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }
  }
}
```

## Debugging and Troubleshooting

### 1. Check Environment Variables Loading

```tsx
// Check environment variables in console
console.log('import.meta.env:', import.meta.env);
console.log('AppConfig:', IOC(IOCIdentifier.AppConfig));
```

### 2. Common Issues

**Issue 1: Environment Variables Not Injected**

```bash
# Check environment variable prefix
# Make sure to use VITE_ prefix
VITE_APP_NAME=MyApp  # ✅ Correct
APP_NAME=MyApp       # ❌ Wrong, won't be injected
```

**Issue 2: Environment Variable Files Not Loaded**

```bash
# Check file naming
.env.development     # ✅ Correct
.env.dev            # ❌ Wrong, Vite doesn't recognize it
```

**Issue 3: Environment Variables Filtered by Blacklist**

```tsx
// Check blacklist configuration
export const envBlackList = ['env', 'userNodeEnv'];
// Make sure your environment variables are not in the blacklist
```

### 3. Debugging Tools

```tsx
// Create debugging tool
export class EnvDebugger {
  static logEnvVars(config: AppConfig): void {
    console.group('Environment Variables Debug');
    console.log('Current Mode:', import.meta.env.MODE);
    console.log('AppConfig:', config);
    console.log('All Env Vars:', import.meta.env);
    console.groupEnd();
  }
}

// Use in development environment
if (import.meta.env.DEV) {
  EnvDebugger.logEnvVars(IOC(IOCIdentifier.AppConfig));
}
```

## Summary

The environment variables injection system provides:

1. **Environment Isolation**: Different environments use different configurations
2. **Type Safety**: Type checking through TypeScript
3. **Centralized Management**: All configurations are managed uniformly in AppConfig
4. **Flexible Configuration**: Support for multiple environment variable files
5. **Security Handling**: Sensitive information can be managed locally through .env.local

Through proper use of environment variables injection, applications can run correctly in different environments while maintaining configuration flexibility and security.
