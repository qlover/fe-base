import { UserStore, UserStoreOptions } from '../impl/UserStore';
import {
  UserStateInterface,
  UserStoreInterface
} from '../interface/UserStoreInterface';
import { isUserStoreInterface } from './typeGuards';

/**
 * Create or use provided UserStore instance
 *
 * Checks if the provided storeOptions is a UserStoreInterface instance.
 * If it is, returns it directly. Otherwise, creates a new UserStore with the options.
 *
 * @param storeOptions - UserStore instance or configuration options
 * @returns UserStore instance (implements UserStoreInterface)
 */
export function createUserStore<User, Credential, Key, Opt = unknown>(
  storeOptions?:
    | UserStoreInterface<User, Credential>
    | UserStoreOptions<UserStateInterface<User, Credential>, Key, Opt>
): UserStore<User, Credential, Key, Opt> {
  if (isUserStoreInterface(storeOptions)) {
    return storeOptions as UserStore<User, Credential, Key, Opt>;
  }

  return new UserStore<User, Credential, Key, Opt>(storeOptions);
}
