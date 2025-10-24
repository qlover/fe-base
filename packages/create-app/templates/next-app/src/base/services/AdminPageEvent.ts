import {
  StoreInterface,
  type ResourceQuery,
  type StoreStateInterface
} from '@qlover/corekit-bridge';
import { injectable } from 'inversify';
import type {
  AdminTableEventCommonParams,
  AdminTableEventInterface
} from '@/uikit/components/adminTable/AdminTableEventInterface';

export class AdminPageEventState implements StoreStateInterface {
  selectedResource?: unknown;
}

@injectable()
export class AdminPageEvent
  extends StoreInterface<AdminPageEventState>
  implements AdminTableEventInterface
{
  constructor() {
    super(() => new AdminPageEventState());
  }

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
    const { dataSource } = _params;

    if (!dataSource) {
      return;
    }

    this.emit({ ...this.state, selectedResource: dataSource });
  }
  onEdited(_params: AdminTableEventCommonParams): void {
    throw new Error('Method not implemented.');
  }
  onRefresh(_params: AdminTableEventCommonParams): void {
    throw new Error('Method not implemented.');
  }
}
