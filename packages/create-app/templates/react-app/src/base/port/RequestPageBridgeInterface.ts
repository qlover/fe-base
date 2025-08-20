import { StoreInterface, StoreStateInterface } from '@qlover/corekit-bridge';
import { RequestState } from '../cases/RequestState';

export interface RequestPageStateInterface extends StoreStateInterface {
  helloState: RequestState<unknown>;
  ipInfoState: RequestState<unknown>;
  randomUserState: RequestState<unknown>;
  abortState: RequestState<unknown>;
  apiCatchResultState: RequestState<unknown>;
}

export abstract class RequestPageBridgeInterface extends StoreInterface<RequestPageStateInterface> {
  abstract onHello: () => void;
  abstract onIpInfo: () => void;
  abstract onRandomUser: () => void;
  abstract onTriggerApiCatchResult: () => void;
  abstract onTriggerAbortRequest: () => void;
  abstract stopAbortRequest: () => void;

  emitState(state: Partial<RequestPageStateInterface>): void {
    this.emit(this.cloneState(state));
  }
}
