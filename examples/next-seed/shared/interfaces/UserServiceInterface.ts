import type { UserCredential, UserSchema } from '@schemas/UserSchema';
import type {
  UserService as CorekitBridgeUserServiceInterface,
  UserServiceGateway
} from '@qlover/corekit-bridge';

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
}

export interface UserServiceGatewayInterface extends UserServiceGateway<
  UserSchema,
  UserCredential,
  {}
> {}
