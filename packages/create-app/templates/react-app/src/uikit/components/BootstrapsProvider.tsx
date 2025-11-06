'use client';
import { clientIOC } from '@/core/clientIoc/ClientIOC';
import { IOCContext } from '../contexts/IOCContext';

export function BootstrapsProvider(props: { children: React.ReactNode }) {
  const IOC = clientIOC.create();

  return (
    <IOCContext.Provider data-testid="BootstrapsProvider" value={IOC}>
      {props.children}
    </IOCContext.Provider>
  );
}
