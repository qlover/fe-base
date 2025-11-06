import { StoreInterface, StoreStateInterface } from '@qlover/corekit-bridge';
import { RequestState } from '@qlover/corekit-bridge';

export interface ExecutorPageStateInterface extends StoreStateInterface {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  helloState: RequestState<any>;
}

/**
 * Executor Page Bridge Interface
 *
 * This interface provides a bridge for the ExecutorPage component to interact with the ExecutorController.
 * It allows the ExecutorPage component to subscribe to the ExecutorController's state and trigger actions.
 *
 * @example
 * const executorPageBridge = new ExecutorPageBridge();
 */
export abstract class ExecutorPageBridgeInterface extends StoreInterface<ExecutorPageStateInterface> {
  selector = {
    helloState: (state: ExecutorPageStateInterface) => state.helloState
  };

  abstract onTestPlugins: () => Promise<void>;
}
