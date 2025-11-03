import {
  RequestState,
  StoreInterface,
  type ResourceQuery,
  type ResourceStore,
  type UIDialogInterface
} from '@qlover/corekit-bridge';
import type {
  AdminTableEventCommonParams,
  AdminTableEventInterface
} from '@/uikit/components/adminTable/AdminTableEventInterface';
import {
  AdminTableEventAction,
  AdminTableEventState
} from '@/uikit/components/adminTable/AdminTableEventInterface';
import type { ResourceService } from './ResourceService';
import type { DialogHandlerOptions } from '../cases/DialogHandler';
import type { ResourceState } from '../cases/ResourceState';
import type { FormInstance } from 'antd';

export class AdminPageEventStroe extends StoreInterface<AdminTableEventState> {
  constructor() {
    super(() => new AdminTableEventState());
  }

  changeCreateState(state: RequestState<unknown>): void {
    this.emit({
      ...this.state,
      createState: state
    });
  }

  changeEditState(state: RequestState<unknown>): void {
    this.emit({
      ...this.state,
      editState: state
    });
  }
}

export class AdminPageEvent implements AdminTableEventInterface {
  readonly store: AdminPageEventStroe;

  constructor(
    readonly namespace: string,
    protected resource: ResourceService<unknown, ResourceStore<ResourceState>>,
    protected schemaFormRef?: FormInstance<unknown>,
    protected uiDialog?: UIDialogInterface<DialogHandlerOptions>
  ) {
    this.store = new AdminPageEventStroe();
  }

  /**
   * @override
   */
  getResource(): ResourceService<unknown, ResourceStore<ResourceState>> {
    return this.resource;
  }

  protected async actionCreate(values: unknown): Promise<unknown> {
    this.store.changeCreateState(new RequestState(true));

    try {
      const result = await this.resource.create(values);
      this.store.changeCreateState(new RequestState(false, result).end());
      return result;
    } catch (error) {
      this.store.changeCreateState(new RequestState(false, null, error).end());
      throw error;
    }
  }

  protected async actionEdit(values: unknown): Promise<unknown> {
    this.store.changeEditState(new RequestState(true));

    try {
      const result = await this.resource.update(values as Partial<unknown>);
      this.store.changeEditState(new RequestState(false, result).end());
      return result;
    } catch (error) {
      this.store.changeEditState(new RequestState(false, null, error).end());
      throw error;
    }
  }

  protected async actionDelete(_values: unknown): Promise<unknown> {
    return Promise.resolve(true);
  }

  /**
   * @override
   */
  async onSubmit(values: unknown): Promise<unknown> {
    const action = this.store.state.action;

    if (
      action === AdminTableEventAction.CREATE &&
      !this.store.state.createState.loading
    ) {
      return await this.actionCreate(values);
    }

    if (
      action === AdminTableEventAction.EDIT &&
      !this.store.state.editState.loading
    ) {
      return await this.actionEdit(values);
    }

    throw new Error('Invalid action');
  }

  /**
   * @override
   */
  onChangeParams(params: AdminTableEventCommonParams & ResourceQuery): void {
    const { resource, ...query } = params;

    if (resource) {
      resource.getStore().changeSearchParams(query);

      resource.search(query);
    }
  }

  /**
   * @override
   */
  onCreated(params: AdminTableEventCommonParams): void {
    this.schemaFormRef?.resetFields();
    this.store.emit({
      ...this.store.state,
      selectedResource: params.dataSource,
      action: AdminTableEventAction.CREATE,
      openPopup: true
    });
  }

  /**
   * @override
   */
  onDeleted(_params: AdminTableEventCommonParams): void {
    this.uiDialog?.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this item?',
      onOk: () => this.actionDelete(_params)
    });
  }

  /**
   * @override
   */
  onDetail(_params: AdminTableEventCommonParams): void {
    const { dataSource } = _params;

    if (!dataSource) {
      return;
    }

    this.schemaFormRef?.setFieldsValue(dataSource);

    this.store.emit({
      ...this.store.state,
      selectedResource: dataSource,
      action: AdminTableEventAction.DETAIL,
      openPopup: true
    });
  }

  /**
   * @override
   */
  onEdited(_params: AdminTableEventCommonParams): void {
    const { dataSource } = _params;

    if (!dataSource) {
      return;
    }

    this.schemaFormRef?.setFieldsValue(dataSource);

    this.store.emit({
      ...this.store.state,
      selectedResource: dataSource,
      action: AdminTableEventAction.EDIT,
      openPopup: true
    });
  }

  /**
   * @override
   */
  async onRefresh(_params: AdminTableEventCommonParams): Promise<unknown> {
    const resource = this.resource;
    const resourceStore = resource.getStore();

    resourceStore.changeListState(
      new RequestState(true, resourceStore.state.listState.result)
    );

    try {
      const result = await resource.search(resourceStore.state.searchParams);

      resourceStore.changeListState(new RequestState(false, result).end());
      return result;
    } catch (error) {
      resourceStore.changeListState(new RequestState(false, null, error).end());

      return error;
    }
  }

  /**
   * @override
   */
  onClosePopup(): void {
    if (
      this.store.state.createState.loading ||
      this.store.state.editState.loading
    ) {
      return;
    }

    this.schemaFormRef?.resetFields();
    this.store.emit({
      ...this.store.state,
      selectedResource: undefined,
      action: undefined,
      openPopup: false
    });
  }

  /**
   * @override
   */
  created(): void {
    this.resource.created();
    this.store.reset();
  }

  /**
   * @override
   */
  updated(): void {
    this.resource.updated();
  }

  /**
   * @override
   */
  destroyed(): void {
    this.resource.destroyed();
    this.store.reset();
  }
}
