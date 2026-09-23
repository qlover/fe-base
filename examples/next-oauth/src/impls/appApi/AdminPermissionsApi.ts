import { inject, injectable } from '@shared/container';
import { API_ADMIN_PERMISSIONS } from '@config/apiRoutes';
import type {
  AdminPermissionCreate,
  AdminPermissionUpdate,
  AdminPermissionsResponse
} from '@schemas/RoleSchema';
import { AppApiRequester } from './AppApiRequester';
import type { NextKitApiSuccess } from '@qlover/next-kit/common';

@injectable()
export class AdminPermissionsApi {
  constructor(
    @inject(AppApiRequester) private readonly appApiRequester: AppApiRequester
  ) {}

  public async list(): Promise<AdminPermissionsResponse> {
    const response = await this.appApiRequester.get(API_ADMIN_PERMISSIONS);
    const envelope =
      response.data as NextKitApiSuccess<AdminPermissionsResponse>;
    return envelope.data ?? { catalog: [] };
  }

  public async create(
    body: AdminPermissionCreate
  ): Promise<AdminPermissionsResponse> {
    const response = await this.appApiRequester.post(
      API_ADMIN_PERMISSIONS,
      body
    );
    const envelope =
      response.data as NextKitApiSuccess<AdminPermissionsResponse>;
    return envelope.data ?? { catalog: [] };
  }

  public async update(
    body: AdminPermissionUpdate
  ): Promise<AdminPermissionsResponse> {
    const response = await this.appApiRequester.patch(
      API_ADMIN_PERMISSIONS,
      body
    );
    const envelope =
      response.data as NextKitApiSuccess<AdminPermissionsResponse>;
    return envelope.data ?? { catalog: [] };
  }
}
