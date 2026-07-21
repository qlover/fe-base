import {
  AsyncStoreStatus,
  UserStore,
  type StoreInterface,
  type UserStateInterface
} from '@qlover/corekit-bridge';
import { KeyStorage, type StorageInterface } from '@qlover/fe-corekit';
import type { UserCredentialSchema, UserSchema } from '@schemas/UserSchema';

export type UserCredential = string;

export interface AuthStoreStateInterface extends UserStateInterface<
  UserSchema,
  UserCredentialSchema
> {
  openLoginForm: boolean;
  code: string;
}

type AuthPersistSnapshot = Partial<AuthStoreStateInterface>;

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
  public getStore(): StoreInterface<AuthStoreStateInterface> {
    return super.getStore() as StoreInterface<AuthStoreStateInterface>;
  }

  public get state(): AuthStoreStateInterface {
    return this.getState() as AuthStoreStateInterface;
  }

  constructor(storage: StorageInterface<string, AuthPersistSnapshot>) {
    super({
      defaultState,
      persist: new KeyStorage('auth-session', storage),
      persistKeys: ['result', 'credential'],
      initRestore: true
    });
  }

  public setOpenLoginForm(open: boolean): void {
    this.getStore().update({ openLoginForm: open });
  }

  public setCode(code: string): void {
    this.getStore().update({ code });
  }
}
