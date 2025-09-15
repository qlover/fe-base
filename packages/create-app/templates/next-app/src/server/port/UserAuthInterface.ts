export interface UserAuthInterface {
  setAuth(credential_token: string): Promise<void>;

  getAuth(): Promise<string>;

  clear(): Promise<void>;

  hasAuth(): Promise<boolean>;
}
