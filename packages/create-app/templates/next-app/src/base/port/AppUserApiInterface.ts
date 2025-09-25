import type { AppApiResult } from './AppApiInterface';

export interface AppUserApiInterface {
  login(params: {
    email: string;
    password: string;
  }): Promise<AppApiResult<unknown>>;

  register(params: {
    email: string;
    password: string;
  }): Promise<AppApiResult<unknown>>;

  logout(): Promise<AppApiResult<unknown>>;
}
