import { HttpMethods } from '@qlover/fe-corekit';
import {
  AppApiRequester,
  type AppApiConfig,
  type AppApiRequesterContext
} from '@/impls/appApi/AppApiRequester';
import { inject, injectable } from '@shared/container';
import { API_OAUTH_VERIFY } from '@config/apiRoutes';
import type { RequestExecutor } from '@qlover/fe-corekit';

export type DemoVerifyResult = {
  userId: number;
  email: string;
  name: string;
};

type DemoVerifyResponse = {
  success: boolean;
  data?: DemoVerifyResult;
  id?: string;
  message?: string;
};

export type OAuthConsentPayload = {
  action: 'allow' | 'deny';
  client_id: string;
  redirect_uri: string;
  scope?: string;
  state?: string;
  trust?: boolean;
  code_challenge?: string;
  code_challenge_method?: 'S256';
};

export type OAuthConsentResponse = {
  success: boolean;
  data?: { redirectUrl: string };
  id?: string;
  message?: string;
};

/** Client gateway for OAuth wrapper login (`POST /api/oauth/verify`). */
@injectable()
export class OAuthWrapperGateway {
  constructor(
    @inject(AppApiRequester)
    protected client: RequestExecutor<AppApiConfig, AppApiRequesterContext>
  ) {}

  public async verify(params: {
    email: string;
    password: string;
  }): Promise<DemoVerifyResult> {
    const response = await this.client.request<
      DemoVerifyResponse,
      { email: string; password: string }
    >({
      url: API_OAUTH_VERIFY,
      method: HttpMethods.POST,
      data: params
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message ?? 'Login failed');
    }

    return response.data.data;
  }

  public async submit(payload: OAuthConsentPayload): Promise<string> {
    const response = await this.client.request<
      OAuthConsentResponse,
      OAuthConsentPayload
    >({
      url: '/api/oauth/consent',
      method: HttpMethods.POST,
      data: payload
    });

    if (!response.data.success || !response.data.data?.redirectUrl) {
      throw new Error(response.data.message ?? 'Consent submission failed');
    }

    return response.data.data.redirectUrl;
  }
}
