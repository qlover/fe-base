import { inject, injectable } from 'inversify';
import type { AdminPageListParams } from '@/base/port/AdminPageInterface';
import type { PaginationInterface } from '@/server/port/PaginationInterface';
import type { LocalesSchema } from '@migrations/schema/LocalesSchema';
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

export type AdminLocalesUpdateTransaction = AppApiTransaction<
  Partial<LocalesSchema>,
  LocalesSchema
>;

@injectable()
export class AdminLocalesApi {
  constructor(
    @inject(AppApiRequester)
    protected client: RequestTransaction<AppApiConfig>
  ) {}

  getLocalesList(
    params: AdminPageListParams
  ): Promise<AdminLocalesListTransaction['response']> {
    return this.client.request<AdminLocalesListTransaction>({
      url: '/admin/locales',
      method: 'GET',
      params: params as unknown as Record<string, unknown>
    });
  }

  updateLocales(
    data: Partial<LocalesSchema>
  ): Promise<AdminLocalesUpdateTransaction['response']> {
    return this.client.request<AdminLocalesUpdateTransaction>({
      url: `/admin/locales/update`,
      method: 'POST',
      data
    });
  }
}
