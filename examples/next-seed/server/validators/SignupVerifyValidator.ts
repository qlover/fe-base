import { ExecutorError } from '@qlover/fe-corekit';
import { isPlainObject, isString } from 'lodash';
import type { ExtendedExecutorError } from './ExtendedExecutorError';
import type {
  ValidationFaildResult,
  ValidatorInterface
} from '../port/ValidatorInterface';
import type { EmailOtpType } from '@supabase/supabase-js';

export type SignupVerifyParamType = {
  access_token: string;
  expires_at: string;
  expires_in: string;
  refresh_token: string;
  token_type: string;
  type: EmailOtpType;
};

export const emailVerifyParamKeys = [
  'access_token',
  'expires_at',
  'expires_in',
  'refresh_token',
  'token_type',
  'type'
] as const;

export class SignupVerifyValidator implements ValidatorInterface<SignupVerifyParamType> {
  /**
   * @override
   */
  public validate(data: unknown): void | ValidationFaildResult {
    if (!isPlainObject(data)) {
      return {
        path: ['form'],
        message: 'Invalid Signup verify params'
      };
    }

    for (const key of emailVerifyParamKeys) {
      if (
        !(
          isString((data as SignupVerifyParamType)[key]) &&
          (data as SignupVerifyParamType)[key]
        )
      ) {
        return {
          path: [key],
          message: `Invalid Signup verify ${key} params`
        };
      }
    }
  }
  /**
   * @override
   */
  public getThrow(data: unknown): SignupVerifyParamType {
    const result = this.validate(data);

    if (result == null) {
      return data as SignupVerifyParamType;
    }

    const error: ExtendedExecutorError = new ExecutorError(result.message);
    error.issues = [result];
    throw error;
  }
}
