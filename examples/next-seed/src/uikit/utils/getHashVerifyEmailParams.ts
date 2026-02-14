import { isString, pick } from 'lodash';
import type { SignupVerifyParamType } from '@server/validators/SignupVerifyValidator';

export const emailVerifyParamKeys = [
  'access_token',
  'expires_at',
  'expires_in',
  'refresh_token',
  'token_type',
  'type'
] as const;

export function getHashParams(hash: string): Record<string, string | null> {
  const sp = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  const params = {};
  sp.forEach((value, key) => {
    Object.assign(params, { [key]: value });
  });
  return params;
}

export function isEmailVerifyParam(
  value: unknown
): value is SignupVerifyParamType {
  return emailVerifyParamKeys.every(
    (key) =>
      emailVerifyParamKeys.includes(key) &&
      (value as SignupVerifyParamType)[key] != null &&
      isString((value as SignupVerifyParamType)[key])
  );
}

export function getHashVerifyEmailParams(
  hash: string
): SignupVerifyParamType | null {
  if (!hash) {
    return null;
  }

  const hashParams = pick(getHashParams(hash), emailVerifyParamKeys);
  return isEmailVerifyParam(hashParams) ? hashParams : null;
}
