import { describe, expect, it } from 'vitest';
import type { StorageInterface } from '@qlover/fe-corekit';
import {
  PKCESessionStore,
  type PKCESession
} from '../src/client/PKCESessionStore';

class MemoryStorage implements StorageInterface<string, PKCESession> {
  private readonly data = new Map<string, PKCESession>();

  public setItem(key: string, value: PKCESession): void {
    this.data.set(key, value);
  }

  public getItem(key: string): PKCESession | null {
    return this.data.get(key) ?? null;
  }

  public removeItem(key: string): void {
    this.data.delete(key);
  }

  public clear(): void {
    this.data.clear();
  }
}

describe('PKCESessionStore', () => {
  it('saves, loads, and clears PKCE sessions', () => {
    const storage = new MemoryStorage();
    const store = new PKCESessionStore({
      pkceStorage: storage,
      pkceStorageKey: 'test-pkce'
    });
    const session = {
      state: 'state-1',
      codeVerifier: 'verifier-1',
      locale: 'en'
    };

    store.savePkceSession(session);
    expect(store.loadPkceSession()).toEqual(session);

    store.clearPkceSession();
    expect(store.loadPkceSession()).toBeNull();
  });

  it('returns null for invalid JSON payloads in default-like storage', () => {
    const storage: StorageInterface<string, PKCESession> & { raw: string } = {
      raw: '',
      setItem(_key, value) {
        this.raw = JSON.stringify(value);
      },
      getItem() {
        if (!this.raw) {
          return null;
        }
        try {
          const parsed = JSON.parse(this.raw) as PKCESession;
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
      removeItem() {
        this.raw = '';
      },
      clear() {
        this.raw = '';
      }
    };
    const store = new PKCESessionStore({ pkceStorage: storage });

    storage.setItem('test-pkce', {
      state: 123,
      codeVerifier: true
    } as unknown as PKCESession);

    expect(store.loadPkceSession()).toBeNull();
  });
});
