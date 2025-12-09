import type { UserCredential, UserSchema } from '@migrations/schema/UserSchema';
import type { UserService as CorekitBridgeUserServiceInterface } from '@qlover/corekit-bridge';

export interface UserServiceInterface extends CorekitBridgeUserServiceInterface<
  UserSchema,
  UserCredential
> {
  // You can add your own methods here

  /**
   * Get the user token
   *
   * This is a extends method from the corekit-bridge UserServiceInterface.
   */
  getToken(): string;

  isUserInfo(value: unknown): value is UserSchema;

  isUserCredential(value: unknown): value is UserCredential;
}
