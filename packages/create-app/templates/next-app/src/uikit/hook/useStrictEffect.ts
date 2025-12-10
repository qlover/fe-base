import { useEffect, useRef } from 'react';

/**
 * In React Strict Mode, ensure that the effect is executed only once when each dependency changes
 * @param effect The effect function to execute
 * @param deps The dependency array
 */
export const useStrictEffect = (
  effect: () => void | (() => void),
  deps?: React.DependencyList
) => {
  const mountedRef = useRef(false);
  const depsRef = useRef(deps);

  useEffect(() => {
    // Check if the dependencies have changed
    const depsChanged =
      !deps ||
      !depsRef.current ||
      deps.some((dep, i) => dep !== depsRef.current![i]);

    // Update the dependency reference
    depsRef.current = deps;

    // If it's the first mount or the dependencies have changed, execute the effect
    if (!mountedRef.current || depsChanged) {
      mountedRef.current = true;
      return effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
