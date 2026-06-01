import { describe, expect, it } from 'vitest';
import {
  computePkceS256Challenge,
  generatePkceVerifier,
  randomOAuthState
} from '../src/core/utils/pkce';
import {
  computeS256CodeChallenge,
  isValidCodeChallenge,
  isValidCodeVerifier,
  verifyPkceS256
} from '../src/server/utils/pkce';
import {
  TEST_CODE_CHALLENGE,
  TEST_CODE_VERIFIER
} from './helpers/pkceFixtures';

describe('server pkce utils', () => {
  describe('isValidCodeVerifier', () => {
    it('accepts RFC 7636 compliant verifiers', () => {
      expect(isValidCodeVerifier(TEST_CODE_VERIFIER)).toBe(true);
    });

    it('rejects verifiers that are too short', () => {
      expect(isValidCodeVerifier('too-short')).toBe(false);
    });

    it('rejects verifiers with invalid characters', () => {
      expect(isValidCodeVerifier(`${TEST_CODE_VERIFIER}!`)).toBe(false);
    });
  });

  describe('isValidCodeChallenge', () => {
    it('accepts valid S256 challenges', () => {
      expect(isValidCodeChallenge(TEST_CODE_CHALLENGE)).toBe(true);
    });

    it('rejects invalid challenges', () => {
      expect(isValidCodeChallenge('bad')).toBe(false);
    });
  });

  describe('computeS256CodeChallenge', () => {
    it('produces a base64url SHA-256 digest', () => {
      const challenge = computeS256CodeChallenge(TEST_CODE_VERIFIER);

      expect(challenge).toBe(TEST_CODE_CHALLENGE);
      expect(challenge).toMatch(/^[A-Za-z0-9\-._~]+$/);
    });
  });

  describe('verifyPkceS256', () => {
    it('returns true for matching verifier and challenge', () => {
      expect(verifyPkceS256(TEST_CODE_VERIFIER, TEST_CODE_CHALLENGE)).toBe(
        true
      );
    });

    it('returns false for mismatched verifier', () => {
      expect(
        verifyPkceS256(
          'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
          TEST_CODE_CHALLENGE
        )
      ).toBe(false);
    });

    it('returns false for invalid inputs', () => {
      expect(verifyPkceS256('short', 'short')).toBe(false);
    });
  });
});

describe('core pkce utils', () => {
  describe('generatePkceVerifier', () => {
    it('generates verifiers within RFC length bounds', () => {
      const verifier = generatePkceVerifier();

      expect(verifier.length).toBeGreaterThanOrEqual(43);
      expect(verifier.length).toBeLessThanOrEqual(128);
      expect(isValidCodeVerifier(verifier)).toBe(true);
    });

    it('respects custom length within bounds', () => {
      expect(generatePkceVerifier(50).length).toBe(50);
      expect(generatePkceVerifier(10).length).toBe(43);
      expect(generatePkceVerifier(200).length).toBe(128);
    });
  });

  describe('computePkceS256Challenge', () => {
    it('matches server-side S256 challenge computation', async () => {
      const challenge = await computePkceS256Challenge(TEST_CODE_VERIFIER);

      expect(challenge).toBe(TEST_CODE_CHALLENGE);
    });
  });

  describe('randomOAuthState', () => {
    it('generates a 32-char hex string', () => {
      const state = randomOAuthState();

      expect(state).toMatch(/^[0-9a-f]{32}$/);
      expect(randomOAuthState()).not.toBe(state);
    });
  });
});
