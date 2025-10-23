import { injectable } from 'inversify';
import type {
  AdminTableEventCommonParams,
  AdminTableEventInterface
} from '@/uikit/components/adminTable/AdminTableEventInterface';
import type { ResourceQuery } from '@qlover/corekit-bridge';

@injectable()
export class AdminPageEvent implements AdminTableEventInterface {
  onChangeParams(params: AdminTableEventCommonParams & ResourceQuery): void {
    const { resource, ...query } = params;

    if (resource) {
      resource.getStore().changeSearchParams(query);

      resource.search(query);
    }
  }
  onCreated(_params: AdminTableEventCommonParams): void {
    throw new Error('Method not implemented.');
  }
  onDeleted(_params: AdminTableEventCommonParams): void {
    throw new Error('Method not implemented.');
  }
  onDetail(_params: AdminTableEventCommonParams): void {
    throw new Error('Method not implemented.');
  }
  onEdited(_params: AdminTableEventCommonParams): void {
    throw new Error('Method not implemented.');
  }
}
