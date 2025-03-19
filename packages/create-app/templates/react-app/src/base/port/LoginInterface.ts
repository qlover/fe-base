export interface LoginInterface {
  login(params: { username: string; password: string }): Promise<unknown>;
  logout(): void;
}
