import { ResourceStore, type ResourceInterface } from '@qlover/corekit-bridge';
import { inject, injectable } from 'inversify';
import { ResourceService } from '@/base/services/ResourceService';
import type { UserSchema } from '@migrations/schema/UserSchema';
import { AdminUserApi } from './adminApi/AdminUserApi';
import { ResourceState } from '../cases/ResourceState';

@injectable()
export class AdminUserService extends ResourceService<UserSchema> {
  constructor(
    @inject(AdminUserApi) resourceApi: ResourceInterface<UserSchema>
  ) {
    super(
      'adminUsers',
      new ResourceStore(() => new ResourceState()),
      resourceApi
    );
  }
}
