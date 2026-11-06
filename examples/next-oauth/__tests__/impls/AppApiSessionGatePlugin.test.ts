import { ExecutorError } from '@qlover/fe-corekit/executor';
import { describe, expect, it, vi } from 'vitest';
import type { AppApiConfig } from '@/impls/appApi/AppApiRequester';
import {
  AppApiSessionGatePlugin,
  needsSessionGate
} from '@/impls/appApi/AppApiSessionGatePlugin';
import { API_NOT_AUTHORIZED } from '@config/i18n-identifier/api';
import type { UserServiceInterface } from '@interfaces/UserServiceInterface';
import type { ExecutorContextInterface } from '@qlover/fe-corekit/executor';

describe('needsSessionGate', () => {
  it('exempts login and session restore paths', () => {
    expect(needsSessionGate('/api/user/session')).toBe(false);
    expect(needsSessionGate('/api/user/login')).toBe(false);
    expect(needsSessionGate('/api/user/password/forgot')).toBe(false);
    expect(needsSessionGate('/api/public-config')).toBe(false);
  });

  it('gates admin and authenticated user APIs', () => {
    expect(needsSessionGate('/api/admin/users')).toBe(true);
    expect(needsSessionGate('/api/user/linked-logins')).toBe(true);
    expect(needsSessionGate('/api/user/password')).toBe(true);
    expect(needsSessionGate('/api/clients')).toBe(true);
  });
});

describe('AppApiSessionGatePlugin', () => {
  it('waits for session and rejects when unauthenticated', async () => {
    const awaitSessionReady = vi.fn().mockResolvedValue(false);
    const plugin = new AppApiSessionGatePlugin(
      () => ({ awaitSessionReady }) as unknown as UserServiceInterface
    );

    await expect(
      plugin.onBefore({
        parameters: { url: '/api/admin/users' }
      } as ExecutorContextInterface<AppApiConfig>)
    ).rejects.toSatisfy(
      (err: unknown) =>
        err instanceof ExecutorError && err.id === API_NOT_AUTHORIZED
    );
    expect(awaitSessionReady).toHaveBeenCalledTimes(1);
  });

  it('skips gate for exempt urls', async () => {
    const awaitSessionReady = vi.fn();
    const plugin = new AppApiSessionGatePlugin(
      () => ({ awaitSessionReady }) as unknown as UserServiceInterface
    );

    await plugin.onBefore({
      parameters: { url: '/api/user/session' }
    } as ExecutorContextInterface<AppApiConfig>);

    expect(awaitSessionReady).not.toHaveBeenCalled();
  });
});
