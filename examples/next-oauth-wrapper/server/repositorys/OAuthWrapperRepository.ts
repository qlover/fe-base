import { injectable } from '@shared/container';
import type {
  OAuthClientRow,
  OAuthClientListItem,
  OAuthClientDetail,
  OAuthClientCreate,
  OAuthClientUpdate,
  OAuthAuthorizationCodeRow,
  CreateAuthorizationCodeInput,
  CreateOAuthRefreshTokenInput,
  OAuthWrapperRepositoryInterface,
  OAuthRefreshTokenRow,
  OAuthUserCredentialsRow
} from '@shared/oauth-wrapper';
import {
  verifyClientSecret,
  hashClientSecret
} from '@shared/oauth-wrapper/utils/clientSecretHash';
import { BaseRepo } from './BaseRepo';

@injectable()
export class OAuthWrapperRepository
  extends BaseRepo
  implements OAuthWrapperRepositoryInterface
{
  /**
   * @override
   */
  public async create(input: CreateAuthorizationCodeInput): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('n_oauth_wrapper__authorization_codes')
      .insert({
        code: input.code,
        client_id: input.client_id,
        user_id: input.user_id,
        redirect_uri: input.redirect_uri,
        scope: input.scope,
        code_challenge: input.code_challenge,
        code_challenge_method: input.code_challenge_method,
        expires_at: input.expires_at,
        used: false
      });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Atomically marks a valid, unused, non-expired code as used and returns the row.

   * @override
      */
  public async consumeCode(
    code: string
  ): Promise<OAuthAuthorizationCodeRow | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('n_oauth_wrapper__authorization_codes')
      .update({ used: true })
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .select('*')
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return (data as OAuthAuthorizationCodeRow | null) ?? null;
  }

  /**
   * @override
   */
  public async getUserCredentials(
    userId: number
  ): Promise<OAuthUserCredentialsRow | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('n_oauth_wrapper__user_credentials')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    return (data as OAuthUserCredentialsRow | null) ?? null;
  }

  /**
   * @override
   */
  public async upsertUserCredentials(
    userId: number,
    fields: {
      provider_refresh_token?: string | null;
      provider_session_token?: string | null;
    }
  ): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('n_oauth_wrapper__user_credentials')
      .upsert(
        {
          user_id: userId,
          ...fields,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @override
   */
  public async findRefreshToken(
    tokenHash: string
  ): Promise<OAuthRefreshTokenRow | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('n_oauth_wrapper__refresh_tokens')
      .select('*')
      .eq('refresh_token', tokenHash)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    return (data as OAuthRefreshTokenRow | null) ?? null;
  }

  /**
   * @override
   */
  public async upsertRefreshToken(input: {
    refresh_token: string;
    client_id: string;
    user_id: number;
    expires_at: string;
  }): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('n_oauth_wrapper__refresh_tokens')
      .upsert(
        {
          ...input,
          revoked: false
        },
        { onConflict: 'refresh_token' }
      );

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @override
   */
  public async revokeRefreshToken(tokenHash: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('n_oauth_wrapper__refresh_tokens')
      .update({ revoked: true })
      .eq('refresh_token', tokenHash);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @override
   */
  public async findByTokenHash(
    tokenHash: string
  ): Promise<OAuthRefreshTokenRow | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('n_oauth_wrapper__refresh_tokens')
      .select('*')
      .eq('refresh_token', tokenHash)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return (data as OAuthRefreshTokenRow | null) ?? null;
  }

  /**
   * @override
   */
  public async createRefreshToken(
    input: CreateOAuthRefreshTokenInput
  ): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('n_oauth_wrapper__refresh_tokens')
      .insert({
        refresh_token: input.refresh_token,
        client_id: input.client_id,
        user_id: input.user_id,
        expires_at: input.expires_at,
        revoked: false
      });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @override
   */
  public async revokeByTokenHash(tokenHash: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('n_oauth_wrapper__refresh_tokens')
      .update({ revoked: true })
      .eq('refresh_token', tokenHash);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @override
   */
  public async findClientById(
    clientId: string
  ): Promise<OAuthClientRow | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('n_oauth_wrapper__clients')
      .select('*')
      .eq('client_id', clientId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return (data as OAuthClientRow | null) ?? null;
  }

  /**
   * @override
   */
  public async listClientByOwner(
    ownerUserId: number
  ): Promise<OAuthClientListItem[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('n_oauth_wrapper__clients')
      .select(
        'client_id, client_name, client_uri, logo_uri, redirect_uris, confidential, created_at, updated_at'
      )
      .eq('owner_user_id', ownerUserId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data as OAuthClientListItem[]) ?? [];
  }

  /**
   * @override
   */
  public async createClient(
    ownerUserId: number,
    input: OAuthClientCreate
  ): Promise<{ client: OAuthClientRow; clientSecret?: string }> {
    const supabase = await this.getSupabase();

    const confidential = input.confidential ?? true;
    const clientId = `client_${Math.random().toString(36).substring(2, 15)}`;

    let clientSecret: string | undefined;
    let clientSecretHash: string | null = null;

    if (confidential) {
      clientSecret =
        Math.random().toString(36).substring(2, 20) +
        Math.random().toString(36).substring(2, 20);
      clientSecretHash = await hashClientSecret(clientSecret);
    }

    const { data, error } = await supabase
      .from('n_oauth_wrapper__clients')
      .insert({
        client_id: clientId,
        client_secret_hash: clientSecretHash,
        client_name: input.client_name,
        client_uri: input.client_uri || null,
        redirect_uris: input.redirect_uris,
        grant_types: ['authorization_code', 'refresh_token'],
        scopes: ['openid', 'profile', 'email'],
        confidential,
        owner_user_id: ownerUserId
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      client: data as OAuthClientRow,
      clientSecret
    };
  }

  /**
   * @override
   */
  public async updateClient(
    ownerUserId: number,
    clientId: string,
    input: OAuthClientUpdate
  ): Promise<OAuthClientDetail> {
    const supabase = await this.getSupabase();

    const { data, error } = await supabase
      .from('n_oauth_wrapper__clients')
      .update({
        client_name: input.client_name,
        client_uri: input.client_uri || null,
        redirect_uris: input.redirect_uris,
        updated_at: new Date().toISOString()
      })
      .eq('client_id', clientId)
      .eq('owner_user_id', ownerUserId)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Client not found or access denied');
    }

    return this.mapToDetail(data as OAuthClientRow);
  }

  /**
   * @override
   */
  public async rotateClientSecret(
    ownerUserId: number,
    clientId: string
  ): Promise<{ clientSecret: string }> {
    const existing = await this.findClientById(clientId);
    if (!existing?.confidential) {
      throw new Error('public_client_no_secret');
    }

    const supabase = await this.getSupabase();

    // Generate new secret
    const clientSecret =
      Math.random().toString(36).substring(2, 20) +
      Math.random().toString(36).substring(2, 20);
    const clientSecretHash = await hashClientSecret(clientSecret);

    const { error } = await supabase
      .from('n_oauth_wrapper__clients')
      .update({
        client_secret_hash: clientSecretHash,
        updated_at: new Date().toISOString()
      })
      .eq('client_id', clientId)
      .eq('owner_user_id', ownerUserId);

    if (error) {
      throw new Error(error.message);
    }

    return { clientSecret };
  }

  /**
   * @override
   */
  public async deleteClient(
    ownerUserId: number,
    clientId: string
  ): Promise<void> {
    const supabase = await this.getSupabase();

    const { error } = await supabase
      .from('n_oauth_wrapper__clients')
      .delete()
      .eq('client_id', clientId)
      .eq('owner_user_id', ownerUserId);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @override
   */
  public async verifyClientCredentials(
    clientId: string,
    clientSecret: string | undefined
  ): Promise<OAuthClientRow> {
    const client = await this.findClientById(clientId);
    if (!client) {
      throw new Error('invalid_client');
    }

    if (client.confidential) {
      if (!clientSecret?.trim()) {
        throw new Error('invalid_client');
      }
      if (!client.client_secret_hash) {
        throw new Error('invalid_client');
      }
      const valid = await verifyClientSecret(
        clientSecret,
        client.client_secret_hash
      );
      if (!valid) {
        throw new Error('invalid_client');
      }
    }

    return client;
  }

  private mapToDetail(row: OAuthClientRow): OAuthClientDetail {
    return {
      client_id: row.client_id,
      client_name: row.client_name,
      client_uri: row.client_uri,
      logo_uri: row.logo_uri,
      redirect_uris: row.redirect_uris,
      grant_types: row.grant_types,
      scopes: row.scopes,
      confidential: row.confidential,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}
