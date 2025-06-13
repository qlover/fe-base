import type { StorageTokenInterface } from '../../storage';
import { StoreInterface } from '../../store-state';
import {
  LOGIN_STATUS,
  UserAuthStoreInterface
} from '../UserAuthStoreInterface';

export class UserAuthStoreState<User> {
  constructor(
    /**
     * Save token in priority store
     */
    public token: string
  ) {}
  /**
   * Save user info in priority store
   */
  userInfo: User | null = null;
  /**
   * Save login status in priority store
   */
  loginStatus: LOGIN_STATUS | null = null;

  /**
   * User auth error
   *
   * maybe login failed, fetch user info failed, etc.
   */
  error: unknown | null = null;
}

export class UserAuthStore<User>
  extends StoreInterface<UserAuthStoreState<User>>
  implements UserAuthStoreInterface<User>
{
  constructor(
    /**
     * If not provided, the token will be stored in the priority store
     */
    protected userToken: StorageTokenInterface<string> | null = null
  ) {
    super(() => new UserAuthStoreState(userToken?.getToken() || ''));
  }

  setToken(token: string): void {
    this.emit({ ...this.state, token });
    this.userToken?.setToken(token);
  }

  getToken(): string | null {
    return this.state.token;
  }

  setUserInfo(params: User): void {
    this.emit({ ...this.state, userInfo: params });
  }

  getUserInfo(): User | null {
    return this.state.userInfo;
  }

  getLoginStatus(): LOGIN_STATUS | null {
    return this.state.loginStatus;
  }

  override reset(): void {
    super.reset();
    this.userToken?.removeToken();
  }

  startAuth(): void {
    this.emit({
      ...this.state,
      loginStatus: LOGIN_STATUS.LOADING,
      error: null
    });
  }

  authSuccess(): void {
    this.emit({
      ...this.state,
      loginStatus: LOGIN_STATUS.SUCCESS,
      error: null
    });
  }

  authFailed(error: unknown): void {
    this.emit({ ...this.state, loginStatus: LOGIN_STATUS.FAILED, error });
  }
}
