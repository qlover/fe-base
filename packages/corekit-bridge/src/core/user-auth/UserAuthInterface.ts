import type {
  LoginResponseData,
  UserAuthServiceInterface
} from './UserAuthServiceInterface';
import type { UserAuthStoreInterface } from './UserAuthStoreInterface';

/**
 *
 * @example
 *
 *
 * const userAuth = new UserAuth({
 *   baseURL: ''
 * });
 *
 * userAuth.login({
 *   email: 'test@test.com',
 *   password: 'test'
 * });
 *
 * userAuth.getUserInfo();
 *
 * userAuth.logout();
 */
export interface UserAuthInterface<User> {
  get store(): UserAuthStoreInterface<User>;
  get service(): UserAuthServiceInterface<User>;

  login(params: unknown): Promise<LoginResponseData>;
  login(token: string): Promise<LoginResponseData>;

  fetchUserInfo(token?: string): Promise<User>;

  logout(): Promise<void> | void;

  isAuthenticated(): boolean;
}
