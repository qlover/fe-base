import { ExecutorError } from '@qlover/fe-corekit';
import { V_LOGIN_PARAMS_REQUIRED } from '@config/i18n-identifier/common/validators';
import { loginEmailSchema, loginPasswordSchema } from '@schemas/LoginSchema';
import type { LoginSchema } from '@schemas/LoginSchema';
import type {
  ValidatorInterface,
  ValidationFaildResult,
  ExtendedExecutorError
} from './ValidatorInterface';

export class LoginValidator implements ValidatorInterface<LoginSchema> {
  public validateEmail(data: unknown): void | ValidationFaildResult {
    const emailResult = loginEmailSchema.safeParse(data);
    if (!emailResult.success) {
      return emailResult.error.issues[0];
    }
  }

  public validatePassword(data: unknown): void | ValidationFaildResult {
    const passwordResult = loginPasswordSchema.safeParse(data);
    if (!passwordResult.success) {
      return passwordResult.error.issues[0];
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

    if (result == null) {
      return data as LoginSchema;
    }

    const error: ExtendedExecutorError = new ExecutorError(result.message);
    error.issues = [result];
    throw error;
  }
}
