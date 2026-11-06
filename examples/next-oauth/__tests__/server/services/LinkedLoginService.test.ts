import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FeOauthUserLinksRepository } from '@server/repositorys/FeOauthUserLinksRepository';
import type { SupabaseRepo } from '@qlover/next-kit/server';

const { LinkedLoginService } =
  await import('@server/services/LinkedLoginService');

describe('LinkedLoginService.listForUser', () => {
  let linksRepository: {
    listByAuthUserId: ReturnType<typeof vi.fn>;
  };
  let getUserById: ReturnType<typeof vi.fn>;
  let service: InstanceType<typeof LinkedLoginService>;

  beforeEach(() => {
    linksRepository = {
      listByAuthUserId: vi.fn().mockResolvedValue([])
    };
    getUserById = vi.fn().mockResolvedValue({
      data: { user: { identities: [] } },
      error: null
    });
    const supabaseBridge = {
      getAdminSupabase: () => ({
        auth: { admin: { getUserById } }
      })
    };
    service = new LinkedLoginService(
      supabaseBridge as unknown as SupabaseRepo<unknown>,
      linksRepository as unknown as FeOauthUserLinksRepository
    );
  });

  it('returns brain links from fe_oauth_user_links', async () => {
    linksRepository.listByAuthUserId.mockResolvedValue([
      {
        auth_user_id: 'u1',
        provider: 'brain',
        external_user_id: 'brain-sub',
        extra: { account: 'alice@brain', env: 'prod' },
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-02T00:00:00.000Z'
      }
    ]);

    const items = await service.listForUser('u1');
    expect(items).toEqual([
      {
        provider: 'brain',
        account: 'alice@brain',
        env: 'prod',
        linked_at: '2026-01-01T00:00:00.000Z',
        last_login_at: '2026-01-02T00:00:00.000Z'
      }
    ]);
  });

  it('returns github/google from Auth identities and skips email/phone', async () => {
    getUserById.mockResolvedValue({
      data: {
        user: {
          identities: [
            {
              provider: 'github',
              identity_data: { user_name: 'octocat' },
              created_at: '2026-02-01T00:00:00.000Z',
              last_sign_in_at: '2026-02-02T00:00:00.000Z'
            },
            {
              provider: 'email',
              identity_data: { email: 'a@example.com' }
            },
            {
              provider: 'google',
              identity_data: { email: 'g@example.com' },
              created_at: '2026-03-01T00:00:00.000Z',
              last_sign_in_at: null
            }
          ]
        }
      },
      error: null
    });

    const items = await service.listForUser('u1');
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      provider: 'github',
      account: 'octocat',
      env: null
    });
    expect(items[1]).toMatchObject({
      provider: 'google',
      account: 'g@example.com'
    });
  });

  it('merges links and Auth; keeps link first when keys collide', async () => {
    linksRepository.listByAuthUserId.mockResolvedValue([
      {
        auth_user_id: 'u1',
        provider: 'github',
        external_user_id: '1',
        extra: { account: 'from-link' },
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z'
      }
    ]);
    getUserById.mockResolvedValue({
      data: {
        user: {
          identities: [
            {
              provider: 'github',
              identity_data: { user_name: 'from-link' },
              created_at: '2026-04-01T00:00:00.000Z',
              last_sign_in_at: '2026-04-02T00:00:00.000Z'
            }
          ]
        }
      },
      error: null
    });

    const items = await service.listForUser('u1');
    expect(items).toHaveLength(1);
    expect(items[0]?.account).toBe('from-link');
    expect(items[0]?.linked_at).toBe('2026-01-01T00:00:00.000Z');
  });

  it('returns empty when Auth lookup fails', async () => {
    getUserById.mockRejectedValue(new Error('no supabase'));
    const items = await service.listForUser('u1');
    expect(items).toEqual([]);
  });
});
