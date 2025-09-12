import { ExecutorError } from '@qlover/fe-corekit';
import { z } from 'zod';
import {
  V_LOGIN_PARAMS_REQUIRED,
  V_EMAIL_INVALID,
  V_PASSWORD_MIN_LENGTH,
  V_PASSWORD_MAX_LENGTH,
  V_PASSWORD_SPECIAL_CHARS
} from '@config/Identifier/validator';
import type {
  ValidatorInterface,
  ValidationFaildResult
} from '../port/ValidatorInterface';

export interface LoginValidatorData {
  email: string;
  password: string;
}

const emailSchema = z.email({ error: V_EMAIL_INVALID });

const passwordSchema = z
  .string()
  .min(6, { error: V_PASSWORD_MIN_LENGTH })
  .max(50, { error: V_PASSWORD_MAX_LENGTH })
  .regex(/^\S+$/, { error: V_PASSWORD_SPECIAL_CHARS });

interface ExtendedExecutorError extends ExecutorError {
  issues?: ValidationFaildResult[];
}

export class LoginValidator implements ValidatorInterface {
  validateEmail(data: unknown): void | ValidationFaildResult {
    const emailResult = emailSchema.safeParse(data);
    if (!emailResult.success) {
      return emailResult.error.issues[0];
    }
  }

  validatePassword(data: unknown): void | ValidationFaildResult {
    const passwordResult = passwordSchema.safeParse(data);
    if (!passwordResult.success) {
      return passwordResult.error.issues[0];
    }
  }

  validate(data: unknown): void | ValidationFaildResult {
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
