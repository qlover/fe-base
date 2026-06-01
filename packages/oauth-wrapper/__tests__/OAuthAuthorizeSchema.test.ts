import { describe, expect, it } from 'vitest';
import { isOAuthRedirectUri } from '../src/core/schema/OAuthAuthorizeSchema';

describe('OAuthAuthorizeSchema', () => {
  describe('isOAuthRedirectUri', () => {
    it('accepts https redirect URIs', () => {
      expect(isOAuthRedirectUri('https://app.example/callback')).toBe(true);
    });

    it('accepts http redirect URIs', () => {
      expect(isOAuthRedirectUri('http://localhost:3000/callback')).toBe(true);
    });

    it('accepts custom URL schemes', () => {
      expect(isOAuthRedirectUri('myapp://oauth/callback')).toBe(true);
    });

    it('rejects empty and invalid values', () => {
      expect(isOAuthRedirectUri('')).toBe(false);
      expect(isOAuthRedirectUri('   ')).toBe(false);
      expect(isOAuthRedirectUri('not-a-uri')).toBe(false);
    });
  });
});
