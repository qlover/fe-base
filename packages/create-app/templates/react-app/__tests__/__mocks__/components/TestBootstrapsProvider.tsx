import { IOCContext } from '@/uikit/contexts/IOCContext';
import { TestRouter } from './TestRouter';
import { testIOC } from '../testIOC/TestIOC';

export function TestBootstrapsProvider({
  children,
  routerInitialEntries,
  routerInitialIndex
}: {
  children: React.ReactNode;
  /**
   * Initial URL path for the router
   * @default ['/en/']
   */
  routerInitialEntries?: string[];
  /**
   * Initial index of the entries array
   * @default 0
   */
  routerInitialIndex?: number;
}) {
  const IOC = testIOC.create();

  return (
    <IOCContext.Provider data-testid="TestBootstrapsProvider" value={IOC}>
      <TestRouter
        initialEntries={routerInitialEntries}
        initialIndex={routerInitialIndex}
      >
        {children}
      </TestRouter>
    </IOCContext.Provider>
  );
}
