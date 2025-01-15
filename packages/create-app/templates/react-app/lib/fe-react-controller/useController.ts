import { useSliceStore } from '@qlover/slice-store-react';
import { FeController } from './FeController';
import { useEffect, useRef, useState } from 'react';

/**
 * Hook for managing controller instances and their state.
 * Change controller to UIController
 * @param createController Factory function that creates a controller instance or controller instance
 * @returns Controller instance with precise type inference
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useController<C extends FeController<any>>(
  createController: (() => C) | C
): C {
  const controllerRef = useRef<C | null>(null);
  const [, forceUpdate] = useState(0);

  if (!controllerRef.current) {
    controllerRef.current =
      typeof createController === 'function'
        ? createController()
        : createController;
  }

  useEffect(() => {
    const controller = controllerRef.current!;

    const unsubscribe = controller.observe(() => {
      forceUpdate((prev) => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return controllerRef.current;
}

/**
 * Create a Controller instance and cache it to avoid repeated creation
 *
 * @see https://github.com/alibaba/hooks/blob/master/packages/hooks/src/useCreation/index.ts
 * @param Controller
 * @param args
 * @returns
 */
export function useCreateController<
  T,
  Ctrl extends FeController<T>,
  Args extends unknown[]
>(Controller: new (...args: Args) => Ctrl, ...args: Args): Ctrl {
  const { current } = useRef({
    target: undefined as undefined | Ctrl,
    initialized: false
  });

  if (!current.initialized) {
    current.target = new Controller(...args);
    current.initialized = true;
  }

  return current.target as Ctrl;
}

export function useControllerState<T, S = T>(
  controller: FeController<T>,
  selector?: (state: T) => S
): S {
  return useSliceStore(controller, selector);
}
