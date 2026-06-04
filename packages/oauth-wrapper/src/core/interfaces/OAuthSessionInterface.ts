export type OAuthSessionPayload = {
  userId: string;
  email: string;
  name: string;
  providerSessionToken: string;
};

export interface OAuthSessionInterface<Payload extends OAuthSessionPayload> {
  getSession(): Promise<Payload | null>;
  hasSession(): Promise<boolean>;
  setSession(payload: Payload): Promise<void>;
  clearSession(): Promise<void>;
}
