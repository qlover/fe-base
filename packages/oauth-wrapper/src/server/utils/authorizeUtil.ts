import { isValidCodeChallenge } from './pkce';
import {
  OAuthRfcCodes,
  type OAuthAuthorizeValidationError,
  type OAuthClientRow
} from '../../core';

export function validatePkceParams(
  parsed: {
    code_challenge?: string;
    code_challenge_method?: 'S256';
  },
  confidential: boolean
): OAuthAuthorizeValidationError | null {
  const hasChallenge = Boolean(parsed.code_challenge?.trim());
  const hasMethod = Boolean(parsed.code_challenge_method);

  if (!confidential) {
    if (!hasChallenge || parsed.code_challenge_method !== 'S256') {
      return {
        errorKey: OAuthRfcCodes.INVALID_REQUEST,
        message:
          'Public clients must send code_challenge and code_challenge_method=S256.'
      };
    }
    if (!isValidCodeChallenge(parsed.code_challenge!)) {
      return {
        errorKey: OAuthRfcCodes.INVALID_REQUEST,
        message: 'Invalid code_challenge.'
      };
    }
    return null;
  }

  if (hasChallenge !== hasMethod) {
    return {
      errorKey: OAuthRfcCodes.INVALID_REQUEST,
      message: 'code_challenge and code_challenge_method must be sent together.'
    };
  }

  if (hasChallenge) {
    if (parsed.code_challenge_method !== 'S256') {
      return {
        errorKey: OAuthRfcCodes.INVALID_REQUEST,
        message: 'Only code_challenge_method=S256 is supported.'
      };
    }
    if (!isValidCodeChallenge(parsed.code_challenge!)) {
      return {
        errorKey: OAuthRfcCodes.INVALID_REQUEST,
        message: 'Invalid code_challenge.'
      };
    }
  }

  return null;
}

export function normalizeQuery(
  raw: Record<string, string | string[] | undefined>
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) {
      result[key] = value[0];
    } else {
      result[key] = value;
    }
  }

  if (!result.response_type) {
    result.response_type = 'code';
  }

  return result;
}

export function isRedirectUriAllowed(
  redirectUri: string,
  client: OAuthClientRow
): boolean {
  return client.redirect_uris.includes(redirectUri);
}
