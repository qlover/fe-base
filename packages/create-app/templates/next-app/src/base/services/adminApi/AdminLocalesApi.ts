import { inject, injectable } from 'inversify';
import type { AdminPageListParams } from '@/base/port/AdminPageInterface';
import type { PaginationInterface } from '@/server/port/PaginationInterface';
import {
  AppApiRequester,
  type AppApiConfig,
  type AppApiTransaction
} from '../appApi/AppApiRequester';
import type { RequestTransaction } from '@qlover/fe-corekit';

export type AdminLocalesListTransaction = AppApiTransaction<
  AdminPageListParams,
  PaginationInterface<unknown>
>;

@injectable()
export class AdminLocalesApi {
  constructor(
    @inject(AppApiRequester)
    protected client: RequestTransaction<AppApiConfig>
  ) {}

  async getLocalesList(
    params: AdminPageListParams
  ): Promise<AdminLocalesListTransaction['response']> {
    const response = await this.client.request<AdminLocalesListTransaction>({
      url: '/admin/locales',
      method: 'GET',
      params: params as unknown as Record<string, unknown>
    });

    return response;
  }
}
