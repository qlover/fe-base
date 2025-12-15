import { inject, injectable } from 'inversify';
import type { PaginationInterface } from '@/server/port/PaginationInterface';
import type { UserSchema } from '@migrations/schema/UserSchema';
import {
  AppApiRequester,
  type AppApiConfig,
  type AppApiTransaction
} from '../appApi/AppApiRequester';
import type { ResourceInterface, ResourceQuery } from '@qlover/corekit-bridge';
import type { RequestTransaction } from '@qlover/fe-corekit';

export type AdminUserListTransaction = AppApiTransaction<
  ResourceQuery,
  PaginationInterface<unknown>
>;

@injectable()
export class AdminUserApi implements ResourceInterface<UserSchema> {
  constructor(
    @inject(AppApiRequester)
    protected client: RequestTransaction<AppApiConfig>
  ) {}

  /**
   * @override
   */
  public async search(
    params: AdminUserListTransaction['request']
  ): Promise<AdminUserListTransaction['response']> {
    const response = await this.client.request<AdminUserListTransaction>({
      url: '/admin/users',
      method: 'GET',
      params: params as unknown as Record<string, unknown>
    });

    return response;
  }

  /**
   * @override
   */
  public create(data: UserSchema): Promise<unknown> {
    return this.client.request<AdminUserListTransaction>({
      url: '/admin/users',
      method: 'POST',
      data: data as unknown as Record<string, unknown>
    });
  }

  /**
   * @override
   */
  public remove(data: UserSchema): Promise<unknown> {
    return this.client.request<AdminUserListTransaction>({
      url: '/admin/users',
      method: 'DELETE',
      data: data as unknown as Record<string, unknown>
    });
  }

  /**
   * @override
   */
  public update(data: UserSchema): Promise<unknown> {
    return this.client.request<AdminUserListTransaction>({
      url: '/admin/users',
      method: 'PUT',
      data: data as unknown as Record<string, unknown>
    });
  }

  /**
   * @override
   */
  public export(data: UserSchema): Promise<unknown> {
    return this.client.request<AdminUserListTransaction>({
      url: '/admin/users',
      method: 'GET',
      data: data as unknown as Record<string, unknown>
    });
  }
}
