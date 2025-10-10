# 验证器开发指南

## 目录

1. [验证器架构概述](#验证器架构概述)
2. [验证器接口和抽象层](#验证器接口和抽象层)
3. [具体验证器实现](#具体验证器实现)
4. [验证器使用示例](#验证器使用示例)
5. [自定义验证器示例](#自定义验证器示例)
6. [最佳实践和扩展](#最佳实践和扩展)

## 验证器架构概述

### 1. 整体架构

项目采用分层的验证器架构设计：

```
应用层                      验证层
┌──────────────┐          ┌──────────────┐
│   业务服务   │          │  验证器接口  │
├──────────────┤          ├──────────────┤
│   参数处理   │    ◄─────┤  验证器实现  │
├──────────────┤          ├──────────────┤
│   错误处理   │          │   验证规则   │
└──────────────┘          └──────────────┘
```

### 2. 核心组件

- **验证器接口**：`ValidatorInterface`
- **验证器实现**：`LoginValidator`, `PaginationValidator` 等
- **验证规则**：使用 `zod` 库定义的验证规则
- **错误处理**：统一的错误响应格式

### 3. 验证结果类型

```typescript
// 验证失败结果
interface ValidationFaildResult {
  path: PropertyKey[]; // 验证失败的字段路径
  message: string; // 错误消息
}

// 验证器接口
interface ValidatorInterface {
  // 验证数据并返回结果
  validate(
    data: unknown
  ): Promise<void | ValidationFaildResult> | void | ValidationFaildResult;

  // 验证数据，成功返回数据，失败抛出错误
  getThrow(data: unknown): unknown;
}
```

## 验证器接口和抽象层

### 1. 基础验证器接口

```typescript
export interface ValidatorInterface {
  /**
   * 验证数据并返回结果
   * @param data - 要验证的数据
   * @returns 如果验证通过返回 void，否则返回验证错误
   */
  validate(
    data: unknown
  ): Promise<void | ValidationFaildResult> | void | ValidationFaildResult;

  /**
   * 验证数据，成功返回数据，失败抛出错误
   * @param data - 要验证的数据
   * @returns 验证通过的数据
   * @throws {ExecutorError} 如果数据无效，包含验证错误详情
   */
  getThrow(data: unknown): unknown;
}
```

### 2. 验证规则定义

```typescript
// 使用 zod 定义验证规则
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

## 具体验证器实现

### 1. 登录验证器

```typescript
@injectable()
export class LoginValidator implements ValidatorInterface {
  // 验证邮箱
  validateEmail(data: unknown): void | ValidationFaildResult {
    const emailResult = emailSchema.safeParse(data);
    if (!emailResult.success) {
      return emailResult.error.issues[0];
    }
  }

  // 验证密码
  validatePassword(data: unknown): void | ValidationFaildResult {
    const passwordResult = passwordSchema.safeParse(data);
    if (!passwordResult.success) {
      return passwordResult.error.issues[0];
    }
  }

  // 实现验证接口
  validate(data: unknown): void | ValidationFaildResult {
    if (typeof data !== 'object' || data === null) {
      return {
        path: ['form'],
        message: V_LOGIN_PARAMS_REQUIRED
      };
    }

    const { email, password } = data as Record<string, unknown>;

    // 验证邮箱
    let validateResult = this.validateEmail(email);
    if (validateResult != null) {
      return validateResult;
    }

    // 验证密码
    validateResult = this.validatePassword(password);
    if (validateResult != null) {
      return validateResult;
    }
  }

  // 实现 getThrow 接口
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

### 2. 分页验证器

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

## 验证器使用示例

### 1. 在 API 路由中使用

```typescript
export async function POST(req: NextRequest) {
  const server = new BootstrapServer();

  const result = await server.execNoError(async ({ parameters: { IOC } }) => {
    // 获取请求数据
    const data = await req.json();

    // 使用验证器验证数据
    const loginValidator = IOC(LoginValidator);
    const validatedData = loginValidator.getThrow(data);

    // 使用验证后的数据
    const userService = IOC(UserService);
    return userService.login(validatedData);
  });

  if (result instanceof ExecutorError) {
    return NextResponse.json(new AppErrorApi(result.id, result.message));
  }

  return NextResponse.json(new AppSuccessApi(result));
}
```

### 2. 在服务中使用

```typescript
@injectable()
export class UserService {
  constructor(
    @inject(LoginValidator) private loginValidator: LoginValidator,
    @inject(UserRepository) private userRepository: UserRepositoryInterface
  ) {}

  async validateAndCreateUser(data: unknown): Promise<User> {
    // 验证数据
    const validatedData = this.loginValidator.getThrow(data);

    // 使用验证后的数据
    return this.userRepository.add(validatedData);
  }
}
```

## 自定义验证器示例

### 1. 创建自定义验证规则

```typescript
// 定义自定义验证规则
const phoneSchema = z
  .string()
  .regex(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' });

const addressSchema = z.object({
  province: z.string().min(1, '省份不能为空'),
  city: z.string().min(1, '城市不能为空'),
  detail: z.string().min(1, '详细地址不能为空')
});

// 创建用户信息验证器
@injectable()
export class UserInfoValidator implements ValidatorInterface {
  validate(data: unknown): void | ValidationFaildResult {
    if (typeof data !== 'object' || data === null) {
      return {
        path: ['form'],
        message: '表单数据不能为空'
      };
    }

    const { phone, address } = data as Record<string, unknown>;

    // 验证手机号
    const phoneResult = phoneSchema.safeParse(phone);
    if (!phoneResult.success) {
      return phoneResult.error.issues[0];
    }

    // 验证地址
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

### 2. 组合多个验证器

```typescript
@injectable()
export class UserProfileValidator implements ValidatorInterface {
  constructor(
    @inject(UserInfoValidator) private userInfoValidator: UserInfoValidator,
    @inject(LoginValidator) private loginValidator: LoginValidator
  ) {}

  async validate(data: unknown): Promise<void | ValidationFaildResult> {
    // 验证登录信息
    const loginResult = this.loginValidator.validate(data);
    if (loginResult) return loginResult;

    // 验证用户信息
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

## 最佳实践和扩展

### 1. 验证器组织

```typescript
// 1. 按功能模块组织验证器
src / validators / user / LoginValidator.ts;
ProfileValidator.ts;
SettingsValidator.ts;
product / CreateValidator.ts;
UpdateValidator.ts;
order / PlaceOrderValidator.ts;
```

### 2. 验证规则复用

```typescript
// 1. 创建共享验证规则
const commonRules = {
  email: z.string().email({ message: '邮箱格式不正确' }),
  phone: z.string().regex(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' }),
  password: z
    .string()
    .min(6, '密码至少6位')
    .max(50, '密码最多50位')
    .regex(/^\S+$/, '密码不能包含空格')
};

// 2. 在验证器中复用
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

### 3. 错误处理增强

```typescript
// 1. 创建验证错误基类
export class ValidationError extends Error {
  constructor(
    public readonly path: PropertyKey[],
    message: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// 2. 创建字段验证错误
export class FieldValidationError extends ValidationError {
  constructor(
    public readonly field: string,
    message: string
  ) {
    super([field], message);
    this.name = 'FieldValidationError';
  }
}

// 3. 在验证器中使用
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

### 4. 异步验证支持

```typescript
@injectable()
export class AsyncValidator implements ValidatorInterface {
  constructor(
    @inject(UserRepository) private userRepository: UserRepositoryInterface
  ) {}

  async validate(data: unknown): Promise<void | ValidationFaildResult> {
    // 基本验证
    const basicResult = this.validateBasicFields(data);
    if (basicResult) return basicResult;

    // 异步验证（例如检查邮箱是否已存在）
    const { email } = data as { email: string };
    const existingUser = await this.userRepository.getUserByEmail(email);

    if (existingUser) {
      return {
        path: ['email'],
        message: '该邮箱已被注册'
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

## 总结

项目的验证器设计遵循以下原则：

1. **接口抽象**：
   - 清晰的验证器接口定义
   - 统一的验证结果格式
   - 可扩展的验证器实现

2. **类型安全**：
   - 使用 zod 提供类型安全的验证规则
   - TypeScript 类型定义
   - 运行时类型检查

3. **错误处理**：
   - 统一的错误响应格式
   - 详细的错误信息
   - 错误链路追踪

4. **可扩展性**：
   - 支持自定义验证规则
   - 支持验证器组合
   - 支持异步验证

5. **最佳实践**：
   - 验证规则复用
   - 模块化组织
   - 错误处理增强
