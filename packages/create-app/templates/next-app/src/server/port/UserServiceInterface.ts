export interface UserServiceInterface {
  register(params: { email: string; password: string }): Promise<void>;
  login(params: { email: string; password: string }): Promise<unknown>;
}
