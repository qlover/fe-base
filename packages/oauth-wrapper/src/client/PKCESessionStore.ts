import type { StorageInterface } from '@qlover/fe-corekit';
import { sessionStorage as browserSessionStorage } from './SessionStorage';
import { DEFAULT_PKCE_STORAGE_KEY } from './interface/OAuthConfig';

/**
 * PKCE session persisted across the authorize redirect.
 */
export type PKCESession = {
  readonly state: string;
  readonly codeVerifier: string;
  readonly locale?: string;
};

export type OAuthClientStoreOptions = {
  pkceStorage?: StorageInterface<string, PKCESession>;
  /**
   * @default {@link DEFAULT_PKCE_STORAGE_KEY}
   */
  pkceStorageKey?: string;
};

function createDefaultPkceStorage(): StorageInterface<string, PKCESession> {
  return {
    setItem(key, value) {
      browserSessionStorage.setItem(key, JSON.stringify(value));
    },
    getItem(key) {
      const raw = browserSessionStorage.getItem(key);
      if (!raw) {
        return null;
      }
      try {
        const parsed = JSON.parse(raw as string) as PKCESession;
        if (
          typeof parsed.state === 'string' &&
          typeof parsed.codeVerifier === 'string' &&
          (parsed.locale === undefined || typeof parsed.locale === 'string')
        ) {
          return parsed;
        }
      } catch {
        /* ignore */
      }
      return null;
    },
    removeItem(key) {
      browserSessionStorage.removeItem(key);
    },
    clear() {
      browserSessionStorage.clear();
    }
  };
}

/**
 * Session-scoped PKCE storage for the authorization code flow.
 */
export class PKCESessionStore {
  private readonly pkceStorage: StorageInterface<string, PKCESession>;
  private readonly pkceStorageKey: string;

  constructor(options?: OAuthClientStoreOptions) {
    this.pkceStorage = options?.pkceStorage ?? createDefaultPkceStorage();
    this.pkceStorageKey = options?.pkceStorageKey ?? DEFAULT_PKCE_STORAGE_KEY;
  }

  public savePkceSession(session: PKCESession): void {
    this.pkceStorage.setItem(this.pkceStorageKey, session);
  }

  public loadPkceSession(): PKCESession | null {
    return this.pkceStorage.getItem(this.pkceStorageKey, null);
  }

  public clearPkceSession(): void {
    this.pkceStorage.removeItem(this.pkceStorageKey);
  }
}
