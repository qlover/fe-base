# Validator Development Guide

## Table of Contents

1. [Validator Architecture Overview](#validator-architecture-overview)
2. [Validator Interfaces and Abstraction Layer](#validator-interfaces-and-abstraction-layer)
3. [Concrete Validator Implementation](#concrete-validator-implementation)
4. [Validator Usage Examples](#validator-usage-examples)
5. [Custom Validator Examples](#custom-validator-examples)
6. [Best Practices and Extensions](#best-practices-and-extensions)

## Validator Architecture Overview

### 1. Overall Architecture

The project adopts a layered validator architecture design:

```
Application Layer          Validation Layer
┌──────────────┐          ┌──────────────┐
│Business Service│          │Validator Interface│
├──────────────┤          ├──────────────┤
│Param Processing│    ◄─────┤Validator Implement│
├──────────────┤          ├──────────────┤
│Error Handling │          │Validation Rules│
└──────────────┘          └──────────────┘
```

### 2. Core Components

- **Validator Interface**: `ValidatorInterface`
- **Validator Implementation**: `LoginValidator`, `PaginationValidator`, etc.
- **Validation Rules**: Validation rules defined using `zod` library
- **Error Handling**: Unified error response format

### 3. Validation Result Types

```typescript
// Validation failure result
interface ValidationFaildResult {
  path: PropertyKey[]; // Path of failed validation field
  message: string; // Error message
}

// Validator interface
interface ValidatorInterface {
  // Validate data and return result
  validate(
    data: unknown
  ): Promise<void | ValidationFaildResult> | void | ValidationFaildResult;

  // Validate data, return data if successful, throw error if failed
  getThrow(data: unknown): unknown;
}
```

## Validator Interfaces and Abstraction Layer

### 1. Base Validator Interface

```typescript
export interface ValidatorInterface {
  /**
   * Validate data and return result
   * @param data - Data to validate
   * @returns void if validation passes, otherwise returns validation error
   */
  validate(
    data: unknown
  ): Promise<void | ValidationFaildResult> | void | ValidationFaildResult;

  /**
   * Validate data, return data if successful, throw error if failed
   * @param data - Data to validate
   * @returns Validated data
   * @throws {ExecutorError} If data is invalid, includes validation error details
   */
  getThrow(data: unknown): unknown;
}
```

### 2. Validation Rule Definition

```typescript
// Define validation rules using zod
const emailSchema = z.string().email({ message: V_EMAIL_INVALID });

const passwordSchema = z
  .string()
  .min(6, { message: V_PASSWORD_MIN_LENGTH })
  .max(50, { message: V_PASSWORD_MAX_LENGTH })
  .regex(/^\S+$/, { message: V_PASSWORD_SPECIAL_CHARS });

const pageSchema = z
  .number()
  .or(z.string())
  .transform((val) => Number(val))
  .refine((val) => val > 0, {
    message: API_PAGE_INVALID
  });
```

## Concrete Validator Implementation

### 1. Login Validator

```typescript
@injectable()
export class LoginValidator implements ValidatorInterface {
  // Validate email
  validateEmail(data: unknown): void | ValidationFaildResult {
    const emailResult = emailSchema.safeParse(data);
    if (!emailResult.success) {
      return emailResult.error.issues[0];
    }
  }

  // Validate password
  validatePassword(data: unknown): void | ValidationFaildResult {
    const passwordResult = passwordSchema.safeParse(data);
    if (!passwordResult.success) {
      return passwordResult.error.issues[0];
    }
  }

  // Implement validate interface
  validate(data: unknown): void | ValidationFaildResult {
    if (typeof data !== 'object' || data === null) {
      return {
        path: ['form'],
        message: V_LOGIN_PARAMS_REQUIRED
      };
    }

    const { email, password } = data as Record<string, unknown>;

    // Validate email
    let validateResult = this.validateEmail(email);
    if (validateResult != null) {
      return validateResult;
    }

    // Validate password
    validateResult = this.validatePassword(password);
    if (validateResult != null) {
      return validateResult;
    }
  }

  // Implement getThrow interface
  getThrow(data: unknown): LoginValidatorData {
    const result = this.validate(data);
    if (result == null) {
      return data as LoginValidatorData;
    }

    const error: ExtendedExecutorError = new ExecutorError(result.message);
    error.issues = [result];
    throw error;
  }
}
```

### 2. Pagination Validator

```typescript
@injectable()
export class PaginationValidator implements ValidatorInterface {
  protected defaultPageSize = 10;

  validatePageSize(value: unknown): void | ValidationFaildResult {
    const result = pageSchema.safeParse(value);
    if (!result.success) {
      return result.error.issues[0];
    }
  }

  validate(data: unknown): void | ValidationFaildResult {
    if (typeof data !== 'object' || data === null) {
      return {
        path: ['form'],
        message: 'form is required'
      };
    }

    return this.validatePageSize((data as Record<string, unknown>).page);
  }

  getThrow(data: unknown): PaginationInterface {
    const result = this.validate(data);
    if (result) {
      throw new Error(result.message);
    }

    return { page: 1, pageSize: this.defaultPageSize };
  }
}
```

## Validator Usage Examples

### 1. Using in API Routes

```typescript
export async function POST(req: NextRequest) {
  const server = new BootstrapServer();

  const result = await server.execNoError(async ({ parameters: { IOC } }) => {
    // Get request data
    const data = await req.json();

    // Use validator to validate data
    const loginValidator = IOC(LoginValidator);
    const validatedData = loginValidator.getThrow(data);

    // Use validated data
    const userService = IOC(UserService);
    return userService.login(validatedData);
  });

  if (result instanceof ExecutorError) {
    return NextResponse.json(new AppErrorApi(result.id, result.message));
  }

  return NextResponse.json(new AppSuccessApi(result));
}
```

### 2. Using in Services

```typescript
@injectable()
export class UserService {
  constructor(
    @inject(LoginValidator) private loginValidator: LoginValidator,
    @inject(UserRepository) private userRepository: UserRepositoryInterface
  ) {}

  async validateAndCreateUser(data: unknown): Promise<User> {
    // Validate data
    const validatedData = this.loginValidator.getThrow(data);

    // Use validated data
    return this.userRepository.add(validatedData);
  }
}
```

## Custom Validator Examples

### 1. Create Custom Validation Rules

```typescript
// Define custom validation rules
const phoneSchema = z
  .string()
  .regex(/^1[3-9]\d{9}$/, { message: 'Invalid phone number format' });

const addressSchema = z.object({
  province: z.string().min(1, 'Province cannot be empty'),
  city: z.string().min(1, 'City cannot be empty'),
  detail: z.string().min(1, 'Detailed address cannot be empty')
});

// Create user info validator
@injectable()
export class UserInfoValidator implements ValidatorInterface {
  validate(data: unknown): void | ValidationFaildResult {
    if (typeof data !== 'object' || data === null) {
      return {
        path: ['form'],
        message: 'Form data cannot be empty'
      };
    }

    const { phone, address } = data as Record<string, unknown>;

    // Validate phone number
    const phoneResult = phoneSchema.safeParse(phone);
    if (!phoneResult.success) {
      return phoneResult.error.issues[0];
    }

    // Validate address
    const addressResult = addressSchema.safeParse(address);
    if (!addressResult.success) {
      return addressResult.error.issues[0];
    }
  }

  getThrow(data: unknown): UserInfoData {
    const result = this.validate(data);
    if (result) {
      throw new ExecutorError(result.message);
    }
    return data as UserInfoData;
  }
}
```

### 2. Combine Multiple Validators

```typescript
@injectable()
export class UserProfileValidator implements ValidatorInterface {
  constructor(
    @inject(UserInfoValidator) private userInfoValidator: UserInfoValidator,
    @inject(LoginValidator) private loginValidator: LoginValidator
  ) {}

  async validate(data: unknown): Promise<void | ValidationFaildResult> {
    // Validate login information
    const loginResult = this.loginValidator.validate(data);
    if (loginResult) return loginResult;

    // Validate user information
    const userInfoResult = this.userInfoValidator.validate(data);
    if (userInfoResult) return userInfoResult;
  }

  async getThrow(data: unknown): Promise<UserProfileData> {
    const result = await this.validate(data);
    if (result) {
      throw new ExecutorError(result.message);
    }
    return data as UserProfileData;
  }
}
```

## Best Practices and Extensions

### 1. Validator Organization

```typescript
// 1. Organize validators by feature modules
src / validators / user / LoginValidator.ts;
ProfileValidator.ts;
SettingsValidator.ts;
product / CreateValidator.ts;
UpdateValidator.ts;
order / PlaceOrderValidator.ts;
```

### 2. Validation Rule Reuse

```typescript
// 1. Create shared validation rules
const commonRules = {
  email: z.string().email({ message: 'Invalid email format' }),
  phone: z
    .string()
    .regex(/^1[3-9]\d{9}$/, { message: 'Invalid phone number format' }),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must be at most 50 characters')
    .regex(/^\S+$/, 'Password cannot contain spaces')
};

// 2. Reuse in validators
export class UserValidator implements ValidatorInterface {
  validate(data: unknown): void | ValidationFaildResult {
    const schema = z.object({
      email: commonRules.email,
      password: commonRules.password,
      phone: commonRules.phone.optional()
    });

    const result = schema.safeParse(data);
    if (!result.success) {
      return result.error.issues[0];
    }
  }
}
```

### 3. Enhanced Error Handling

```typescript
// 1. Create validation error base class
export class ValidationError extends Error {
  constructor(
    public readonly path: PropertyKey[],
    message: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// 2. Create field validation error
export class FieldValidationError extends ValidationError {
  constructor(
    public readonly field: string,
    message: string
  ) {
    super([field], message);
    this.name = 'FieldValidationError';
  }
}

// 3. Use in validators
export class EnhancedValidator implements ValidatorInterface {
  getThrow(data: unknown): unknown {
    const result = this.validate(data);
    if (result) {
      throw new FieldValidationError(result.path.join('.'), result.message);
    }
    return data;
  }
}
```

### 4. Async Validation Support

```typescript
@injectable()
export class AsyncValidator implements ValidatorInterface {
  constructor(
    @inject(UserRepository) private userRepository: UserRepositoryInterface
  ) {}

  async validate(data: unknown): Promise<void | ValidationFaildResult> {
    // Basic validation
    const basicResult = this.validateBasicFields(data);
    if (basicResult) return basicResult;

    // Async validation (e.g., check if email exists)
    const { email } = data as { email: string };
    const existingUser = await this.userRepository.getUserByEmail(email);

    if (existingUser) {
      return {
        path: ['email'],
        message: 'Email is already registered'
      };
    }
  }

  async getThrow(data: unknown): Promise<unknown> {
    const result = await this.validate(data);
    if (result) {
      throw new ValidationError(result.path, result.message);
    }
    return data;
  }
}
```

## Summary

The project's validator design follows these principles:

1. **Interface Abstraction**:
   - Clear validator interface definitions
   - Unified validation result format
   - Extensible validator implementation

2. **Type Safety**:
   - Use zod for type-safe validation rules
   - TypeScript type definitions
   - Runtime type checking

3. **Error Handling**:
   - Unified error response format
   - Detailed error messages
   - Error chain tracking

4. **Extensibility**:
   - Support for custom validation rules
   - Support for validator composition
   - Support for async validation

5. **Best Practices**:
   - Validation rule reuse
   - Modular organization
   - Enhanced error handling
