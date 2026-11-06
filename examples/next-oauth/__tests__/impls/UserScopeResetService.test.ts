import { describe, expect, it, vi } from 'vitest';
import { UserScopeResetService } from '@/impls/bootstraps/UserScopeResetService';
import type { UserScopedResettableInterface } from '@interfaces/UserScopedResettableInterface';
import type { UserServiceInterface } from '@interfaces/UserServiceInterface';

function createUserServiceMock(initialId: string | null) {
  let userId = initialId;
  let authenticated = initialId != null;
  const listeners = new Set<() => void>();

  return {
    isAuthenticated: () => authenticated,
    getUser: () => (userId ? { id: userId } : null),
    getStore: () => ({
      getStore: () => ({
        subscribe: (listener: () => void) => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        }
      })
    }),
    setUser(id: string | null) {
      userId = id;
      authenticated = id != null;
      for (const listener of listeners) {
        listener();
      }
    }
  };
}

describe('UserScopeResetService', () => {
  it('resets resettables when authenticated user becomes null', () => {
    const userService = createUserServiceMock('u1');
    const resetUserScope = vi.fn();
    const resettable: UserScopedResettableInterface = { resetUserScope };
    const service = new UserScopeResetService(
      userService as unknown as UserServiceInterface,
      [resettable]
    );

    service.onBefore();
    userService.setUser(null);

    expect(resetUserScope).toHaveBeenCalledTimes(1);
  });

  it('resets when switching to another user', () => {
    const userService = createUserServiceMock('u1');
    const resetUserScope = vi.fn();
    const service = new UserScopeResetService(
      userService as unknown as UserServiceInterface,
      [{ resetUserScope }]
    );

    service.onBefore();
    userService.setUser('u2');

    expect(resetUserScope).toHaveBeenCalledTimes(1);
  });

  it('does not reset on first login from null', () => {
    const userService = createUserServiceMock(null);
    const resetUserScope = vi.fn();
    const service = new UserScopeResetService(
      userService as unknown as UserServiceInterface,
      [{ resetUserScope }]
    );

    service.onBefore();
    userService.setUser('u1');

    expect(resetUserScope).not.toHaveBeenCalled();
  });
});
