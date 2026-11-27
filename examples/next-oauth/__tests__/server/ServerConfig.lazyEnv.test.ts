import { afterEach, describe, expect, it } from 'vitest';
import type { EnvSourceInterface } from '@shared/env/EnvSourceInterface';
import { ServerConfig } from '@server/ServerConfig';

describe('ServerConfig lazy env', () => {
  const originalSiteUrl = process.env.SITE_URL;
  const originalSessionSecret = process.env.SESSION_SECRET;

  afterEach(() => {
    if (originalSiteUrl === undefined) {
      delete process.env.SITE_URL;
    } else {
      process.env.SITE_URL = originalSiteUrl;
    }
    if (originalSessionSecret === undefined) {
      delete process.env.SESSION_SECRET;
    } else {
      process.env.SESSION_SECRET = originalSessionSecret;
    }
  });

  it('构造后改 process.env，getter 能读到新 SESSION_SECRET', () => {
    process.env.SITE_URL = 'http://localhost:3300/';
    delete process.env.SESSION_SECRET;
    const config = new ServerConfig();
    expect(config.sessionSecret).toBe('');

    process.env.SESSION_SECRET = 'lazy-session-secret-after-construct';
    expect(config.sessionSecret).toBe('lazy-session-secret-after-construct');
  });

  it('bindPamenvBag 后优先读袋', () => {
    process.env.SITE_URL = 'http://localhost:3300/';
    process.env.SESSION_SECRET = 'from-process';
    const config = new ServerConfig();
    const bag: EnvSourceInterface = {
      get(key: string): string | undefined {
        if (key === 'SESSION_SECRET') {
          return 'from-bag';
        }
        return undefined;
      },
      has(key: string): boolean {
        return key === 'SESSION_SECRET';
      }
    };
    config.bindPamenvBag(bag);
    expect(config.sessionSecret).toBe('from-bag');
  });
});
