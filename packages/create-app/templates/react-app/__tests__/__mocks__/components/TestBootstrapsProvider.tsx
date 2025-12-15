import { appConfig as globalsAppConfig } from '@/core/globals';
import { IOCContext } from '@/uikit/contexts/IOCContext';
import { TestRouter } from './TestRouter';
import { testIOC } from '../testIOC/TestIOC';
import type { EnvConfigInterface } from '@qlover/corekit-bridge';
export interface TestBootstrapsProviderProps {
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

  /**
   * The boot href
   *
   * @default `https://localhost.test:3000/en/`
   */
  bootHref?: string;

  appConfig?: EnvConfigInterface;
}

const defaultBootHref = 'https://localhost.test:3000/en/';

export function TestBootstrapsProvider({
  children,
  routerInitialEntries,
  routerInitialIndex,
  bootHref,
  appConfig
}: TestBootstrapsProviderProps) {
  const IOC = testIOC.create({
    pathname: bootHref ?? defaultBootHref,
    appConfig: appConfig ?? globalsAppConfig
  });

  return (
    <IOCContext.Provider value={IOC}>
      <TestRouter
        initialEntries={routerInitialEntries}
        initialIndex={routerInitialIndex}
      >
        {children}
      </TestRouter>
    </IOCContext.Provider>
  );
}
