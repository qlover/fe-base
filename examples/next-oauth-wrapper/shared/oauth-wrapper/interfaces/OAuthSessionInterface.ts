export type OAuthSessionPayload = {
  userId: number;
};

export interface OAuthSessionInterface<Payload extends OAuthSessionPayload> {
  getSession(): Promise<Payload | null>;
}
