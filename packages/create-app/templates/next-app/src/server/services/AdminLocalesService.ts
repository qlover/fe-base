import { ResourceStore } from '@qlover/corekit-bridge';
import { inject, injectable } from 'inversify';
import { ResourceState } from '@/base/cases/ResourceState';
import { AdminLocalesApi } from '@/base/services/adminApi/AdminLocalesApi';
import { ResourceService } from '@/base/services/ResourceService';
import type { LocalesSchema } from '@migrations/schema/LocalesSchema';

@injectable()
export class AdminLocalesService extends ResourceService<
  LocalesSchema,
  ResourceStore<ResourceState>
> {
  constructor(
    @inject(AdminLocalesApi)
    protected adminLocalesApi: AdminLocalesApi
  ) {
    const store = new ResourceStore(() => new ResourceState());
    super('admin_locales', store, adminLocalesApi);
  }
}
