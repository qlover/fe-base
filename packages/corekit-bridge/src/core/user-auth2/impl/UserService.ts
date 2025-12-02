import { AsyncStore } from '../../store-state';
import { LoginInterface } from '../interface/base/LoginInterface';
import { LoginServiceInterface } from '../interface/LoginServiceInterface';
import { RegisterServiceInterface } from '../interface/RegisterServiceInterface';
import { UserInfoServiceInterface } from '../interface/UserInfoServiceInterface';

export interface UserServiceInterface<Credential, User> {
  getCredential(): Credential | null;
  getUser(): User | null;
}

export class UserService<Credential, User> {
  protected loginService: LoginServiceInterface<
    Credential,
    AsyncStore<Credential, string>
  >;
  protected registerService: RegisterServiceInterface<
    User,
    AsyncStore<User, string>
  >;
  protected userInfoService: UserInfoServiceInterface<
    User,
    AsyncStore<User, string>
  >;

  getCredential(): User | null {
    return this.loginService.get();
  }

  getUser(): User | null {
    return this.userInfoService.getUser();
  }

  login(params: LoginParams): Promise<User> {
    return this.loginService.login(params);
  }

  register(params: RegisterParams): Promise<User> {
    return this.registerService.register(params);
  }

  getUserInfo(params: UserInfoParams): Promise<User> {
    return this.userInfoService.getUserInfo(params);
  }
}
