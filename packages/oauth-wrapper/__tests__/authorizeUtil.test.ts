import { describe, expect, it } from 'vitest';
import { OAuthRfcCodes } from '../src/core';
import type { OAuthClientRow } from '../src/core/schema/OAuthAuthorizeSchema';
import {
  isRedirectUriAllowed,
  normalizeQuery,
  validatePkceParams
} from '../src/server/utils/authorizeUtil';
import { TEST_CODE_CHALLENGE } from './helpers/pkceFixtures';

describe('authorizeUtil', () => {
  describe('normalizeQuery', () => {
    it('defaults response_type to code when missing', () => {
      expect(normalizeQuery({ client_id: 'abc' })).toEqual({
        client_id: 'abc',
        response_type: 'code'
      });
    });

    it('uses the first value when a query param is an array', () => {
      expect(
        normalizeQuery({
          client_id: ['first', 'second'],
          response_type: 'code'
        })
      ).toEqual({
        client_id: 'first',
        response_type: 'code'
      });
    });

    it('preserves existing response_type', () => {
      expect(
        normalizeQuery({
          client_id: 'abc',
          response_type: 'code'
        })
      ).toEqual({
        client_id: 'abc',
        response_type: 'code'
      });
    });
  });

  describe('isRedirectUriAllowed', () => {
    it('returns true when redirect_uri is in client redirect_uris', () => {
      const client = {
        redirect_uris: ['https://app.example/callback']
      } as OAuthClientRow;

      expect(isRedirectUriAllowed('https://app.example/callback', client)).toBe(
        true
      );
    });

    it('returns false when redirect_uri is not allowed', () => {
      const client = {
        redirect_uris: ['https://app.example/callback']
      } as OAuthClientRow;

      expect(
        isRedirectUriAllowed('https://evil.example/callback', client)
      ).toBe(false);
    });
  });

  describe('validatePkceParams', () => {
    it('requires PKCE for public clients', () => {
      const result = validatePkceParams({}, false);

      expect(result).toEqual({
        errorKey: OAuthRfcCodes.INVALID_REQUEST,
        message:
          'Public clients must send code_challenge and code_challenge_method=S256.'
      });
    });

    it('accepts valid PKCE for public clients', () => {
      const result = validatePkceParams(
        {
          code_challenge: TEST_CODE_CHALLENGE,
          code_challenge_method: 'S256'
        },
        false
      );

      expect(result).toBeNull();
    });

    it('rejects invalid code_challenge for public clients', () => {
      const result = validatePkceParams(
        {
          code_challenge: 'short',
          code_challenge_method: 'S256'
        },
        false
      );

      expect(result).toEqual({
        errorKey: OAuthRfcCodes.INVALID_REQUEST,
        message: 'Invalid code_challenge.'
      });
    });

    it('allows confidential clients without PKCE', () => {
      expect(validatePkceParams({}, true)).toBeNull();
    });

    it('requires challenge and method together for confidential clients', () => {
      const result = validatePkceParams(
        { code_challenge: TEST_CODE_CHALLENGE },
        true
      );

      expect(result).toEqual({
        errorKey: OAuthRfcCodes.INVALID_REQUEST,
        message:
          'code_challenge and code_challenge_method must be sent together.'
      });
    });

    it('rejects unsupported PKCE method for confidential clients', () => {
      const result = validatePkceParams(
        {
          code_challenge: TEST_CODE_CHALLENGE,
          code_challenge_method: 'plain' as 'S256'
        },
        true
      );

      expect(result).toEqual({
        errorKey: OAuthRfcCodes.INVALID_REQUEST,
        message: 'Only code_challenge_method=S256 is supported.'
      });
    });
  });
});
