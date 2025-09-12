import { inject, injectable } from 'inversify';
import { isEmpty } from 'lodash';
import {
  API_USER_NOT_FOUND,
  API_USER_ALREADY_EXISTS
} from '@config/Identifier/api';
import { PasswordEncrypt } from '../PasswordEncrypt';
import { UserRepository } from '../repositorys/UserRepository';
import type { UserRepositoryInterface } from '../port/UserRepositoryInterface';
import type { UserServiceInterface } from '../port/UserServiceInterface';
import type { UserSchema } from '@migrations/schema/UserSchema';
import type { Encryptor } from '@qlover/fe-corekit';

@injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @inject(UserRepository)
    protected userRepository: UserRepositoryInterface,
    @inject(PasswordEncrypt)
    protected encryptor: Encryptor<string, string>
  ) {}

  async register(params: { email: string; password: string }): Promise<void> {
    const user = await this.userRepository.getUserByEmail(params.email);

    if (!isEmpty(user)) {
      throw new Error(API_USER_ALREADY_EXISTS);
    }

    const result = await this.userRepository.add({
      email: params.email,
      password: this.encryptor.encrypt(params.password)
    });

    if (!result) {
      throw new Error(API_USER_NOT_FOUND);
    }
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

    return user;
  }
}
