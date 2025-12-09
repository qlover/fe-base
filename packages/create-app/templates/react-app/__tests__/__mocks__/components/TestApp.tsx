import {
  TestBootstrapsProvider,
  type TestBootstrapsProviderProps
} from './TestBootstrapsProvider';

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
  routerInitialIndex,
  bootHref,
  appConfig
}: TestBootstrapsProviderProps) {
  return (
    <TestBootstrapsProvider
      data-testid="TestApp"
      routerInitialEntries={routerInitialEntries}
      routerInitialIndex={routerInitialIndex}
      bootHref={bootHref}
      appConfig={appConfig}
    >
      {children}
    </TestBootstrapsProvider>
  );
}
