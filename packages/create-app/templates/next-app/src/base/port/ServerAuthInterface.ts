export interface ServerAuthInterface {
  hasAuth(): Promise<boolean>;
}
