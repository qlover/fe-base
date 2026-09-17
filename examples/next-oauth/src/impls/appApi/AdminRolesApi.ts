import { inject, injectable } from '@shared/container';
import { API_ADMIN_ROLES } from '@config/apiRoutes';
import type {
  AdminRoleAssignmentsPatch,
  AdminRolesResponse
} from '@schemas/RoleSchema';
import { AppApiRequester } from './AppApiRequester';
import type { NextKitApiSuccess } from '@qlover/next-kit/common';

@injectable()
export class AdminRolesApi {
  constructor(
    @inject(AppApiRequester) private readonly appApiRequester: AppApiRequester
  ) {}

  public async list(): Promise<AdminRolesResponse> {
    const response = await this.appApiRequester.get(API_ADMIN_ROLES);
    const envelope = response.data as NextKitApiSuccess<AdminRolesResponse>;
    return (
      envelope.data ?? {
        catalog: [],
        roles: []
      }
    );
  }

  public async replaceAssignments(
    body: AdminRoleAssignmentsPatch
  ): Promise<AdminRolesResponse> {
    const response = await this.appApiRequester.patch(API_ADMIN_ROLES, body);
    const envelope = response.data as NextKitApiSuccess<AdminRolesResponse>;
    return (
      envelope.data ?? {
        catalog: [],
        roles: []
      }
    );
  }
}
