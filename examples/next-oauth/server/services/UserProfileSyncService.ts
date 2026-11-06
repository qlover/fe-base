import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import {
  defaultPlatformRoleFromUserRole,
  FeUsersRepository
} from '@server/repositorys/FeUsersRepository';
import type { LoggerInterface } from '@qlover/logger';
import type { UserSchema } from '@qlover/next-kit/common';

/**
 * Sync `fe_users` after auth. Call from login / session mint paths — not on
 * every `/api/user/session` poll.
 */
@injectable()
export class UserProfileSyncService {
  constructor(
    @inject(FeUsersRepository)
    protected readonly usersRepository: FeUsersRepository,
    @inject(I.Logger)
    protected readonly logger: LoggerInterface
  ) {}

  /**
   * Best-effort upsert; failures are logged and do not block login.
   *
   * @returns Synced `display_name` when available, for session `name`.
   */
  public async syncAfterAuth(
    user: UserSchema | null | undefined
  ): Promise<string | null> {
    if (user == null || !user.id) {
      return null;
    }
    try {
      const row = await this.usersRepository.ensureProfile({
        id: user.id,
        email: user.email || null,
        displayName: user.name ?? null,
        phone: user.phone ?? null,
        defaultRoleKey: defaultPlatformRoleFromUserRole(user.role)
      });
      return row.display_name;
    } catch (error) {
      this.logger.warn('[UserProfileSync] ensureProfile failed', error);
      return null;
    }
  }
}
