import { describe, expect, it } from 'vitest';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { OAuthSessionService } from '@server/services/OAuthSessionService';

function createMutableConfig(): SeedServerConfigInterface & {
  sessionSecret: string;
  oauthSessionKey: string;
  isProduction: boolean;
} {
  return {
    sessionSecret: '',
    oauthSessionKey: '',
    isProduction: false
  } as SeedServerConfigInterface & {
    sessionSecret: string;
    oauthSessionKey: string;
    isProduction: boolean;
  };
}

describe('OAuthSessionService lazy secret', () => {
  it('constructs without session secret', () => {
    const config = createMutableConfig();
    expect(() => new OAuthSessionService(config)).not.toThrow();
    const session = new OAuthSessionService(config);
    expect(session['sessionSecret']).toBe('');
  });

  it('reads secret after config is filled', () => {
    const config = createMutableConfig();
    const session = new OAuthSessionService(config);

    config.sessionSecret = 'test-session-secret-32bytes-minimum!!';
    config.oauthSessionKey = 'next_oauth_session';

    expect(session['sessionSecret']).toBe(
      'test-session-secret-32bytes-minimum!!'
    );
    expect(session['sessionKey']).toBe('next_oauth_session');
  });
});
