import { inject, injectable } from 'inversify';
import type { AdminPageListParams } from '@/base/port/AdminPageInterface';
import type { PaginationInterface } from '@/base/port/PaginationInterface';
import {
  AppApiRequester,
  type AppApiConfig,
  type AppApiTransaction
} from '../appApi/AppApiRequester';
import type { RequestTransaction } from '@qlover/fe-corekit';

export type AdminUserListTransaction = AppApiTransaction<
  AdminPageListParams,
  PaginationInterface<unknown>
>;

@injectable()
export class AdminUserApi {
  constructor(
    @inject(AppApiRequester)
    protected client: RequestTransaction<AppApiConfig>
  ) {}

  async getUserList(
    params: AdminPageListParams
  ): Promise<AdminUserListTransaction['response']> {
    const response = await this.client.request<AdminUserListTransaction>({
      url: '/admin/users',
      method: 'GET',
      params: params as unknown as Record<string, unknown>
    });

    return response;
  }
}
