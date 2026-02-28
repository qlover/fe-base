import { useStore } from '@brain-toolkit/react-kit';
import { AsyncStoreStatus } from '@qlover/corekit-bridge';
import { I } from '@shared/config/ioc-identifiter';
import type { UserCredential, UserSchema } from '@shared/schemas/UserSchema';
import { useIOC } from './useIOC';
import type { UserStateInterface } from '@qlover/corekit-bridge';

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

export function useUserAuth() {
  const userService = useIOC(I.UserServiceInterface);
  const userStore = userService.getStore().getStore();

  const success = useStore(userStore, successSelector);
  const loading = useStore(userStore, loadingSelector);
  const error = useStore(userStore, errorSelector);
  const user = useStore(userStore, userSelector);

  return { success, loading, error, user, userService, userStore };
}
