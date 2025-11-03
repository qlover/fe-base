import { ResourceStore } from '@qlover/corekit-bridge';
import { inject, injectable } from 'inversify';
import { ResourceService } from '@/base/services/ResourceService';
import type { LocalesSchema } from '@migrations/schema/LocalesSchema';
import { AdminLocalesApi } from './adminApi/AdminLocalesApi';
import { ResourceState } from '../cases/ResourceState';

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
