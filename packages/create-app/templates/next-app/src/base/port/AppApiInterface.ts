export interface AppApiInterface {
  login(params: { email: string; password: string }): Promise<unknown>;
}
