import {
  RequestState,
  StoreInterface,
  type StoreStateInterface
} from '@qlover/corekit-bridge';
import type { ResourceTableEventActionType } from './ResourceTableEventInterface';

export class ResourceTableState implements StoreStateInterface {
  selectedResource?: unknown;
  action: ResourceTableEventActionType | undefined;
  openPopup: boolean = false;

  createState = new RequestState<unknown>();
  deleteState = new RequestState<unknown>();
  editState = new RequestState<unknown>();
}

export class ResourceEventStroe extends StoreInterface<ResourceTableState> {
  constructor() {
    super(() => new ResourceTableState());
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
