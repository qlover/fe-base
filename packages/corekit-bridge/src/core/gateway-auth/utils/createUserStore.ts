import { AsyncStoreOptions } from '../../store-state';
import { UserStore } from '../impl/UserStore';
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
 * @returns UserStoreInterface instance
 */
export function createUserStore<User, Credential, Key, Opt = unknown>(
  storeOptions?:
    | UserStoreInterface<User, Credential>
    | AsyncStoreOptions<UserStateInterface<User, Credential>, Key, Opt>
): UserStoreInterface<User, Credential> {
  if (isUserStoreInterface(storeOptions)) {
    return storeOptions;
  }

  return new UserStore<User, Credential, Key, Opt>(storeOptions);
}
