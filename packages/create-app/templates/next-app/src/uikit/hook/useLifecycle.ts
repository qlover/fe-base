import { type LifecycleInterface } from '@qlover/corekit-bridge';
import { useEffect, useRef } from 'react';

export function useLifecycle(lifecycle: LifecycleInterface) {
  const mouted = useRef(false);

  useEffect(() => {
    if (!mouted.current) {
      mouted.current = true;

      requestAnimationFrame(() => {
        lifecycle.created();
      });
    }
  }, [lifecycle]);
}
