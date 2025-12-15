import { StoreInterface } from '@qlover/corekit-bridge';
import type { StoreStateInterface, RequestState } from '@qlover/corekit-bridge';

export interface RequestPageStateInterface extends StoreStateInterface {
  helloState: RequestState<unknown>;
  ipInfoState: RequestState<unknown>;
  randomUserState: RequestState<unknown>;
  abortState: RequestState<unknown>;
  apiCatchResultState: RequestState<unknown>;
}

export abstract class RequestPageBridgeInterface extends StoreInterface<RequestPageStateInterface> {
  public abstract onHello: () => void;
  public abstract onIpInfo: () => void;
  public abstract onRandomUser: () => void;
  public abstract onTriggerApiCatchResult: () => void;
  public abstract onTriggerAbortRequest: () => void;
  public abstract stopAbortRequest: () => void;

  public emitState(state: Partial<RequestPageStateInterface>): void {
    this.emit(this.cloneState(state));
  }
}
