import { inject, injectable } from '@shared/container';
import type { SystemRoleType } from '@shared/auth/systemRole';
import {
  API_ADMIN_USERS,
  API_ADMIN_USERS_SYSTEM_ROLE
} from '@config/apiRoutes';
import type { AdminUserListItem } from '@schemas/AdminUserSchema';
import { AppApiRequester } from './AppApiRequester';
import type { NextKitApiSuccess } from '@qlover/next-kit/common';

function buildSystemRolePath(userId: string): string {
  return API_ADMIN_USERS_SYSTEM_ROLE.replace(
    ':userId',
    encodeURIComponent(userId)
  );
}

@injectable()
export class AdminUsersApi {
  constructor(
    @inject(AppApiRequester) private readonly appApiRequester: AppApiRequester
  ) {}

  public async search(params: {
    q?: string;
    limit?: number;
    offset?: number;
  }): Promise<AdminUserListItem[]> {
    const response = await this.appApiRequester.get(API_ADMIN_USERS, {
      params: {
        q: params.q ?? '',
        limit: params.limit ?? 20,
        offset: params.offset ?? 0
      }
    });

    const envelope = response.data as NextKitApiSuccess<AdminUserListItem[]>;
    return envelope.data ?? [];
  }

  public async setSystemRole(
    userId: string,
    systemRole: SystemRoleType
  ): Promise<AdminUserListItem | null> {
    const response = await this.appApiRequester.patch(
      buildSystemRolePath(userId),
      { systemRole }
    );
    const envelope = response.data as NextKitApiSuccess<AdminUserListItem>;
    return envelope.data ?? null;
  }
}
