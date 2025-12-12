import type { UserSchema } from '@migrations/schema/UserSchema';
import type { LoginValidatorData } from '../validators/LoginValidator';

export interface UserControllerInerface {
  login(body: LoginValidatorData): Promise<UserSchema>;
  register(body: LoginValidatorData): Promise<UserSchema>;
  logout(): Promise<void>;
}
