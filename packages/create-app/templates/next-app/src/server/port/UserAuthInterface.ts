
export interface UserAuthInterface {
  setAuth(credential_token: string): Promise<void>;

  hasAuth(): Promise<boolean>;
}
