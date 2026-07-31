import { useEffect, useState } from 'react';

/**
 * `true` only after the component has mounted on the client.
 * Useful to avoid hydration mismatches for client-only UI.
 */
export function useMountedClient(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
