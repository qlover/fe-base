import { HttpMethods } from '@qlover/fe-corekit';
import { inject, injectable } from '@shared/container';
import { API_OAUTH_VERIFY } from '@config/apiRoutes';
import {
  AppApiRequester,
  type AppApiConfig,
  type AppApiRequesterContext
} from '@/impls/appApi/AppApiRequester';
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

/** Client gateway for OAuth wrapper login (`POST /api/oauth/verify`). */
@injectable()
export class DemoAuthGateway {
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
}
