export interface StorageTokenInterface {
  getToken(): string;
  setToken(token: string, expireTime?: number): void;
  removeToken(): void;
}
