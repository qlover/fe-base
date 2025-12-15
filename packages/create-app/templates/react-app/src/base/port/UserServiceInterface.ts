import type { UserInfo, UserCredential } from '@/base/apis/userApi/UserApiType';
import type { UserServiceInterface as CorekitBridgeUserServiceInterface } from '@qlover/corekit-bridge';

export interface UserServiceInterface extends CorekitBridgeUserServiceInterface<
  UserInfo,
  UserCredential
> {
  // You can add your own methods here

  /**
   * Get the user token
   *
   * This is a extends method from the corekit-bridge UserServiceInterface.
   */
  getToken(): string;

  isUserInfo(value: unknown): value is UserInfo;

  isUserCredential(value: unknown): value is UserCredential;
}
