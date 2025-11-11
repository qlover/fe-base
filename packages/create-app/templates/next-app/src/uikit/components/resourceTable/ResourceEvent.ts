import {
  RequestState,
  type ResourceServiceInterface,
  type ResourceStateInterface,
  type ResourceQuery,
  type ResourceStore
} from '@qlover/corekit-bridge';
import type {
  ResourceTableEventCommonParams,
  ResourceTableEventInterface
} from '@/uikit/components/resourceTable';
import { ResourceTableEventAction } from '@/uikit/components/resourceTable';
import { ResourceEventStroe } from './ResourceEventStroe';
import type { FormInstance } from 'antd';

export class ResourceEvent implements ResourceTableEventInterface {
  readonly store: ResourceEventStroe;
  constructor(
    readonly namespace: string,
    protected resource: ResourceServiceInterface<
      unknown,
      ResourceStore<ResourceStateInterface>
    >,
    store?: ResourceEventStroe,
    protected schemaFormRef?: FormInstance<unknown>
  ) {
    this.store = store || new ResourceEventStroe();
  }

  /**
   * @override
   */
  getResource(): ResourceServiceInterface<
    unknown,
    ResourceStore<ResourceStateInterface>
  > {
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
      action === ResourceTableEventAction.CREATE &&
      !this.store.state.createState.loading
    ) {
      return await this.actionCreate(values);
    }

    if (
      action === ResourceTableEventAction.EDIT &&
      !this.store.state.editState.loading
    ) {
      return await this.actionEdit(values);
    }

    throw new Error('Invalid action');
  }

  /**
   * @override
   */
  onChangeParams(params: ResourceTableEventCommonParams & ResourceQuery): void {
    const { resource, ...query } = params;

    if (resource) {
      resource.getStore().changeSearchParams(query);

      resource.search(query);
    }
  }

  /**
   * @override
   */
  onCreated(params: ResourceTableEventCommonParams): void {
    this.schemaFormRef?.resetFields();
    this.store.emit({
      ...this.store.state,
      selectedResource: params.dataSource,
      action: ResourceTableEventAction.CREATE,
      openPopup: true
    });
  }

  /**
   * @override
   */
  onDeleted(_params: ResourceTableEventCommonParams): void {
    this.resource.remove(_params.dataSource);
  }

  /**
   * @override
   */
  onDetail(_params: ResourceTableEventCommonParams): void {
    const { dataSource } = _params;

    if (!dataSource) {
      return;
    }

    this.schemaFormRef?.setFieldsValue(dataSource);

    this.store.emit({
      ...this.store.state,
      selectedResource: dataSource,
      action: ResourceTableEventAction.DETAIL,
      openPopup: true
    });
  }

  /**
   * @override
   */
  onEdited(_params: ResourceTableEventCommonParams): void {
    const { dataSource } = _params;

    if (!dataSource) {
      return;
    }

    this.schemaFormRef?.setFieldsValue(dataSource);

    this.store.emit({
      ...this.store.state,
      selectedResource: dataSource,
      action: ResourceTableEventAction.EDIT,
      openPopup: true
    });
  }

  /**
   * @override
   */
  async onRefresh(_params: ResourceTableEventCommonParams): Promise<unknown> {
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
