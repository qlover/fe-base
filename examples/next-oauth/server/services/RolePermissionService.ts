import {
  arePermissionMapsLoaded,
  clearPermissionMaps,
  defaultRoleMaps,
  setPermissionMaps
} from '@shared/auth/permissionRegistry';
import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import type {
  AdminPermissionCreate,
  AdminPermissionUpdate,
  AdminPermissionsResponse,
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

  public async listPermissionCatalog(): Promise<AdminPermissionsResponse> {
    await this.ensureLoaded();
    const catalog = await this.repo.listPermissions();
    return { catalog };
  }

  public async createPermission(
    input: AdminPermissionCreate
  ): Promise<AdminPermissionsResponse> {
    await this.ensureLoaded();
    const existing = await this.repo.findPermissionByKey(input.permissionKey);
    if (existing) {
      throw new Error(`Permission already exists: ${input.permissionKey}`);
    }
    const catalog = await this.repo.createPermission(input);
    return { catalog };
  }

  public async updatePermission(
    input: AdminPermissionUpdate
  ): Promise<AdminPermissionsResponse> {
    await this.ensureLoaded();
    const existing = await this.repo.findPermissionByKey(input.permissionKey);
    if (!existing) {
      throw new Error(`Permission not found: ${input.permissionKey}`);
    }
    const catalog = await this.repo.updatePermission(input);
    return { catalog };
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
