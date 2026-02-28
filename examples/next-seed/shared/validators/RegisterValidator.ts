import { ExecutorError } from '@qlover/fe-corekit';
import { V_LOGIN_PARAMS_REQUIRED } from '@config/i18n-identifier/common/validators';
import {
  registerUsernameSchema,
  registerEmailSchema,
  registerPasswordSchema
} from '@schemas/RegisterSchema';
import type { RegisterSchema } from '@schemas/RegisterSchema';
import type {
  ValidatorInterface,
  ValidationFaildResult,
  ExtendedExecutorError
} from './ValidatorInterface';

export class RegisterValidator implements ValidatorInterface<RegisterSchema> {
  public validateUsername(data: unknown): void | ValidationFaildResult {
    const result = registerUsernameSchema.safeParse(data);
    if (!result.success) {
      return result.error.issues[0];
    }
  }

  public validateEmail(data: unknown): void | ValidationFaildResult {
    const result = registerEmailSchema.safeParse(data);
    if (!result.success) {
      return result.error.issues[0];
    }
  }

  public validatePassword(data: unknown): void | ValidationFaildResult {
    const result = registerPasswordSchema.safeParse(data);
    if (!result.success) {
      return result.error.issues[0];
    }
  }

  /**
   * @override
   */
  public validate(data: unknown): void | ValidationFaildResult {
    if (typeof data !== 'object' || data === null) {
      return {
        path: ['form'],
        message: V_LOGIN_PARAMS_REQUIRED
      };
    }

    const { username, email, password } = data as Record<string, unknown>;

    const usernameResult = this.validateUsername(username);
    if (usernameResult != null) {
      return { ...usernameResult, path: ['username'] };
    }

    const emailResult = this.validateEmail(email);
    if (emailResult != null) {
      return { ...emailResult, path: ['email'] };
    }

    const passwordResult = this.validatePassword(password);
    if (passwordResult != null) {
      return { ...passwordResult, path: ['password'] };
    }
  }

  /**
   * @override
   */
  public getThrow(data: unknown): RegisterSchema {
    const result = this.validate(data);

    if (result == null) {
      return data as RegisterSchema;
    }

    const error: ExtendedExecutorError = new ExecutorError(result.message);
    error.issues = [result];
    throw error;
  }
}
