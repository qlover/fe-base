# Next.js Environment Variable Configuration Guide

## What are Environment Variables?

Environment variables are a way to configure application behavior across different environments (development, testing, production). In Next.js, environment variables have special characteristics, particularly in how they are handled on the client and server sides.

**Key Features**:

- Client-side environment variables must start with `NEXT_PUBLIC_`
- Server-side environment variables can be used directly without special prefix
- Supports multi-environment configuration and local overrides

## Environment Variable Loading Priority

Next.js loads environment variables in the following priority order:

```
.env.local → .env.development/.env.production → .env
```

## File Structure

```
project-root/
├── .env                    # Default environment variables
├── .env.local             # Local environment variables (git ignored)
├── .env.development       # Development environment variables
├── .env.production        # Production environment variables
├── .env.test              # Test environment variables
└── src/
    └── base/
        └── cases/
            └── AppConfig.ts # Application configuration class
```

## Environment Variable Files

### 1. Environment Variable File Examples

```bash
# .env (default configuration)
# Client-accessible environment variables (starting with NEXT_PUBLIC_)
NEXT_PUBLIC_APP_NAME=MyApp
NEXT_PUBLIC_API_BASE_URL=http://api.example.com
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Server-side only environment variables
DATABASE_URL=postgres://user:pass@localhost:5432/db
JWT_SECRET=your-secret-key
API_TOKEN=server-side-token

# .env.development (development environment)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_DEBUG=true
DATABASE_URL=postgres://dev:pass@localhost:5432/dev_db

# .env.production (production environment)
NEXT_PUBLIC_API_BASE_URL=https://api.production.com
NEXT_PUBLIC_DEBUG=false
DATABASE_URL=postgres://prod:pass@production:5432/prod_db

# .env.local (local override, not committed to git)
NEXT_PUBLIC_FEATURE_FLAG=true
DATABASE_URL=postgres://local:pass@localhost:5432/local_db
```

### 2. Environment Variable Usage Guidelines

#### Client-Side Environment Variables

- Must start with `NEXT_PUBLIC_`
- Will be bundled into client-side code
- Suitable for public configuration information

```bash
# ✅ Correct client-side environment variables
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=UA-XXXXX
NEXT_PUBLIC_FEATURE_FLAGS={"newUI":true}

# ❌ Incorrect client-side environment variables (missing NEXT_PUBLIC_ prefix)
API_URL=https://api.example.com  # Client cannot access
```

#### Server-Side Environment Variables

- No special prefix needed
- Only available on server-side
- Suitable for sensitive information

```bash
# ✅ Correct server-side environment variables
DATABASE_URL=postgres://user:pass@localhost:5432/db
JWT_SECRET=your-secret-key
API_TOKEN=your-api-token

# ❌ Server-side sensitive information should not start with NEXT_PUBLIC_
NEXT_PUBLIC_DATABASE_URL=postgres://user:pass@localhost:5432/db  # Security risk!
```

## Implementation in Project

### 1. Application Configuration Class

```typescript
// src/base/cases/AppConfig.ts
export class AppConfig implements EnvConfigInterface {
  /**
   * Application name
   * @description Retrieved from NEXT_PUBLIC_APP_NAME environment variable
   */
  readonly appName = process.env.NEXT_PUBLIC_APP_NAME || '';

  /**
   * API base URL
   * @description Retrieved from NEXT_PUBLIC_API_BASE_URL environment variable
   */
  readonly apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  /**
   * Whether in development environment
   */
  readonly isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Whether in production environment
   */
  readonly isProduction = process.env.NODE_ENV === 'production';

  /**
   * Database connection URL (server-side only)
   */
  readonly databaseUrl = process.env.DATABASE_URL;

  /**
   * JWT secret (server-side only)
   */
  readonly jwtSecret = process.env.JWT_SECRET;

  // ... more configuration items
}
```

### 2. Using Configuration in Client

```typescript
// Using in components
function Analytics() {
  // ✅ Correct: Get configuration object through IOC
  const appConfig = IOC(IOCIdentifier.AppConfig);

  useEffect(() => {
    if (appConfig.analyticsId) {
      // Initialize analytics
    }
  }, [appConfig.analyticsId]);

  return appConfig.debug ? <DebugInfo /> : null;
}
```

### 3. Using Configuration in Server

```typescript
// app/api/auth/[...nextauth]/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // ✅ Correct: Get configuration object through IOC
  const appConfig = IOC(IOCIdentifier.AppConfig);

  if (!appConfig.databaseUrl || !appConfig.jwtSecret) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Use configuration...
}
```

### 4. Using Configuration in Services

```typescript
// Define service class
@injectable()
export class AdminService {
  constructor(
    @inject(IOCIdentifier.AppConfig)
    private appConfig: AppConfig
  ) {}

  async fetchAdminData() {
    const response = await fetch('https://api.example.com/admin', {
      headers: {
        Authorization: `Bearer ${this.appConfig.apiToken}`
      }
    });
    return response.json();
  }
}
```

## Best Practices

### 1. Environment Variable Naming Conventions

```bash
# ✅ Good naming
NEXT_PUBLIC_APP_NAME=MyApp
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_FEATURE_FLAGS={"darkMode":true}

# ❌ Bad naming
next_public_app_name=MyApp      # Should use uppercase
NEXT_PUBLIC_SECRET_KEY=xxx      # Sensitive info shouldn't use NEXT_PUBLIC_
```

### 2. Configuration Class Implementation

```typescript
// Define configuration interface
interface EnvConfigInterface {
  readonly env: string;
  readonly appName: string;
  readonly appVersion: string;
  // ... other configuration items
}

// Implement configuration class
@injectable()
export class AppConfig implements EnvConfigInterface {
  /**
   * Current environment mode
   * @description Automatically set based on current .env file
   */
  readonly env: string = process.env.APP_ENV!;

  /**
   * Application name
   */
  readonly appName: string = name;

  /**
   * Application version
   */
  readonly appVersion: string = version;

  /**
   * User token storage key
   */
  readonly userTokenKey: string = '_user_token';

  /**
   * Database connection URL (server-side only)
   */
  readonly supabaseUrl: string = process.env.SUPABASE_URL!;

  /**
   * Database anonymous key (server-side only)
   */
  readonly supabaseAnonKey: string = process.env.SUPABASE_ANON_KEY!;

  /**
   * JWT secret (server-side only)
   */
  readonly jwtSecret: string = process.env.JWT_SECRET!;

  /**
   * JWT expiration time
   * @example '30 days'
   * @example '1 year'
   */
  readonly jwtExpiresIn: StringValue = '30 days';

  /**
   * OpenAI API configuration (server-side only)
   */
  readonly openaiBaseUrl: string = process.env.CEREBRAS_BASE_URL!;
  readonly openaiApiKey: string = process.env.CEREBRAS_API_KEY!;
}
```

### 3. Configuration Validation

```typescript
// Define configuration validator
@injectable()
export class ConfigValidator {
  constructor(
    @inject(IOCIdentifier.AppConfig)
    private appConfig: AppConfig,
    @inject(IOCIdentifier.Logger)
    private logger: LoggerInterface
  ) {}

  /**
   * Validate all required configuration items
   * @throws {Error} When required configuration items are missing
   */
  validateRequiredConfig(): void {
    // Validate basic configuration
    this.validateBasicConfig();

    // Validate different configurations based on runtime environment
    if (typeof window === 'undefined') {
      this.validateServerConfig();
    }
  }

  /**
   * Validate basic configuration items
   */
  private validateBasicConfig(): void {
    const requiredConfigs: Array<keyof AppConfig> = [
      'env',
      'appName',
      'appVersion',
      'userTokenKey'
    ];

    for (const key of requiredConfigs) {
      if (!this.appConfig[key]) {
        throw new Error(`Missing required config: ${key}`);
      }
    }
  }

  /**
   * Validate server-side configuration items
   */
  private validateServerConfig(): void {
    const requiredServerConfigs: Array<keyof AppConfig> = [
      'supabaseUrl',
      'supabaseAnonKey',
      'jwtSecret',
      'openaiBaseUrl',
      'openaiApiKey'
    ];

    for (const key of requiredServerConfigs) {
      if (!this.appConfig[key]) {
        throw new Error(`Missing required server config: ${key}`);
      }
    }
  }

  /**
   * Validate configuration value formats
   */
  validateConfigFormat(): void {
    // Validate URL format
    if (!this.isValidUrl(this.appConfig.supabaseUrl)) {
      throw new Error('Invalid supabaseUrl format');
    }

    // Validate JWT expiration time format
    if (!this.isValidDuration(this.appConfig.jwtExpiresIn)) {
      throw new Error('Invalid jwtExpiresIn format');
    }

    this.logger.info('All config formats validated successfully');
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidDuration(duration: string): boolean {
    // Implement duration format validation logic
    return /^\d+\s+(days?|weeks?|months?|years?)$/.test(duration);
  }
}
```

### 4. Handling Sensitive Information

```bash
# .env.local (not committed to git)
DATABASE_URL=postgres://user:pass@localhost:5432/db
JWT_SECRET=your-secret-key
API_TOKEN=your-api-token

# .env.template (committed to git, as template)
DATABASE_URL=postgres://user:password@localhost:5432/dbname
JWT_SECRET=your-jwt-secret-here
API_TOKEN=your-api-token-here
```

## Debugging and Troubleshooting

### 1. Configuration Debug Tool

```typescript
@injectable()
export class ConfigDebugger {
  constructor(
    @inject(IOCIdentifier.AppConfig)
    private appConfig: AppConfig,
    @inject(IOCIdentifier.Logger)
    private logger: LoggerInterface
  ) {}

  /**
   * Print configuration information
   */
  logConfig(): void {
    this.logger.group('Configuration Debug Info');

    // Basic configuration
    this.logger.info('Basic Config:', {
      env: this.appConfig.env,
      appName: this.appConfig.appName,
      appVersion: this.appConfig.appVersion
    });

    // If on server-side, print server configuration
    if (typeof window === 'undefined') {
      this.logger.info('Server Config:', {
        supabaseUrl: this.maskSensitiveInfo(this.appConfig.supabaseUrl),
        jwtExpiresIn: this.appConfig.jwtExpiresIn
      });
    }

    this.logger.groupEnd();
  }

  /**
   * Validate configuration health status
   */
  async checkConfigHealth(): Promise<void> {
    try {
      // Validate database connection
      if (typeof window === 'undefined') {
        await this.checkDatabaseConnection();
      }

      // Validate other configuration items
      this.validateConfigValues();

      this.logger.info('Configuration health check passed');
    } catch (error) {
      this.logger.error('Configuration health check failed:', error);
      throw error;
    }
  }

  private async checkDatabaseConnection(): Promise<void> {
    // Implement database connection check logic
  }

  private validateConfigValues(): void {
    // Implement configuration value validation logic
  }

  private maskSensitiveInfo(value: string): string {
    return value.replace(/^(https?:\/\/[^:]+:)([^@]+)(@.*)$/, '$1****$3');
  }
}
```

### 2. Common Issues Handling

**Issue 1: Configuration Not Properly Injected**

```typescript
// ❌ Wrong: Using environment variables directly
class UserService {
  private apiUrl = process.env.NEXT_PUBLIC_API_URL;
}

// ✅ Correct: Get through configuration class
@injectable()
class UserService {
  constructor(
    @inject(IOCIdentifier.AppConfig)
    private appConfig: AppConfig
  ) {}
}
```

**Issue 2: Configuration Validation Failed**

```typescript
// ❌ Wrong: No configuration validation
@injectable()
class ApiService {
  constructor(
    @inject(IOCIdentifier.AppConfig)
    private appConfig: AppConfig
  ) {}
}

// ✅ Correct: Include configuration validation
@injectable()
class ApiService {
  constructor(
    @inject(IOCIdentifier.AppConfig)
    private appConfig: AppConfig,
    @inject(IOCIdentifier.ConfigValidator)
    private configValidator: ConfigValidator
  ) {
    this.configValidator.validateRequiredConfig();
  }
}
```

**Issue 3: Configuration Type Handling**

```typescript
// ❌ Wrong: Manual type conversion
class FeatureService {
  private isDebug = process.env.NEXT_PUBLIC_DEBUG === 'true';
}

// ✅ Correct: Handle type conversion in configuration class
@injectable()
export class AppConfig implements EnvConfigInterface {
  readonly debug: boolean = this.parseBoolean(process.env.NEXT_PUBLIC_DEBUG);

  private parseBoolean(value: string | undefined): boolean {
    return value?.toLowerCase() === 'true';
  }
}
```

## Summary

The object-oriented configuration management system provides:

1. **Configuration Encapsulation**:
   - Unified management of all configurations through `AppConfig` class
   - Implement `EnvConfigInterface` interface to ensure configuration completeness
   - Use dependency injection to achieve configuration decoupling

2. **Type Safety**:
   - Handle type conversion in configuration class
   - TypeScript interface definitions ensure type correctness
   - Compile-time type checking

3. **Configuration Validation**:
   - Dedicated `ConfigValidator` class handles configuration validation
   - Runtime configuration completeness check
   - Configuration format validation

4. **Best Practices**:
   - Dependency injection for configuration management
   - Configuration validation and debugging tools
   - Sensitive information protection
   - Type-safe handling

Through object-oriented configuration management, we can:

- Improve code maintainability and testability
- Ensure configuration type safety and completeness
- Easily perform configuration validation and debugging
- Better manage configuration dependencies
