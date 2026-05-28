import { HttpMethods } from '@qlover/fe-corekit';
import { inject, injectable } from '@shared/container';
import {
  AppApiRequester,
  type AppApiConfig,
  type AppApiRequesterContext
} from './appApi/AppApiRequester';
import type { RequestExecutor } from '@qlover/fe-corekit';

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

/**
 * Client gateway for OAuth consent submission (`POST /api/oauth/consent`).
 */
@injectable()
export class OAuthConsentGateway {
  constructor(
    @inject(AppApiRequester)
    protected client: RequestExecutor<AppApiConfig, AppApiRequesterContext>
  ) {}

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
