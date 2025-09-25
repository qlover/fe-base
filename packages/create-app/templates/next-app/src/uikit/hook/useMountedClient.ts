import { useEffect, useState } from 'react';

export const useMountedClient = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      cancelAnimationFrame(timer);
    };
  }, []);

  return mounted;
};
