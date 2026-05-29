import { describe, expect, it } from 'vitest';
import type { OAuthClientRow } from '@shared/oauth-wrapper/schema/OAuthAuthorizeSchema';
import {
  isRedirectUriAllowed,
  normalizeQuery
} from '@shared/oauth-wrapper/utils/authorizeUtil';

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
});
