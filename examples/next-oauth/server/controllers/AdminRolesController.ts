import { ExecutorError } from '@qlover/fe-corekit/executor';
import { inject, injectable } from '@shared/container';
import {
  adminRoleAssignmentsPatchSchema,
  type AdminRolesResponse
} from '@schemas/RoleSchema';
import { RolePermissionService } from '@server/services/RolePermissionService';

@injectable()
export class AdminRolesController {
  constructor(
    @inject(RolePermissionService)
    protected readonly rolePermissionService: RolePermissionService
  ) {}

  public async list(): Promise<AdminRolesResponse> {
    return this.rolePermissionService.getAdminRolesView();
  }

  public async replaceAssignments(body: unknown): Promise<AdminRolesResponse> {
    const parsed = adminRoleAssignmentsPatchSchema.safeParse(body);
    if (!parsed.success) {
      throw new ExecutorError('api:invalid_params', 'Invalid role assignments');
    }
    return this.rolePermissionService.replaceAssignments(parsed.data);
  }
}
