import { createContext, useContext } from 'react';
import type { ResourceTableFormType } from './ResourceTableOption';
import type { DrawerProps } from 'antd';

export interface ResourceTableContextType {
  smPlacement?: DrawerProps['placement'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formComponents?: Record<ResourceTableFormType, React.ComponentType<any>>;
}

export const ResourceTableContext = createContext<ResourceTableContextType>({});

export function useResourceTableContext() {
  const context = useContext(ResourceTableContext);
  return context;
}
