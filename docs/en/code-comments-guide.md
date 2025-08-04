# Code Comments Guide

## Overview

This guide provides comprehensive standards for writing effective code comments in the project. Good comments should explain "why" rather than "what", making the code itself self-documenting while providing necessary context for complex logic and business rules.

## Basic Principles

### 1. Code Self-Documentation First

- Use clear, descriptive variable and function names
- Break down complex logic into well-named functions
- Let the code explain its purpose whenever possible

### 2. Purpose of Comments

- Explain why, not what
- Document business rules and requirements
- Highlight important decisions and trade-offs
- Warn about edge cases and limitations

### 3. When to Add Comments

- Complex business logic
- Non-obvious technical decisions
- Performance considerations
- Security implications
- API usage examples
- Future improvement plans
- Edge cases and known limitations

### 4. Comment Format Standards

- Use backticks to wrap metadata tags starting with `@`, such as: `@since`, `@deprecated`, `@optional`
- Use backticks to wrap `@default` values, such as: `@default 'src'`, `@default 3000`, `@default true`
- Use backticks to wrap code snippets, variable names, function names, etc.
- Use backticks to wrap file paths, configuration items, and other technical terms
- Maintain consistency and readability in comments

**Important: Backtick Escaping in Tables and Complex Formats**

- Generally use multi-line comments (/\*\* \*/), use single-line comments (//) in special cases
- When using backticks in table cells or complex markdown formats, escape with backslash: `\``
- This prevents parsing errors and ensures correct TypeDoc rendering
- Exception: Code block triple backticks (```) should remain unescaped
- Example: Use `\`--sourcePath\``instead of`--sourcePath` in table cells

````typescript
/**
 * CLI Options Table Example
 *
 * | Option | Alias | Type | Required | Default | Description |
 * |--------|-------|------|----------|---------|-------------|
 * | \`--sourcePath\` | \`-p\` | \`string\` | ❌ | \`'src'\` | Source code directory path |
 * | \`--generatePath\` | \`-g\` | \`string\` | ❌ | \`'docs'\` | Output directory path |
 *
 * Code blocks remain unchanged:
 * ```typescript
 * const config = { sourcePath: 'src' };
 * ```
 */
````

```typescript
/**
 * Check if parameter is optional (has `?` mark, default value, or `@optional` tag)
 *
 * Business rules:
 * - Only process `@since` tags in JSDoc comments
 * - Filter out `@default`, `@since`, `@deprecated`, `@optional` tags
 * - Support documentation tags like `@param`, `@returns`, `@example`, etc.
 *
 * @param reflection - TypeDoc reflection object
 * @returns Whether it's optional
 */
```

## Comment Rules

### File-Level Documentation

File-level TSDoc comments with `@module` tags are **optional** for most files but **required** in the following cases:

1. **Files without specific exports**: When a file doesn't export any specific functions, classes, or variables
2. **Index files**: Files named `index.ts`, `index.js`, or similar index files that serve as entry points or re-export modules

For `index.ts` files, comments should include the following key elements:

1. **Module Overview**:
   - Use `@module` tag to declare module name
   - Briefly describe the module's main functionality and purpose
   - Explain the module's role in the overall project

2. **Exported Members List**:
   - List all important exported members
   - Provide brief descriptions for each member
   - Mark deprecated or experimental features

3. **Usage Examples**:
   - Provide basic import and usage examples
   - Show common use cases
   - Explain configuration options (if any)

4. **Documentation Links**:
   - Provide links to detailed documentation
   - Reference related API documentation
   - Link to detailed feature explanations

Example:

````typescript
/**
 * @module UserModule
 * @description Main entry point for user management module
 *
 * This module provides all core functionality for user management, including:
 * - User authentication and authorization
 * - User information management
 * - Permission control
 * - Session management
 *
 * ### Exported Members
 *
 * - UserService: Main user service class handling all user operations
 * - AuthService: Authentication service handling login, registration flows
 * - UserTypes: User-related type definitions
 * - UserUtils: User operation utility functions
 *
 * ### Basic Usage
 * ```typescript
 * import { UserService, AuthService } from './user';
 *
 * // Initialize services
 * const userService = new UserService(config);
 * const authService = new AuthService(config);
 *
 * // User login
 * await authService.login(credentials);
 *
 * // Get user information
 * const user = await userService.getCurrentUser();
 * ```
 *
 * ### Advanced Configuration
 * ```typescript
 * import { UserService } from './user';
 *
 * const userService = new UserService({
 *   cache: true,
 *   timeout: 5000,
 *   retryAttempts: 3
 * });
 * ```
 *
 * ### Related Documentation
 * - [Authentication Flow](../auth/authentication.md)
 * - [Authorization Guide](../auth/authorization.md)
 * - [API Documentation](../api/user-service.md)
 */
````

In `index.ts` files:

- Use `@module` tag to identify module name
- Provide clear module description
- List and explain all important exported members
- Provide practical code examples
- Add related documentation links
- Use `@see` tags to reference related documentation

**Required Examples:**

```typescript
/**
 * @module DatabaseConfig
 * @description Database connection configuration and initialization
 *
 * This file contains database connection settings, connection pool configuration,
 * and initialization logic. It doesn't export specific functions but provides
 * database connection instances for other modules.
 *
 * Core functionality:
 * - Database connection settings
 * - Connection pool management
 * - Environment-based configuration
 * - Connection health monitoring
 */
```

````typescript
/**
 * @module UserModule
 * @description Entry point and re-exports for user-related functionality
 *
 * This index file serves as the main entry point for all user-related functionality.
 * It re-exports user services, types, and utility functions, providing a clear API
 * for other modules to import user functionality.
 *
 * Exported content:
 * - UserService: Main user management service
 * - UserTypes: TypeScript type definitions
 * - UserUtils: User operation utility functions
 * - UserConstants: User-related constants
 *
 * @example
 * ```typescript
 * import { UserService, UserTypes } from './user';
 * ```
 */
````

The `@module` tag should:

- Use descriptive module names that reflect the file's primary purpose
- Include comprehensive description of file functionality
- List core responsibilities and features
- Mention important design considerations
- Provide usage examples when appropriate
- Be placed after shebang (if present) and before any imports

### Class/Interface Documentation

````typescript
/**
 * Manages user authentication and session handling
 *
 * Core concept:
 * Centralized authentication service handling user login, session management,
 * and permission validation
 *
 * Main features:
 * - User authentication: JWT-based stateless authentication with multi-factor authentication (MFA) support
 *   - Support username/email login
 *   - Password verification using bcrypt hashing
 *   - Implement login rate limiting to prevent brute force attacks
 *   - Support remember login status (extended token validity)
 *
 * - Session management: Redis-stored session state with session renewal and forced logout support
 *   - Session data includes user status, permissions, last active time
 *   - Support session renewal (sliding expiration time)
 *   - Administrators can force logout specific users
 *   - Abnormal login detection and automatic locking
 *
 * - Permission validation: Role-based access control (RBAC) with fine-grained permissions
 *   - Roles: Super admin, admin, regular user, guest
 *   - Permissions: Feature permissions (e.g., user management, system configuration)
 *   - Resource permissions: Data-level access control
 *   - Dynamic permissions: Permission changes based on user status and time
 *
 * - Password reset: Secure password reset flow with email verification and temporary tokens
 *   - Send reset emails to verified email addresses
 *   - Temporary token validity: 1 hour
 *   - Automatically clear all active sessions after reset
 *   - Log password change events
 *
 * @example Basic usage
 * ```typescript
 * const authService = new AuthService(config);
 * await authService.login(credentials);
 * ```
 *
 * @example Advanced usage
 * ```typescript
 * const authService = new AuthService(config);
 * await authService.logout();
 * ```
 */
class AuthService {
  // Implementation
}
````

### Method/Function Documentation

Provide detailed explanations and default values for each parameter

````typescript
/**
 * Handle user login with rate limiting and security measures
 *
 * @returns {Promise<AuthResult>} Authentication result containing:
 *   - token: JWT token for subsequent requests
 *   - user: User profile information
 *   - permissions: User permission list
 *
 * @param credentials - Login parameters
 * @param {string} [credentials.username] - Email or username
 * @param {string} [credentials.password] - User password (will be hashed)
 * @param {boolean} [credentials.rememberMe=false] - Whether to extend session time
 *
 * @throws {AuthError} When credentials are invalid
 * @throws {RateLimitError} When login attempts exceed limit
 *
 * @example
 * ```typescript
 * try {
 *   const result = await login({
 *     username: "john@example.com",
 *     password: "****",
 *     rememberMe: true
 *   });
 * } catch (error) {
 *   // Handle error
 * }
 * ```
 */
function login(
  /**
   * Login parameters
   */
  credentials: {
    /**
     * Email or username
     */
    username: string;
    /**
     * User password (will be hashed)
     */
    password: string;
    /**
     * Whether to extend session time
     *
     * @default `false`
     */
    rememberMe?: boolean;
  }
): Promise<AuthResult> {}
````

#### Method Parameter Signature Comments

````typescript
/**
 * User service class providing user authentication, management, and data operations
 *
 * Core functionality:
 * - User authentication and session management
 * - User data CRUD operations
 * - Permission validation and role management
 * - User status monitoring and logging
 *
 * @example Basic usage
 * ```typescript
 * const userService = new UserService({
 *   tokenKey: 'custom_token',
 *   cors: true
 * }, true);
 * ```
 */
class UserService {
  constructor(
    /**
     * Service configuration options
     *
     * Controls the core behavior and configuration parameters of the user service
     */
    options: {
      /**
       * JWT token key name in local storage
       *
       * Used to store and retrieve user authentication tokens in browser localStorage
       * or sessionStorage. It's recommended to use meaningful key names to avoid
       * conflicts with other applications' storage.
       *
       * @default `'user_token'`
       * @example `'myapp_auth_token'`
       */
      tokenKey?: string;
      /**
       * Whether to enable Cross-Origin Resource Sharing (CORS)
       *
       * When set to true, allows cross-origin requests to access user data.
       * Should be used cautiously in production environments with appropriate
       * security measures in place.
       *
       * @default `false`
       * @example `true` // Development environment
       */
      cors?: boolean;
      /**
       * Database connection configuration
       *
       * Specifies database connection parameters for user data storage.
       * Supports multiple database types: MySQL, PostgreSQL, MongoDB
       */
      database?: {
        /**
         * Database type
         *
         * @default `'mysql'`
         */
        type: 'mysql' | 'postgresql' | 'mongodb';
        /**
         * Database host address
         *
         * @default `'localhost'`
         */
        host: string;
        /**
         * Database port number
         *
         * @default `3306`
         */
        port: number;
      };
    },
    /**
     * Whether to enable debug mode
     *
     * Debug mode outputs detailed log information, including:
     * - API request and response details
     * - Database query statements
     * - Each step of the authentication process
     * - Error stack information
     *
     * Should only be used in development environments, set to false in production
     *
     * @default `false`
     * @example `true` // Development debugging
     */
    protected debug?: boolean
  ) {}

  /**
   * Handle user login authentication with security validation and rate limiting
   *
   * Authentication flow:
   * 1. Validate user input format and length
   * 2. Check login attempt count (prevent brute force attacks)
   * 3. Verify username/email and password
   * 4. Generate JWT token and refresh token
   * 5. Log login events and security incidents
   * 6. Return authentication result and user information
   *
   * Security features:
   * - Password verification using bcrypt hashing
   * - Login rate limiting implementation (max 5 failures in 5 minutes)
   * - Multi-factor authentication (MFA) support
   * - Abnormal login detection and alerts
   *
   * @returns {Promise<AuthResult>} Authentication result object containing:
   *   - token: JWT access token for subsequent API request authentication
   *   - refreshToken: Refresh token for obtaining new access tokens
   *   - user: Basic user information (ID, name, email, role, etc.)
   *   - permissions: User permission list for frontend routing and feature control
   *   - expiresAt: Token expiration timestamp
   *
   * @throws {ValidationError} When input parameter format is invalid
   * @throws {AuthError} When username or password is incorrect
   * @throws {RateLimitError} When login attempts exceed limit (over 5 in 5 minutes)
   * @throws {AccountLockedError} When account is locked or suspended
   * @throws {DatabaseError} When database connection fails
   *
   * @example Basic login
   * ```typescript
   * try {
   *   const result = await userService.login({
   *     username: "john@example.com",
   *     password: "securePassword123",
   *     rememberMe: false
   *   });
   *   console.log('Login successful:', result.user.name);
   * } catch (error) {
   *   console.error('Login failed:', error.message);
   * }
   * ```
   *
   * @example Remember login status
   * ```typescript
   * const result = await userService.login({
   *   username: "admin@company.com",
   *   password: "adminPass",
   *   rememberMe: true // Extend session time to 30 days
   * });
   * ```
   */
  async login(
    /**
     * User login credentials
     *
     * Contains all information required for user identity authentication
     */
    credentials: {
      /**
       * User login identifier
       *
       * Supports the following formats:
       * - Email address: user@example.com
       * - Username: john_doe
       * - Phone number: +1-555-123-4567
       *
       * System automatically recognizes format and performs corresponding validation
       *
       * @example `"john@example.com"`
       * @example `"john_doe"`
       * @example `"+1-555-123-4567"`
       */
      username: string;
      /**
       * User password
       *
       * Password requirements:
       * - Length: 8-128 characters
       * - Must contain: uppercase and lowercase letters, numbers, special characters
       * - Cannot contain: username, common passwords, consecutive characters
       *
       * System automatically performs password strength checks
       *
       * @example `"MySecurePass123!"`
       * @minLength 8
       * @maxLength 128
       */
      password: string;
      /**
       * Whether to remember login status
       *
       * When set to true:
       * - JWT token validity extended to 30 days
       * - Refresh token validity extended to 90 days
       * - Maintain login status across multiple devices
       *
       * Security considerations:
       * - Only enable on trusted devices
       * - Users can revoke all sessions at any time
       *
       * @default `false`
       * @example `true` // Personal device
       * @example `false` // Public device
       */
      rememberMe?: boolean;
      /**
       * Multi-factor authentication code
       *
       * Required when user has MFA enabled
       * Supports TOTP (Time-based One-Time Password)
       *
       * Format: 6-digit numeric code
       *
       * @optional
       * @example `"123456"`
       * @pattern `^\d{6}$`
       */
      mfaCode?: string;
      /**
       * Client device information
       *
       * Used for security auditing and abnormal login detection
       * Contains device type, browser, IP address, and other information
       *
       * @optional
       * @example `{ deviceType: 'mobile', browser: 'Chrome', ip: '192.168.1.1' }`
       */
      deviceInfo?: {
        /**
         * Device type
         *
         * @example `'desktop'` | `'mobile'` | `'tablet'`
         */
        deviceType: string;
        /**
         * Browser information
         *
         * @example `'Chrome 120.0.0'`
         */
        browser: string;
        /**
         * IP address
         *
         * @example `'192.168.1.1'`
         */
        ip: string;
      };
    }
  ): Promise<AuthResult> {}

  /**
   * Update user personal information
   *
   * @param userId - Unique identifier of the user to update
   * @param updates - User information fields to update
   * @returns Updated user information
   */
  async updateUser(
    /**
     * User unique identifier
     *
     * Must be in valid UUID v4 format
     * System validates user existence and current user permissions for modification
     *
     * @example `"550e8400-e29b-41d4-a716-446655440000"`
     * @pattern `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`
     */
    userId: string,
    /**
     * User information to update
     *
     * Only updates provided fields, other fields remain unchanged
     * System automatically validates field format and business rules
     */
    updates: {
      /**
       * User display name
       *
       * Used for interface display, supports multiple languages
       * Length limit: 2-50 characters
       *
       * @optional
       * @example `"John Doe"`
       * @example `"张三"`
       * @minLength 2
       * @maxLength 50
       */
      displayName?: string;
      /**
       * User avatar URL
       *
       * Must be a valid image URL
       * Supported formats: JPG, PNG, GIF, WebP
       * Recommended size: 200x200 pixels
       *
       * @optional
       * @example `"https://example.com/avatar.jpg"`
       * @pattern `^https?://.*\.(jpg|jpeg|png|gif|webp)$`
       */
      avatar?: string;
      /**
       * User personal bio
       *
       * Supports Markdown format
       * Length limit: 0-500 characters
       *
       * @optional
       * @example `"Full-stack developer passionate about programming"`
       * @maxLength 500
       */
      bio?: string;
    }
  ): Promise<User> {}
}
````

## Business Logic Comments

### Configuration Comments

```typescript
const CONFIG = {
  /**
   * Maximum retry attempts for API call failures
   */
  MAX_RETRIES: 3,

  /**
   * Request timeout in milliseconds
   */
  REQUEST_TIMEOUT: 5000,

  /**
   * Feature flags for progressive rollout
   */
  FEATURES: {
    /**
     * Release date: 2024-04
     */
    NEW_UI: false,
    /**
     * Currently in testing phase
     */
    BETA_API: true
  }
};
```

### Algorithm Comments

```typescript
/**
 * Implements optimized merge sort with the following optimizations:
 * 1. Use insertion sort for small arrays (length < 10)
 * 2. Maintain auxiliary array to reduce memory allocation
 * 3. Check if array is already sorted
 *
 * Time complexity: O(n log n)
 * Space complexity: O(n)
 */
```

### Error Handling Comments

```typescript
// Handle edge case where user has permissions but account is inactive
// This can occur when account is suspended or in maintenance mode
if (hasPermissions && !isActive) {
  throw new AccountStatusError('Account temporarily inactive');
}
```

## TODO Comments

- Always include ticket/issue references
- Add target date or version (if possible)
- Briefly explain context

```typescript
// TODO(JIRA-123): Implement rate limiting for API calls
// Target: v2.1.0 (2024-04)

// FIXME(JIRA-456): Current implementation cannot handle concurrent updates
// Blocking v2.0.0 release
```

## Comment Taboos

### 1. Avoid Obvious Comments

```typescript
// ❌ Bad
// Set username
user.name = 'John';

// ✅ Good
// Override username for test environment
user.name = 'John';
```

### 2. Don't Comment Out Code

- Use version control instead
- Delete dead code
- If temporary, add TODO with explanation

### 3. Avoid Redundant Comments

```typescript
// ❌ Bad
/**
 * Get user by ID
 * @param id - User ID
 * @returns User
 */

// ✅ Good
/**
 * Retrieve user from database with caching
 * @param id - Unique user identifier (UUID v4)
 * @returns User object, returns null if not found
 * @throws DatabaseError if connection fails
 */
```

## Maintenance

### 1. Keep Comments Updated

- Update comments when code changes
- Remove outdated comments
- Verify examples are still valid

### 2. Review Comments

- Include comments in code reviews
- Check clarity and accuracy
- Ensure comments add value

## Language Guidelines

### 1. Use English for:

- All code comments
- Function and variable names
- Documentation strings
- Commit messages

### 2. Use Chinese for:

- Business requirement documents
- Team communication
- User-facing content

## Tools and Automation

### 1. ESLint Rules

- Enforce JSDoc for public APIs
- Check comment existence
- Validate comment format

### 2. Documentation Generation

- Use TypeDoc to generate API documentation
- Generate documentation from comments
- Include examples in documentation

## Summary

Remember: The best comments are often the ones you don't need to write because the code itself is clear enough. When you do need to write comments, ensure they provide valuable context and insights that cannot be expressed through code alone.

### Key Points:

- ✅ Prioritize code self-documentation
- ✅ Comments explain "why" not "what"
- ✅ Use complete TSDoc/JSDoc format
- ✅ Include usage examples and edge cases
- ✅ Keep comments synchronized with code updates
- ✅ Check comment quality in code reviews
