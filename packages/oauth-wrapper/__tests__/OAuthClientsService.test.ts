import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  OAuthClientCreate,
  OAuthClientDetail,
  OAuthClientListItem,
  OAuthClientRow,
  OAuthClientUpdate
} from '../src/core/schema/OAuthAuthorizeSchema';
import type { OAuthClientsRepositoryInterface } from '../src/core/interfaces/OAuthClientsRepositoryInterface';
import { OAuthClientsService } from '../src/server/services/OAuthClientsService';
import { createMockOAuthClient } from './helpers/mockOAuthClient';

class MockClientsRepo implements OAuthClientsRepositoryInterface {
  public clients = new Map<string, OAuthClientRow>();

  public findClientById = vi.fn(async (clientId: string) => {
    return this.clients.get(clientId) ?? null;
  });

  public listClientByOwner = vi.fn(
    async (_ownerUserId: string): Promise<OAuthClientListItem[]> => {
      return Array.from(this.clients.values()).map((client) => ({
        client_id: client.client_id,
        client_name: client.client_name,
        client_uri: client.client_uri,
        logo_uri: client.logo_uri,
        redirect_uris: client.redirect_uris,
        confidential: client.confidential,
        created_at: client.created_at,
        updated_at: client.updated_at
      }));
    }
  );

  public createClient = vi.fn(
    async (ownerUserId: string, input: OAuthClientCreate) => {
      const client = createMockOAuthClient({
        client_id: 'new-client',
        owner_user_id: ownerUserId,
        client_name: input.client_name,
        redirect_uris: input.redirect_uris,
        confidential: input.confidential ?? true
      });
      this.clients.set(client.client_id, client);
      return { client, clientSecret: 'generated-secret' };
    }
  );

  public updateClient = vi.fn(
    async (
      _ownerUserId: string,
      clientId: string,
      input: OAuthClientUpdate
    ): Promise<OAuthClientDetail> => {
      const existing = this.clients.get(clientId)!;
      const updated = {
        ...existing,
        client_name: input.client_name,
        client_uri: input.client_uri ?? existing.client_uri,
        redirect_uris: input.redirect_uris
      };
      this.clients.set(clientId, updated);
      return {
        client_id: updated.client_id,
        client_name: updated.client_name,
        client_uri: updated.client_uri,
        logo_uri: updated.logo_uri,
        redirect_uris: updated.redirect_uris,
        grant_types: updated.grant_types,
        scopes: updated.scopes,
        confidential: updated.confidential,
        created_at: updated.created_at,
        updated_at: updated.updated_at
      };
    }
  );

  public rotateClientSecret = vi.fn(async () => ({
    clientSecret: 'rotated-secret'
  }));

  public deleteClient = vi.fn(
    async (_ownerUserId: string, clientId: string) => {
      this.clients.delete(clientId);
    }
  );

  public verifyClientCredentials = vi.fn(async (clientId: string) => {
    const client = this.clients.get(clientId);
    if (!client) {
      throw new Error('invalid client');
    }
    return client;
  });
}

describe('OAuthClientsService', () => {
  let repo: MockClientsRepo;
  let service: OAuthClientsService;

  beforeEach(() => {
    repo = new MockClientsRepo();
    service = new OAuthClientsService(repo);
    repo.clients.set(
      'owned-client',
      createMockOAuthClient({
        client_id: 'owned-client',
        owner_user_id: '10',
        confidential: true
      })
    );
    repo.clients.set(
      'public-client',
      createMockOAuthClient({
        client_id: 'public-client',
        owner_user_id: '10',
        confidential: false
      })
    );
  });

  it('lists clients for owner', async () => {
    const items = await service.listForOwner('10');

    expect(items).toHaveLength(2);
    expect(repo.listClientByOwner).toHaveBeenCalledWith('10');
  });

  it('returns client detail for owner', async () => {
    const detail = await service.getByClientId('10', 'owned-client');

    expect(detail.client_id).toBe('owned-client');
  });

  it('rejects access to another owner client', async () => {
    await expect(service.getByClientId('99', 'owned-client')).rejects.toThrow(
      'Access denied'
    );
  });

  it('creates a client for owner', async () => {
    const created = await service.create('10', {
      client_name: 'New App',
      redirect_uris: ['https://app.example/callback'],
      confidential: true
    });

    expect(created.client_id).toBe('new-client');
    expect(created.client_secret).toBe('generated-secret');
  });

  it('updates a client after ownership check', async () => {
    const updated = await service.update('10', 'owned-client', {
      client_name: 'Renamed App',
      redirect_uris: ['https://app.example/callback']
    });

    expect(updated.client_name).toBe('Renamed App');
    expect(repo.updateClient).toHaveBeenCalled();
  });

  it('rotates secret for confidential clients only', async () => {
    const rotated = await service.rotateSecret('10', 'owned-client');

    expect(rotated.client_secret).toBe('rotated-secret');

    await expect(service.rotateSecret('10', 'public-client')).rejects.toThrow(
      'Public clients do not have a client_secret'
    );
  });

  it('deletes a client after ownership check', async () => {
    await service.delete('10', 'owned-client');

    expect(repo.deleteClient).toHaveBeenCalledWith('10', 'owned-client');
    expect(repo.clients.has('owned-client')).toBe(false);
  });
});
