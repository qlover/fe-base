import type { SyncStorageInterface } from '../../storage';
import { StoreInterface } from '../../store-state';
import {
  LOGIN_STATUS,
  type UserAuthStoreInterface
} from '../interface/UserAuthStoreInterface';

export class UserAuthStoreState<User> {
  /**
   * Save user info in priority store
   */
  constructor(public userInfo: User | null = null) {}

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
    protected persistent: SyncStorageInterface<string, User> | null = null
  ) {
    super(() => new UserAuthStoreState(persistent?.get()));
  }

  setTokenStorage(userToken: SyncStorageInterface<string, User>): void {
    this.persistent = userToken;
  }

  getTokenStorage(): SyncStorageInterface<string, User> | null {
    return this.persistent;
  }

  setUserInfo(params: User): void {
    this.emit({ ...this.state, userInfo: params });

    // persist token
    this.persistent?.set(params);
  }

  getUserInfo(): User | null {
    return this.state.userInfo;
  }

  getLoginStatus(): LOGIN_STATUS | null {
    return this.state.loginStatus;
  }

  override reset(): void {
    super.reset();
    this.persistent?.remove();
  }

  startAuth(): void {
    this.emit({
      ...this.state,
      loginStatus: LOGIN_STATUS.LOADING,
      error: null
    });
  }

  authSuccess(userInfo?: User): void {
    this.emit({
      ...this.state,
      loginStatus: LOGIN_STATUS.SUCCESS,
      error: null
    });

    if (userInfo) {
      this.setUserInfo(userInfo);
    }
  }

  authFailed(error: unknown): void {
    this.emit({ ...this.state, loginStatus: LOGIN_STATUS.FAILED, error });
  }
}
