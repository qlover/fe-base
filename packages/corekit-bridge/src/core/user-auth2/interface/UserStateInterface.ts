import { AsyncStoreStateInterface } from '../../store-state';

export interface UserStateInterface<User, Credential>
  extends AsyncStoreStateInterface<User> {
  /**
   * Authentication credential
   * @default null
   *
   * @example `'auth-token-123'`
   * @example `{ 'token': 'auth-token-123'}`
   */
  credential: Credential | null;
}
