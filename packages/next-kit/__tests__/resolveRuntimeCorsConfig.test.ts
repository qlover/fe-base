import { describe, expect, it } from 'vitest';
import { buildRuntimeCorsConfig } from '../src/server/utils/resolveRuntimeCorsConfig';

describe('buildRuntimeCorsConfig', () => {
  it('freezes rules and methods', () => {
    const config = buildRuntimeCorsConfig(
      [{ origin: 'https://a.test', path: '/api/*', methods: ['GET'] }],
      ['GET', 'POST']
    );
    expect(config.apiCorsAllowedOrigins).toEqual([]);
    expect(config.apiCorsAllowedMethods).toEqual(['GET', 'POST']);
    expect(config.apiCorsRules).toEqual([
      { origin: 'https://a.test', path: '/api/*', methods: ['GET'] }
    ]);
  });

  it('falls back to default methods when empty', () => {
    const config = buildRuntimeCorsConfig([], []);
    expect(config.apiCorsAllowedMethods).toEqual(['GET', 'POST', 'OPTIONS']);
  });
});
