import { inject, injectable } from 'inversify';
import type { PaginationInterface } from '@/server/port/PaginationInterface';
import type { LocalesSchema } from '@migrations/schema/LocalesSchema';
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
  create(data: LocalesSchema): Promise<unknown> {
    return this.client.request<AdminLocalesListTransaction>({
      url: '/admin/locales',
      method: 'POST',
      data: data as unknown as Record<string, unknown>
    });
  }

  /**
   * @override
   */
  remove(data: Partial<LocalesSchema>): Promise<unknown> {
    return this.client.request<AdminLocalesListTransaction>({
      url: '/admin/locales',
      method: 'DELETE',
      data: data as unknown as Record<string, unknown>
    });
  }

  /**
   * @override
   */
  search(
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
  export(data: LocalesSchema): Promise<unknown> {
    return this.client.request<AdminLocalesListTransaction>({
      url: '/admin/locales',
      method: 'GET',
      data: data as unknown as Record<string, unknown>
    });
  }

  /**
   * @override
   */
  update(
    data: Partial<LocalesSchema>
  ): Promise<AdminLocalesUpdateTransaction['response']> {
    return this.client.request<AdminLocalesUpdateTransaction>({
      url: `/admin/locales/update`,
      method: 'POST',
      data
    });
  }
}
