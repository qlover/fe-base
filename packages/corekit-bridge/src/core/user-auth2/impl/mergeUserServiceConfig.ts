import { AsyncStore } from '../../store-state';
import {
  GatewayService,
  GatewayServiceOptions
} from './GatewayService';
import { UserServiceConfig, UserServiceGateway } from './UserService';

export function mergeUserServiceConfig<Credential, User>(
  config?: Partial<UserServiceConfig<Credential, User>>
): UserServiceConfig<Credential, User> {
  return {};
}

export type UserServiceOptionsType<Credential, User> =
  | GatewayServiceOptions<
      Credential,
      UserServiceGateway<Credential, User>,
      string
    >
  | GatewayService<
      Credential,
      UserServiceGateway<Credential, User>,
      AsyncStore<Credential, string>
    >;

export function createService<Credential, User>(
  serviceName: string,
  value: UserServiceOptionsType<Credential, User>
): UserServiceConfig<Credential, User> {
  return {
    ...value,
    loginStore: createStore<Credential, string>(value?.loginStore),
    userInfoStore: createStore<User, string>(value?.userInfoStore)
  };
}
