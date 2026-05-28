import { ExecutorError } from '@qlover/fe-corekit';
import { V_LOGIN_PARAMS_REQUIRED } from '@config/i18n-identifier/common/validators';
import { loginEmailSchema, loginPasswordSchema } from '@schemas/LoginSchema';
import type { LoginSchema } from '@schemas/LoginSchema';
import type {
  ValidatorInterface,
  ValidationResult,
  ExtendedExecutorError,
  ValidationResultFailed
} from './ValidatorInterface';

export class LoginValidator implements ValidatorInterface<LoginSchema> {
  public validateEmail(data: unknown): void | ValidationResultFailed {
    const emailResult = loginEmailSchema.safeParse(data);
    if (!emailResult.success) {
      const error = emailResult.error.issues[0];
      return {
        success: false,
        path: error.path,
        message: error.message
      };
    }
  }

  public validatePassword(data: unknown): void | ValidationResultFailed {
    const passwordResult = loginPasswordSchema.safeParse(data);
    if (!passwordResult.success) {
      const error = passwordResult.error.issues[0];
      return {
        success: false,
        path: error.path,
        message: error.message
      };
    }
  }

  /**
   * @override
   */
  public validate(data: unknown): void | ValidationResult<LoginSchema> {
    if (typeof data !== 'object' || data === null) {
      return {
        path: ['form'],
        success: false,
        message: V_LOGIN_PARAMS_REQUIRED
      };
    }

    const { email, password } = data as Record<string, unknown>;

    let validateResult = this.validateEmail(email);
    if (validateResult != null) {
      return validateResult;
    }

    validateResult = this.validatePassword(password);
    if (validateResult != null) {
      return validateResult;
    }
  }

  /**
   * @override
   */
  public getThrow(data: unknown): LoginSchema {
    const result = this.validate(data);

    if (result == null || result.success) {
      return data as LoginSchema;
    }

    const error: ExtendedExecutorError = new ExecutorError(result.message);
    error.issues = [result];
    throw error;
  }
}
