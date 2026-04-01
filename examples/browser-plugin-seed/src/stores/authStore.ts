import type { UserStateInterface } from '@qlover/corekit-bridge';
import { UserStore } from '@qlover/corekit-bridge/gateway-service';
import {
  AsyncStoreStatus,
  type StoreInterface
} from '@qlover/corekit-bridge/store-state';
import type { StorageInterface } from '@qlover/fe-corekit';
import type { UserCredentialSchema, UserSchema } from '@schemas/UserSchema';

export type UserCredential = string;

export interface AuthStoreStateInterface
  extends UserStateInterface<UserSchema, UserCredentialSchema> {
  openLoginForm: boolean;
  code: string;
}

function defaultState(): AuthStoreStateInterface {
  return {
    result: null,
    credential: null,
    status: AsyncStoreStatus.DRAFT,
    loading: false,
    error: null,
    startTime: 0,
    endTime: 0,
    openLoginForm: false,
    code: ''
  };
}

export class AuthStore extends UserStore<
  UserSchema,
  UserCredentialSchema,
  string
> {
  public get state(): AuthStoreStateInterface {
    return this.getState() as AuthStoreStateInterface;
  }

  constructor(storage: StorageInterface<string, UserSchema, unknown>) {
    super({
      defaultState,
      storage,
      persistUserInfo: true,
      storageKey: 'auth-user',
      credentialStorageKey: 'auth-credential',
      initRestore: true
    });
  }

  public setOpenLoginForm(open: boolean): void {
    const port = this.getStore() as StoreInterface<AuthStoreStateInterface>;
    port.update({ openLoginForm: open });
  }

  public setCode(code: string): void {
    const port = this.getStore() as StoreInterface<AuthStoreStateInterface>;
    port.update({ code });
  }
}
