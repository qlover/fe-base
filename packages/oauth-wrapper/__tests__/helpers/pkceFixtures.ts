import { computeS256CodeChallenge } from '../../src/server/utils/pkce';

/** RFC 7636 minimum-length code_verifier for tests. */
export const TEST_CODE_VERIFIER = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEGH';

export const TEST_CODE_CHALLENGE = computeS256CodeChallenge(TEST_CODE_VERIFIER);
