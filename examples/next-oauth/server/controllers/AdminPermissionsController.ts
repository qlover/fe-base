import { ExecutorError } from '@qlover/fe-corekit/executor';
import { inject, injectable } from '@shared/container';
import {
  adminPermissionCreateSchema,
  adminPermissionUpdateSchema,
  type AdminPermissionsResponse
} from '@schemas/RoleSchema';
import { RolePermissionService } from '@server/services/RolePermissionService';

@injectable()
export class AdminPermissionsController {
  constructor(
    @inject(RolePermissionService)
    protected readonly rolePermissionService: RolePermissionService
  ) {}

  public async list(): Promise<AdminPermissionsResponse> {
    return this.rolePermissionService.listPermissionCatalog();
  }

  public async create(body: unknown): Promise<AdminPermissionsResponse> {
    const parsed = adminPermissionCreateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ExecutorError(
        'api:invalid_params',
        'Invalid permission create'
      );
    }
    try {
      return await this.rolePermissionService.createPermission(parsed.data);
    } catch (error) {
      throw new ExecutorError(
        'api:invalid_params',
        error instanceof Error ? error.message : 'Create permission failed'
      );
    }
  }

  public async update(body: unknown): Promise<AdminPermissionsResponse> {
    const parsed = adminPermissionUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ExecutorError(
        'api:invalid_params',
        'Invalid permission update'
      );
    }
    try {
      return await this.rolePermissionService.updatePermission(parsed.data);
    } catch (error) {
      throw new ExecutorError(
        'api:invalid_params',
        error instanceof Error ? error.message : 'Update permission failed'
      );
    }
  }
}
