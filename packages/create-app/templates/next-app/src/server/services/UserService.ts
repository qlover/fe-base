import { inject, injectable } from 'inversify';
import { isEmpty, last, omit } from 'lodash';
import type { UserSchema } from '@migrations/schema/UserSchema';
import {
  API_USER_NOT_FOUND,
  API_USER_ALREADY_EXISTS
} from '@config/Identifier/api';
import { PasswordEncrypt } from '../PasswordEncrypt';
import { UserRepository } from '../repositorys/UserRepository';
import { ServerAuth } from '../ServerAuth';
import {
  UserCredentialToken,
  type UserCredentialTokenValue
} from '../UserCredentialToken';
import type { CrentialTokenInterface } from '../port/CrentialTokenInterface';
import type { ServerAuthInterface } from '../port/ServerAuthInterface';
import type { UserRepositoryInterface } from '../port/UserRepositoryInterface';
import type { UserServiceInterface } from '../port/UserServiceInterface';
import type { Encryptor } from '@qlover/fe-corekit';

@injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @inject(UserRepository)
    protected userRepository: UserRepositoryInterface,
    @inject(ServerAuth)
    protected userAuth: ServerAuthInterface,
    @inject(PasswordEncrypt)
    protected encryptor: Encryptor<string, string>,
    @inject(UserCredentialToken)
    protected credentialToken: CrentialTokenInterface<UserCredentialTokenValue>
  ) {}

  async register(params: {
    email: string;
    password: string;
  }): Promise<UserSchema> {
    const user = await this.userRepository.getUserByEmail(params.email);

    if (!isEmpty(user)) {
      throw new Error(API_USER_ALREADY_EXISTS);
    }

    const result = await this.userRepository.add({
      email: params.email,
      password: this.encryptor.encrypt(params.password)
    });

    const target = last(result);
    if (!target) {
      throw new Error(API_USER_NOT_FOUND);
    }

    return omit(target, 'password') as UserSchema;
  }

  async login(params: {
    email: string;
    password: string;
  }): Promise<UserSchema> {
    const user = await this.userRepository.getUserByEmail(params.email);

    if (!user) {
      throw new Error(API_USER_NOT_FOUND);
    }

    const encryptedPassword = this.encryptor.encrypt(params.password);

    if (encryptedPassword !== user.password) {
      throw new Error(API_USER_NOT_FOUND);
    }

    const credentialToken = await this.credentialToken.generateToken(user);

    await this.userRepository.updateById(user.id, {
      credential_token: credentialToken
    });

    return Object.assign(omit(user, 'password') as UserSchema, {
      credential_token: credentialToken
    });
  }

  async logout(): Promise<void> {
    const auth = await this.userAuth.getAuth();

    if (!auth) {
      return;
    }

    try {
      const user = await this.credentialToken.parseToken(auth);

      console.log('user', user);

      await this.userRepository.updateById(user.id, {
        credential_token: ''
      });
    } catch {
      return;
    }

    await this.userAuth.clear();
  }
}
