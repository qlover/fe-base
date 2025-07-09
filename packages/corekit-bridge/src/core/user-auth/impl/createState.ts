import { UserAuthStoreOptions } from '../interface/UserAuthStoreInterface';
import { PickUser, UserAuthState } from './UserAuthState';

/**
 * Get default state for the user authentication store
 *
 * @param options - Configuration options for storage and initial state
 * @returns The default state for the user authentication store
 */
export function createState<State extends UserAuthState<unknown>>(
  options: UserAuthStoreOptions<State>
): State {
  const { userStorage, credentialStorage, defaultState } = options;

  const defaultCredential = credentialStorage?.get();
  const defaultUserInfo = userStorage?.get();

  const state = defaultState
    ? typeof defaultState === 'function'
      ? defaultState(
          defaultUserInfo as PickUser<State>,
          defaultCredential as string
        )
      : defaultState
    : new UserAuthState(defaultUserInfo, defaultCredential);

  if (
    state == null ||
    typeof state !== 'object' ||
    !(state instanceof UserAuthState)
  ) {
    throw new Error('Please check the state is a instance of UserAuthState');
  }

  return state as State;
}
