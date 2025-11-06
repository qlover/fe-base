import { TestBootstrapsProvider } from './TestBootstrapsProvider';

interface TestAppProps {
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
}

/**
 * TestApp - Complete test wrapper with IOC and Router
 * 
 * Usage:
 * ```tsx
 * import { TestApp } from '__tests__/__mocks__/components/TestApp';
 * 
 * render(
 *   <TestApp routerInitialEntries={['/en/dashboard']}>
 *     <YourComponent />
 *   </TestApp>
 * );
 * ```
 */
export function TestApp({
  children,
  routerInitialEntries,
  routerInitialIndex
}: TestAppProps) {
  return (
    <TestBootstrapsProvider
      routerInitialEntries={routerInitialEntries}
      routerInitialIndex={routerInitialIndex}
    >
      {children}
    </TestBootstrapsProvider>
  );
}
