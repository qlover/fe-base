export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}
export interface LoginInterface {
  login(params: { username: string; password: string }): Promise<unknown>;
  logout(): void;
  register(params: RegisterFormData): Promise<unknown>;
}
