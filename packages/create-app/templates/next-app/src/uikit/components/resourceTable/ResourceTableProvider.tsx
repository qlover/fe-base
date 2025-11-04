import { ResourceTableContext } from './ResourceTableContext';
import type { ResourceTableContextType } from './ResourceTableContext';

export function ResourceTableProvider({
  children,
  formComponents,
  smPlacement
}: ResourceTableContextType & { children: React.ReactNode }) {
  return (
    <ResourceTableContext.Provider
      data-testid="ResourceTableProvider"
      value={{ formComponents, smPlacement }}
    >
      {children}
    </ResourceTableContext.Provider>
  );
}
