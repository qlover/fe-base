const STORAGE_KEY = 'react-seed:oauth-pkce';

export type OAuthPkceSession = {
  state: string;
  codeVerifier: string;
  locale: string;
};

export function saveOAuthPkceSession(session: OAuthPkceSession): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadOAuthPkceSession(): OAuthPkceSession | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as OAuthPkceSession;
    if (
      typeof parsed.state === 'string' &&
      typeof parsed.codeVerifier === 'string' &&
      typeof parsed.locale === 'string'
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function clearOAuthPkceSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
