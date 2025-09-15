export interface CrentialTokenInterface<T> {
  generateToken(data: T, options?: { expiresIn?: string }): Promise<string>;

  parseToken(token: string): Promise<T>;
}
