import { inject, injectable } from 'inversify';
import { omit } from 'lodash';
import type { LoginValidatorData } from '@/server/validators/LoginValidator';
import {
  isWebUserSchema,
  type UserCredential,
  type UserSchema
} from '@migrations/schema/UserSchema';
import { AppUserApi } from '../services/appApi/AppUserApi';
import type { AppUserApiInterface } from '../port/AppUserApiInterface';
import type { UserServiceGateway } from '@qlover/corekit-bridge';

@injectable()
export class UserServiceApi implements UserServiceGateway<
  UserSchema,
  UserCredential
> {
  constructor(@inject(AppUserApi) protected appUserApi: AppUserApiInterface) {}

  /**
   * @override
   */
  public getUserInfo(_params?: unknown): Promise<UserSchema | null> {
    if (_params && isWebUserSchema(_params).success) {
      return Promise.resolve(omit(_params, 'credential_token') as UserSchema);
    }

    return Promise.resolve(null);
  }

  /**
   * @override
   */
  public refreshUserInfo<Params>(
    _params?: Params | undefined
  ): Promise<UserSchema | null> {
    return this.getUserInfo(_params);
  }

  /**
   * @override
   */
  public async login(params: LoginValidatorData): Promise<UserCredential> {
    const response = await this.appUserApi.login(params);

    if (!response.data.success) {
      throw response;
    }

    return response.data.data as UserCredential;
  }

  /**
   * @override
   */
  public async register(params: LoginValidatorData): Promise<UserSchema> {
    const response = await this.appUserApi.register(params);

    if (!response.data.success) {
      throw response;
    }

    return response.data.data as UserSchema;
  }

  /**
   * @override
   */
  public async logout<P = unknown, Result = void>(params?: P): Promise<Result> {
    const response = await this.appUserApi.logout(params);

    if (!response.data.success) {
      throw response;
    }

    return response.data.data as Result;
  }
}
