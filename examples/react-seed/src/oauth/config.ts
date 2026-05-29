import { routerPrefix } from '@config/seed.config';

export type OAuthClientConfig = {
  siteUrl: string;
  clientId: string;
  scope: string;
  redirectPath: string;
};

const DEFAULT_SCOPE = 'openid profile email';
const DEFAULT_REDIRECT_PATH = 'oauth/callback';

export function getOAuthConfig(): OAuthClientConfig | null {
  const siteUrl = import.meta.env.VITE_OAUTH_SITE_URL?.trim().replace(/\/$/, '');
  const clientId = import.meta.env.VITE_OAUTH_CLIENT_ID?.trim();
  if (!siteUrl || !clientId) {
    return null;
  }

  return {
    siteUrl,
    clientId,
    scope: import.meta.env.VITE_OAUTH_SCOPE?.trim() || DEFAULT_SCOPE,
    redirectPath:
      import.meta.env.VITE_OAUTH_REDIRECT_PATH?.trim() || DEFAULT_REDIRECT_PATH
  };
}

export function isOAuthConfigured(): boolean {
  return getOAuthConfig() != null;
}

export function buildRedirectUri(locale: string): string {
  const config = getOAuthConfig();
  if (!config) {
    throw new Error('OAuth is not configured');
  }

  const base = routerPrefix.replace(/\/$/, '');
  return `${window.location.origin}${base}/${locale}/${config.redirectPath}`;
}

export function oauthTokenUrl(siteUrl: string): string {
  return `${siteUrl}/oauth/token`;
}

export function oauthUserinfoUrl(siteUrl: string): string {
  return `${siteUrl}/userinfo`;
}
