import { ExecutorError } from '@qlover/fe-corekit/executor';
import {
  normalizeSystemRole,
  type SystemRoleType
} from '@shared/auth/systemRole';
import { inject, injectable } from '@shared/container';
import {
  API_ADMIN_USERS_CANNOT_CHANGE_SELF,
  API_NOT_AUTHORIZED
} from '@config/i18n-identifier/api';
import {
  adminSystemRolePatchSchema,
  type AdminUserListItem
} from '@schemas/AdminUserSchema';
import { FeUsersRepository } from '@server/repositorys/FeUsersRepository';
import { OAuthUserService } from '@server/services/OAuthUserService';

@injectable()
export class AdminUsersController {
  constructor(
    @inject(FeUsersRepository)
    protected readonly feUsers: FeUsersRepository,
    @inject(OAuthUserService)
    protected readonly oauthUserService: OAuthUserService
  ) {}

  public async search(query: {
    q?: string | null;
    limit?: string | null;
    offset?: string | null;
  }): Promise<AdminUserListItem[]> {
    const limit = Math.min(
      Math.max(Number.parseInt(query.limit ?? '20', 10) || 20, 1),
      50
    );
    const offset = Math.max(Number.parseInt(query.offset ?? '0', 10) || 0, 0);

    return this.feUsers.searchForAdmin({
      query: query.q ?? undefined,
      limit,
      offset
    });
  }

  public async setSystemRole(
    targetUserId: string,
    body: unknown
  ): Promise<AdminUserListItem> {
    const actor = await this.requireActorId();
    this.assertNotSelf(targetUserId, actor);
    const parsed = adminSystemRolePatchSchema.parse(body);
    const row = await this.feUsers.setSystemRole(
      targetUserId,
      parsed.systemRole as SystemRoleType
    );
    const systemRole =
      (await this.feUsers.getSystemRoleKey(row.id)) ??
      normalizeSystemRole(parsed.systemRole);

    return {
      id: row.id,
      email: row.email,
      phone: row.phone,
      displayName: row.display_name,
      systemRole,
      status: row.status,
      createdAt: row.created_at
    };
  }

  protected assertNotSelf(targetUserId: string, actorUserId: string): void {
    if (targetUserId === actorUserId) {
      throw new ExecutorError(
        API_ADMIN_USERS_CANNOT_CHANGE_SELF,
        'Cannot change your own system role'
      );
    }
  }

  protected async requireActorId(): Promise<string> {
    const actor =
      (await this.oauthUserService.getSessionUser()) ??
      (await this.oauthUserService.getUser(false));
    if (!actor?.id) {
      throw new ExecutorError(API_NOT_AUTHORIZED, 'Not authorized');
    }
    return actor.id;
  }
}
