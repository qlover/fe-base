import { inject, injectable } from 'inversify';
import { AppUserApi } from '../services/appApi/AppUserApi';
import type { AppApiSuccessInterface } from '../port/AppApiInterface';
import type { AppUserApiInterface } from '../port/AppUserApiInterface';
import type { UserSchema } from '@migrations/schema/UserSchema';
import type {
  LoginResponseData,
  UserAuthApiInterface,
  UserAuthStoreInterface
} from '@qlover/corekit-bridge';

@injectable()
export class UserServiceApi implements UserAuthApiInterface<UserSchema> {
  protected store: UserAuthStoreInterface<UserSchema> | null = null;

  constructor(@inject(AppUserApi) protected appUserApi: AppUserApiInterface) {}

  getStore(): UserAuthStoreInterface<UserSchema> | null {
    return this.store;
  }
  setStore(store: UserAuthStoreInterface<UserSchema>): void {
    this.store = store;
  }

  async login(params: {
    email: string;
    password: string;
  }): Promise<LoginResponseData> {
    const response = await this.appUserApi.login(params);
    return (response as AppApiSuccessInterface).data as LoginResponseData;
  }

  async register(params: {
    email: string;
    password: string;
  }): Promise<LoginResponseData> {
    const response = await this.appUserApi.register(params);
    return (response as AppApiSuccessInterface).data as LoginResponseData;
  }

  logout(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getUserInfo(): Promise<UserSchema> {
    throw new Error('Method not implemented.');
  }
}
