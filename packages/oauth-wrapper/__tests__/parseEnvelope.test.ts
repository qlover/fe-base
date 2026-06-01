import { describe, expect, it } from 'vitest';
import {
  parseOAuthTokenError,
  parseOAuthTokenResponse,
  parseOAuthUserInfoResponse
} from '../src/client/parseEnvelope';

describe('parseEnvelope', () => {
  describe('parseOAuthTokenResponse', () => {
    it('parses direct OAuth token responses', () => {
      const response = parseOAuthTokenResponse({
        access_token: 'access',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'refresh'
      });

      expect(response).toEqual({
        access_token: 'access',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'refresh'
      });
    });

    it('parses wrapped app API success responses', () => {
      const response = parseOAuthTokenResponse({
        success: true,
        requestId: 'req-1',
        data: {
          access_token: 'access',
          token_type: 'Bearer',
          expires_in: 3600
        }
      });

      expect(response.access_token).toBe('access');
    });

    it('throws with OAuth error description when present', () => {
      expect(() =>
        parseOAuthTokenResponse({
          error: 'invalid_grant',
          error_description: 'Code expired'
        })
      ).toThrow('Code expired');
    });

    it('throws with wrapped app API error message', () => {
      expect(() =>
        parseOAuthTokenResponse({
          success: false,
          message: 'Token endpoint failed'
        })
      ).toThrow('Token endpoint failed');
    });
  });

  describe('parseOAuthTokenError', () => {
    it('returns OAuth error description', () => {
      expect(
        parseOAuthTokenError(
          { error: 'invalid_client', error_description: 'Bad client' },
          'fallback'
        )
      ).toBe('Bad client');
    });

    it('falls back when payload is unknown', () => {
      expect(parseOAuthTokenError({ foo: 'bar' }, 'fallback')).toBe('fallback');
    });
  });

  describe('parseOAuthUserInfoResponse', () => {
    it('parses direct userinfo responses', () => {
      const userinfo = parseOAuthUserInfoResponse({
        sub: '1',
        email: 'user@example.com',
        name: 'User'
      });

      expect(userinfo).toEqual({
        sub: '1',
        email: 'user@example.com',
        name: 'User'
      });
    });

    it('parses wrapped app API userinfo responses', () => {
      const userinfo = parseOAuthUserInfoResponse({
        success: true,
        data: {
          sub: '1',
          email: 'user@example.com',
          name: 'User',
          roles: ['admin']
        }
      });

      expect(userinfo.roles).toEqual(['admin']);
    });

    it('throws for invalid userinfo payloads', () => {
      expect(() => parseOAuthUserInfoResponse({ sub: '1' })).toThrow(
        'Invalid userinfo response from authorization server'
      );
    });
  });
});
