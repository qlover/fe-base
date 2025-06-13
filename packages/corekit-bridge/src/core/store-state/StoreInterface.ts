import { SliceStore } from '@qlover/slice-store-react';

/**
 * Store State Interface
 *
 * This interface is used to define the state of a store.
 * It is used to define the state of a store.
 *
 * must implement the copyWith method
 */
export interface StoreStateInterface {
  // You can define your own properties here
  // ...
}

/**
 * Store Interface
 *
 * This class is used to define the store interface.
 * It is used to define the store interface.
 *
 * @example
 * ```ts
 * class ChatStoreState implements StoreStateInterface {
 *   isChatRunning: boolean = false;
 *
 *   copyWith(state: { isChatRunning?: boolean }): this {
 *     return Object.assign(new ChatStoreState(), this, state);
 *   }
 * }
 *
 * export class ChatStore extends StoreInterface<ChatStoreState> {
 *   constructor() {
 *     super(() => new ChatStoreState());
 *   }
 * }
 * ```
 */
export abstract class StoreInterface<
  T extends StoreStateInterface
> extends SliceStore<T> {
  /**
   * Constructor
   *
   * @param stateFactory - The factory function to create the initial state
   */
  constructor(protected stateFactory: () => T) {
    super(stateFactory);
  }

  /**
   * Reset the state of the store
   */
  resetState(): void {
    // Create a new instance of initial state
    this.emit(this.stateFactory());
  }
}
