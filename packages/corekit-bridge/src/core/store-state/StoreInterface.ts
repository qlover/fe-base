import { SliceStore } from '@qlover/slice-store';
import { clone } from './clone';

/**
 * Store state interface
 *
 * Significance: Defines the contract for store state objects
 * Core idea: Enforce a consistent structure for store state
 * Main function: Used as a base for all store state types
 * Main purpose: Type safety and extensibility for store state
 *
 * @example
 * class ChatStoreState implements StoreStateInterface {
 *   isChatRunning: boolean = false;
 * }
 */
export interface StoreStateInterface {
  // You can define your own properties here
  // ...
}

/**
 * Store interface
 *
 * Significance: Abstract base for all state stores
 * Core idea: Provide a unified API for state management with reset and clone helpers
 * Main function: Extend SliceStore, add resetState and cloneState utilities
 * Main purpose: Simplify store implementation and ensure consistency
 *
 * @example
 * class ChatStoreState implements StoreStateInterface {
 *   isChatRunning: boolean = false;
 * }
 *
 * export class ChatStore extends StoreInterface<ChatStoreState> {
 *   constructor() {
 *     super(() => new ChatStoreState());
 *   }
 * }
 */
export abstract class StoreInterface<
  T extends StoreStateInterface
> extends SliceStore<T> {
  /**
   * Constructor
   *
   * @param stateFactory - () => T, factory function to create the initial state
   */
  constructor(protected stateFactory: () => T) {
    super(stateFactory);
  }

  /**
   * Reset the state of the store
   *
   * @deprecated use `this.reset()` instead, extends `SliceStore`
   * @returns void
   */
  resetState(): void {
    // Create a new instance of initial state
    this.emit(this.stateFactory());
  }

  /**
   * Clone the state of the store
   *
   * @param source Partial<T> - properties to override in the cloned state
   * @returns T - the new cloned state
   * @since 1.3.1
   */
  cloneState(source?: Partial<T>): T {
    const cloned = clone(this.state);
    if (typeof cloned === 'object' && cloned !== null) {
      Object.assign(cloned, source);
    }
    return cloned;
  }
}
