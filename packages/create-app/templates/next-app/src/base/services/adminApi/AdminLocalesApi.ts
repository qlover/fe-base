import { inject, injectable } from 'inversify';
import type { PaginationInterface } from '@/server/port/PaginationInterface';
import type { LocalesSchema } from '@migrations/schema/LocalesSchema';
import type { LocaleType } from '@config/i18n';
import {
  AppApiRequester,
  type AppApiConfig,
  type AppApiTransaction
} from '../appApi/AppApiRequester';
import type { ResourceInterface, ResourceQuery } from '@qlover/corekit-bridge';
import type { RequestTransaction } from '@qlover/fe-corekit';

export type AdminLocalesListTransaction = AppApiTransaction<
  ResourceQuery,
  PaginationInterface<unknown>
>;

export type AdminLocalesUpdateTransaction = AppApiTransaction<
  Partial<LocalesSchema>,
  LocalesSchema
>;

@injectable()
export class AdminLocalesApi implements ResourceInterface<LocalesSchema> {
  constructor(
    @inject(AppApiRequester)
    protected client: RequestTransaction<AppApiConfig>
  ) {}

  /**
   * @override
   */
  public create(data: LocalesSchema): Promise<unknown> {
    return this.client.request<AdminLocalesListTransaction>({
      url: '/admin/locales/create',
      method: 'POST',
      data: data as unknown as Record<string, unknown>
    });
  }

  /**
   * @override
   */
  public remove(data: Partial<LocalesSchema>): Promise<unknown> {
    return this.client.request<AdminLocalesListTransaction>({
      url: '/admin/locales',
      method: 'DELETE',
      data: data as unknown as Record<string, unknown>
    });
  }

  /**
   * @override
   */
  public search(
    params: ResourceQuery
  ): Promise<AdminLocalesListTransaction['response']> {
    return this.client.request<AdminLocalesListTransaction>({
      url: '/admin/locales',
      method: 'GET',
      params: params as unknown as Record<string, unknown>
    });
  }

  /**
   * @override
   */
  public export(data: LocalesSchema): Promise<unknown> {
    return this.client.request<AdminLocalesListTransaction>({
      url: '/admin/locales',
      method: 'GET',
      data: data as unknown as Record<string, unknown>
    });
  }

  /**
   * @override
   */
  public update(
    data: Partial<LocalesSchema>
  ): Promise<AdminLocalesUpdateTransaction['response']> {
    return this.client.request<AdminLocalesUpdateTransaction>({
      url: `/admin/locales/update`,
      method: 'POST',
      data
    });
  }

  /**
   * @override
   */
  public import(data: {
    [key in LocaleType]?: File;
  }): Promise<unknown> {
    const formdata = new FormData();
    for (const [key, value] of Object.entries(data)) {
      formdata.append(key, value);
    }

    return this.client.request({
      url: '/admin/locales/import',
      method: 'POST',
      data: formdata,
      responseType: 'formdata'
    });
  }
}
