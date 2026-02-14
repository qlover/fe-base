import { ResourceStore } from '@qlover/corekit-bridge';
import { AdminLocalesApi } from '@/impls/adminApi/AdminLocalesApi';
import { ResourceService } from '@/impls/ResourceService';
import { ResourceState } from '@/impls/ResourceState';
import { inject, injectable } from '@shared/container';
import type { LocalesSchema } from '@schemas/LocalesSchema';

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
