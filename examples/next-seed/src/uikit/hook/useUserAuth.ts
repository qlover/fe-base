import { useStore } from '@brain-toolkit/react-kit';
import { AsyncStoreStatus } from '@qlover/corekit-bridge';
import { useEffect } from 'react';
import { I } from '@shared/config/ioc-identifiter';
import type { UserCredential, UserSchema } from '@shared/schemas/UserSchema';
import { useIOC } from './useIOC';
import type { UserStateInterface } from '@qlover/corekit-bridge';

const successSelector = (
  state: UserStateInterface<UserSchema, UserCredential>
) => state.status === AsyncStoreStatus.SUCCESS;

const loadingSelector = (
  state: UserStateInterface<UserSchema, UserCredential>
) => state.loading;

const errorSelector = (state: UserStateInterface<UserSchema, UserCredential>) =>
  state.error;

const statusSelector = (
  state: UserStateInterface<UserSchema, UserCredential>
) => state.status;

export function useUserAuth() {
  const userService = useIOC(I.UserServiceInterface);
  const userStore = userService.getStore().getStore();

  const success = useStore(userStore, successSelector);
  const loading = useStore(userStore, loadingSelector);
  const error = useStore(userStore, errorSelector);
  const status = useStore(userStore, statusSelector);

  useEffect(() => {
    if (typeof window !== 'undefined') {
    }
  }, []);

  return { success, loading, error, status, userService, userStore };
}
