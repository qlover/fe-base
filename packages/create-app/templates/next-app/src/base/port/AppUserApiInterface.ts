import type { AppApiResponse } from './AppApiInterface';

export interface AppUserApiInterface {
  login(params: {
    email: string;
    password: string;
  }): Promise<AppApiResponse<unknown>>;

  register(params: {
    email: string;
    password: string;
  }): Promise<AppApiResponse<unknown>>;
}
