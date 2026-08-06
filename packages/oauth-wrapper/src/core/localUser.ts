/**
 * Local identity linking: map upstream IdP users to a stable local user id
 * (e.g. auth.users UUID) without coupling oauth-wrapper to a specific DB.
 */

export type OAuthLocalUserDraft = {
  /** Upstream IdP key (brain, acme, …). */
  readonly provider: string;
  /** Stable id from the upstream API. */
  readonly externalUserId: string;
  readonly email?: string | null;
  readonly name?: string | null;
  readonly phone?: string | null;
  /**
   * Optional extra profile fields stored by the IdentityStore implementation
   * (link row `extra`, user_metadata, …).
   */
  readonly extra?: Record<string, unknown> | null;
};

export type OAuthLocalUserRecord = {
  readonly authUserId: string;
  readonly provider: string;
  readonly externalUserId: string;
  readonly email: string;
  readonly name: string;
};

/**
 * Existing local user found by email (for link / conflict checks).
 */
export type OAuthIdentityEmailUser = {
  readonly id: string;
  /** Bound external id for this provider, if any. */
  readonly externalUserId?: string | null;
};

/**
 * Persistence CRUD for local users + IdP links. No orchestration.
 * Apps implement this (e.g. Supabase auth.users + links table).
 */
export interface OAuthIdentityStore {
  findAuthUserIdByExternalId(
    provider: string,
    externalUserId: string
  ): Promise<string | null>;

  findByEmail(email: string): Promise<OAuthIdentityEmailUser | null>;

  /**
   * Create a local user from a draft. `draft.email` is the address to store
   * (may be synthetic). Returns the new local id.
   */
  createUser(draft: OAuthLocalUserDraft & { email: string; name: string }): Promise<string>;

  upsertLink(
    authUserId: string,
    draft: OAuthLocalUserDraft & { name: string }
  ): Promise<void>;

  /**
   * Best-effort metadata refresh. Implementations may log and swallow errors.
   */
  refreshMetadata(
    authUserId: string,
    draft: OAuthLocalUserDraft & { name: string; email: string | null }
  ): Promise<void>;
}

export const DEFAULT_OAUTH_SYNTHETIC_EMAIL_DOMAIN = 'users.local';

/**
 * Build a synthetic email when upstream has none.
 * Format: `{safeId}@{safeProvider}.{domain}`
 */
export function buildOAuthSyntheticEmail(
  provider: string,
  externalUserId: string,
  domain: string = DEFAULT_OAUTH_SYNTHETIC_EMAIL_DOMAIN
): string {
  const safeProvider = provider.replace(/[^a-z0-9_-]/gi, '') || 'oauth';
  const safeId =
    externalUserId.replace(/[^a-z0-9._+-]/gi, '_').slice(0, 64) || 'user';
  return `${safeId}@${safeProvider}.${domain}`;
}

/**
 * Normalize a real email; returns null for empty or synthetic addresses.
 */
export function resolveOAuthRealEmail(
  email: string | null | undefined,
  syntheticDomain: string = DEFAULT_OAUTH_SYNTHETIC_EMAIL_DOMAIN
): string | null {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  if (normalized.endsWith(`.${syntheticDomain}`)) {
    return null;
  }
  return normalized;
}

/**
 * Find-or-create local identity from a draft using an IdentityStore.
 * Extracted for unit testing without a full OAuthWrapperService.
 */
export async function ensureOAuthLocalUser(
  store: OAuthIdentityStore,
  draft: OAuthLocalUserDraft,
  options?: { syntheticEmailDomain?: string }
): Promise<OAuthLocalUserRecord> {
  const externalUserId = String(draft.externalUserId ?? '').trim();
  if (!externalUserId) {
    throw new Error('externalUserId is required');
  }

  const provider = String(draft.provider ?? '').trim();
  if (!provider) {
    throw new Error('provider is required');
  }

  const syntheticDomain =
    options?.syntheticEmailDomain ?? DEFAULT_OAUTH_SYNTHETIC_EMAIL_DOMAIN;
  const displayName = (draft.name ?? '').trim() || externalUserId;
  const realEmail = resolveOAuthRealEmail(draft.email, syntheticDomain);
  const sessionEmail =
    realEmail ??
    buildOAuthSyntheticEmail(provider, externalUserId, syntheticDomain);

  const normalizedDraft: OAuthLocalUserDraft & { name: string } = {
    ...draft,
    provider,
    externalUserId,
    email: realEmail,
    name: displayName,
    extra:
      draft.extra &&
      typeof draft.extra === 'object' &&
      !Array.isArray(draft.extra) &&
      Object.keys(draft.extra).length > 0
        ? { ...draft.extra }
        : null
  };

  const byLink = await store.findAuthUserIdByExternalId(
    provider,
    externalUserId
  );
  if (byLink) {
    await store.refreshMetadata(byLink, {
      ...normalizedDraft,
      email: realEmail
    });
    await store.upsertLink(byLink, normalizedDraft);
    return {
      authUserId: byLink,
      provider,
      externalUserId,
      email: sessionEmail,
      name: displayName
    };
  }

  if (realEmail) {
    const byEmail = await store.findByEmail(realEmail);
    if (byEmail) {
      const existingExternalId = byEmail.externalUserId
        ? String(byEmail.externalUserId)
        : null;
      if (existingExternalId && existingExternalId !== externalUserId) {
        throw new Error(
          `Email ${realEmail} is already linked to a different ${provider} user`
        );
      }
      await store.upsertLink(byEmail.id, normalizedDraft);
      await store.refreshMetadata(byEmail.id, {
        ...normalizedDraft,
        email: realEmail
      });
      return {
        authUserId: byEmail.id,
        provider,
        externalUserId,
        email: realEmail,
        name: displayName
      };
    }
  }

  const authUserId = await store.createUser({
    ...normalizedDraft,
    email: sessionEmail,
    name: displayName
  });
  await store.upsertLink(authUserId, normalizedDraft);

  return {
    authUserId,
    provider,
    externalUserId,
    email: sessionEmail,
    name: displayName
  };
}
