import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ensureOAuthLocalUser,
  type OAuthIdentityStore,
  type OAuthLocalUserDraft
} from '../src/core/localUser';

function createDraft(
  overrides: Partial<OAuthLocalUserDraft> = {}
): OAuthLocalUserDraft {
  return {
    provider: 'brain',
    externalUserId: '42',
    email: 'user@example.com',
    name: 'Test User',
    phone: null,
    extra: null,
    ...overrides
  };
}

describe('ensureOAuthLocalUser', () => {
  let store: OAuthIdentityStore;

  beforeEach(() => {
    store = {
      findAuthUserIdByExternalId: vi.fn(async () => null),
      findByEmail: vi.fn(async () => null),
      createUser: vi.fn(async () => 'uuid-new'),
      upsertLink: vi.fn(async () => undefined),
      refreshMetadata: vi.fn(async () => undefined)
    };
  });

  it('creates a new user when no link or email match exists', async () => {
    const result = await ensureOAuthLocalUser(store, createDraft());

    expect(store.createUser).toHaveBeenCalled();
    expect(store.upsertLink).toHaveBeenCalledWith(
      'uuid-new',
      expect.objectContaining({ externalUserId: '42', provider: 'brain' })
    );
    expect(result).toEqual({
      authUserId: 'uuid-new',
      provider: 'brain',
      externalUserId: '42',
      email: 'user@example.com',
      name: 'Test User'
    });
  });

  it('reuses linked auth user id', async () => {
    vi.mocked(store.findAuthUserIdByExternalId).mockResolvedValue('uuid-linked');

    const result = await ensureOAuthLocalUser(store, createDraft());

    expect(store.createUser).not.toHaveBeenCalled();
    expect(store.refreshMetadata).toHaveBeenCalled();
    expect(store.upsertLink).toHaveBeenCalledWith(
      'uuid-linked',
      expect.any(Object)
    );
    expect(result.authUserId).toBe('uuid-linked');
  });

  it('links existing email user when no external id conflict', async () => {
    vi.mocked(store.findByEmail).mockResolvedValue({
      id: 'uuid-email',
      externalUserId: null
    });

    const result = await ensureOAuthLocalUser(store, createDraft());

    expect(store.createUser).not.toHaveBeenCalled();
    expect(store.upsertLink).toHaveBeenCalledWith(
      'uuid-email',
      expect.any(Object)
    );
    expect(result.authUserId).toBe('uuid-email');
  });

  it('rejects email already linked to another external id', async () => {
    vi.mocked(store.findByEmail).mockResolvedValue({
      id: 'uuid-email',
      externalUserId: '99'
    });

    await expect(ensureOAuthLocalUser(store, createDraft())).rejects.toThrow(
      /already linked/
    );
  });

  it('uses synthetic email when upstream has none', async () => {
    await ensureOAuthLocalUser(
      store,
      createDraft({ email: null, externalUserId: '7' })
    );

    expect(store.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: '7@brain.users.local'
      })
    );
  });
});
