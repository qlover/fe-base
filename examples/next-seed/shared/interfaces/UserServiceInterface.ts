import type { LoginProviderType } from '@config/common';
import type {
  SignOtpResult,
  SignWithOtpParams
} from '@server/interfaces/AuthTypes';
import type {
  UserService as CorekitBridgeUserServiceInterface,
  UserServiceGateway
} from '@qlover/corekit-bridge';
import type { UserCredential, UserSchema } from '@qlover/next-kit/common';

export type { SignOtpResult, SignWithOtpParams };

export type LoginProviderResult = {
  providerUrl: string;
  provider: string;
};

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
> {
  sendOtp(params: SignWithOtpParams): Promise<SignOtpResult>;
  verifyOtp(
    params: { phone: string; token: string } | { email: string; token: string }
  ): Promise<SignOtpResult>;

  loginWithProvider(params: {
    provider: LoginProviderType;
  }): Promise<LoginProviderResult>;
}
