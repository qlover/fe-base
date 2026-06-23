export interface ServerAuthInterface {
  setAuth(credential_token: string): Promise<void>;

  getCredential(): Promise<string | null>;

  clear(): Promise<void>;

  hasAuth(): Promise<boolean>;

  throwIfNotAuth(): Promise<void>;
}
