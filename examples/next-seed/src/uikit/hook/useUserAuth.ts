import { AsyncStoreStatus } from '@qlover/corekit-bridge';
import { useStore } from '@qlover/next-kit/client';
import { I } from '@config/ioc-identifiter';
import { useIOC } from './useIOC';
import type { UserStateInterface } from '@qlover/corekit-bridge';
import type { UserCredential, UserSchema } from '@qlover/next-kit/common';

const successSelector = (
  state: UserStateInterface<UserSchema, UserCredential>
) => state.status === AsyncStoreStatus.SUCCESS;

const loadingSelector = (
  state: UserStateInterface<UserSchema, UserCredential>
) => {
  return (
    state.loading ||
    state.status === AsyncStoreStatus.DRAFT ||
    state.status === AsyncStoreStatus.PENDING
  );
};

const errorSelector = (state: UserStateInterface<UserSchema, UserCredential>) =>
  state.error;

const userSelector = (
  state: UserStateInterface<UserSchema, UserCredential>
): UserSchema | undefined => state.result as UserSchema | undefined;

/**
 * Client user-session selectors for local UI (auth button, admin affordances).
 *
 * Not a page-entry gate — middleware + LOGINED_PAGES owns that. Prefer reading
 * `loading` / `success` only to adapt local chrome, never to blank the page.
 */
export function useUserAuth() {
  const userService = useIOC(I.UserServiceInterface);

  const userStore = userService.getUIStore();

  const success = useStore(userStore, successSelector);
  const loading = useStore(userStore, loadingSelector);
  const error = useStore(userStore, errorSelector);
  const user = useStore(userStore, userSelector);

  return { success, loading, error, user, userService, userStore };
}
