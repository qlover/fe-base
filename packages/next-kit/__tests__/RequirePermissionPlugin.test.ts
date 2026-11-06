import { describe, expect, it, vi } from 'vitest';
import { RequirePermissionPlugin } from '../src/server/plugins/RequirePermissionPlugin';
import type { PermissionGuardInterface } from '../src/server/interfaces/PermissionGuardInterface';
import type { BootstrapServerContext } from '../src/server/interfaces/BootstrapServerInterface';

describe('RequirePermissionPlugin', () => {
  it('ensures ready then asserts permission', async () => {
    const ensureReady = vi.fn().mockResolvedValue(undefined);
    const assertHasPermission = vi.fn().mockResolvedValue(undefined);
    const guard: PermissionGuardInterface = {
      ensureReady,
      assertHasPermission
    };
    const IOC = vi.fn(() => guard);
    const plugin = new RequirePermissionPlugin('admin.demo', () => guard);

    await plugin.onBefore({
      parameters: { IOC }
    } as unknown as BootstrapServerContext);

    expect(ensureReady).toHaveBeenCalledOnce();
    expect(assertHasPermission).toHaveBeenCalledWith('admin.demo');
  });
});
