import { inject, injectable } from 'inversify';
import type { PaginationInterface } from '@/server/port/PaginationInterface';
import type { UserSchema } from '@migrations/schema/UserSchema';
import {
  AppApiRequester,
  type AppApiConfig,
  type AppApiTransaction
} from '../appApi/AppApiRequester';
import type { ResourceInterface, ResourceQuery } from '@qlover/corekit-bridge';
import { RequestExecutor } from '@qlover/fe-corekit';
import { AdminApiRequesterContext } from './AdminApiRequester';

export type AdminUserListTransaction = AppApiTransaction<
  ResourceQuery,
  PaginationInterface<unknown>
>;

@injectable()
export class AdminUserApi implements ResourceInterface<UserSchema> {
  constructor(
    @inject(AppApiRequester)
    protected client: RequestExecutor<AppApiConfig, AdminApiRequesterContext>
  ) {}

  /**
   * @override
   */
  public async search(
    params: AdminUserListTransaction['request']
  ): Promise<AdminUserListTransaction['response']> {
    const response = await this.client.request<
      AdminUserListTransaction['response'],
      AdminUserListTransaction['request']
    >({
      url: '/admin/users',
      method: 'GET',
      params
    });

    return response;
  }

  /**
   * @override
   */
  public create(data: UserSchema): Promise<unknown> {
    return this.client.request({
      url: '/admin/users',
      method: 'POST',
      data
    });
  }

  /**
   * @override
   */
  public remove(data: UserSchema): Promise<unknown> {
    return this.client.request({
      url: '/admin/users',
      method: 'DELETE',
      data
    });
  }

  /**
   * @override
   */
  public update(data: UserSchema): Promise<unknown> {
    return this.client.request({
      url: '/admin/users',
      method: 'PUT',
      data
    });
  }

  /**
   * @override
   */
  public export(data: UserSchema): Promise<unknown> {
    return this.client.request({
      url: '/admin/users',
      method: 'GET',
      data
    });
  }
}
