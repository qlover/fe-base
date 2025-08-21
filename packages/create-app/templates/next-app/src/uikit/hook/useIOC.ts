import { useContext } from 'react';
import { IOCContext } from '../context/IOCContext';

export function useIOC() {
  const IOC = useContext(IOCContext);

  if (!IOC) {
    throw new Error('IOC is not found');
  }

  return IOC;
}
