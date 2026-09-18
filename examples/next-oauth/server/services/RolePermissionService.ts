import {
  arePermissionMapsLoaded,
  clearPermissionMaps,
  defaultRoleMaps,
  setPermissionMaps
} from '@shared/auth/permissionRegistry';
import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import type {
  AdminRoleAssignmentsPatch,
  AdminRolesResponse
} from '@schemas/RoleSchema';
import { SupabaseRolesRepository } from '../repositorys/SupabaseRolesRepository';
import type { LoggerInterface } from '@qlover/logger';

@injectable()
export class RolePermissionService {
  private loadPromise: Promise<void> | null = null;

  constructor(
    @inject(I.Logger) protected readonly logger: LoggerInterface,
    @inject(SupabaseRolesRepository)
    protected readonly repo: SupabaseRolesRepository
  ) {}

  public async ensureLoaded(): Promise<void> {
    if (arePermissionMapsLoaded()) {
      return;
    }
    if (!this.loadPromise) {
      this.loadPromise = this.loadFromRepo().finally(() => {
        this.loadPromise = null;
      });
    }
    await this.loadPromise;
  }

  public async reload(): Promise<void> {
    clearPermissionMaps();
    this.loadPromise = null;
    await this.ensureLoaded();
  }

  public async getAdminRolesView(): Promise<AdminRolesResponse> {
    await this.ensureLoaded();
    return this.repo.listView();
  }

  public async replaceAssignments(
    body: AdminRoleAssignmentsPatch
  ): Promise<AdminRolesResponse> {
    await this.ensureLoaded();
    const next = await this.repo.replaceAssignments(
      body.roleId,
      body.permissionKeys
    );
    const maps = await this.repo.getAssignmentMaps();
    setPermissionMaps({ roles: maps });
    return next;
  }

  protected async loadFromRepo(): Promise<void> {
    try {
      const maps = await this.repo.getAssignmentMaps();
      if (Object.keys(maps).length === 0) {
        setPermissionMaps({ roles: defaultRoleMaps() });
        this.logger.warn(
          'Role assignments empty; using DEFAULT_SYSTEM_ROLE_PERMISSIONS'
        );
        return;
      }
      setPermissionMaps({ roles: maps });
    } catch (error) {
      setPermissionMaps({ roles: defaultRoleMaps() });
      this.logger.warn(
        'Failed to load fe_role_assignments; using DEFAULT_SYSTEM_ROLE_PERMISSIONS',
        error
      );
    }
  }
}
