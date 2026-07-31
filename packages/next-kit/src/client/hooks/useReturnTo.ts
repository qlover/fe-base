import { URLParamsStorage } from '@qlover/corekit-bridge';
import { useCallback, useMemo } from 'react';

/**
 * Read a return-to URL from query params and navigate back to it.
 */
export function useReturnTo(props: {
  returnToKey: string | readonly string[];
  caseSensitive?: boolean;
}) {
  const { returnToKey, caseSensitive = false } = props;

  const returnToValue = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return new URLParamsStorage<string | readonly string[]>(
      window.location.href,
      {
        caseSensitive
      }
    ).getItem(returnToKey);
  }, [returnToKey, caseSensitive]);

  const returnTo = useCallback(
    (defaultPath?: string) => {
      let finalURL: URL | string | undefined;
      if (returnToValue) {
        finalURL = new URL(returnToValue, window.location.origin);
      } else if (defaultPath) {
        finalURL = defaultPath;
      }

      if (finalURL?.toString().startsWith('http')) {
        window.location.replace(finalURL);
        return;
      }

      if (finalURL) {
        window.location.assign(finalURL);
      }
    },
    [returnToValue]
  );

  return { returnTo, returnToValue };
}
