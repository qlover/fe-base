import { ResourceEvent } from '@brain-toolkit/antd-blocks/resourceTable/ResourceEvent';
import type { ResourceService } from './ResourceService';
import type { DialogHandlerOptions } from '../cases/DialogHandler';
import type { ResourceState } from '../cases/ResourceState';
import type { ResourceTableEventCommonParams } from '@brain-toolkit/antd-blocks';
import type { UIDialogInterface, ResourceStore } from '@qlover/corekit-bridge';
import type { FormInstance } from 'antd';

export class AdminPageEvent extends ResourceEvent {
  constructor(
    namespace: string,
    resource: ResourceService<unknown, ResourceStore<ResourceState>>,
    schemaFormRef?: FormInstance<unknown>,
    protected uiDialog?: UIDialogInterface<DialogHandlerOptions>
  ) {
    super(namespace, resource, undefined, schemaFormRef);
  }

  public override onDeleted(_params: ResourceTableEventCommonParams): void {
    this.uiDialog?.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this item?',
      onOk: () => this.actionDelete(_params)
    });
  }
}
