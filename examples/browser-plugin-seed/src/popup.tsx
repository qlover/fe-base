import './style.css';
import {
  RouterProvider,
  type RouterComponentMap
} from '@/components/RouterProvider';
import { I18nProvider } from '@/contexts/I18nProvider';
import { IOCContext } from '@/contexts/IOCContext';
import { BootstrapClient } from '@/impls/BootstrapClient';
import { logger } from '@/impls/globals';
import { IOCIdentifierRegister } from '@/impls/IOCIdentifierRegister';
import { SimpleIOCContainer } from '@/impls/SimpleIOCContainer';
import type { IOCIdentifierMap } from '@config/ioc-identifier';
import { baseRoutes } from '@config/router';
import { createIOCFunction } from '@qlover/corekit-bridge/ioc';
import { lazy, useEffect, useMemo, useState } from 'react';

const lazyComponentMap: RouterComponentMap = {
  'base/Layout': lazy(() => import('@/pages/base/Layout')),
  'base/HomePage': lazy(() => import('@/pages/HomePage')),
  'base/RedirectToHome': lazy(() => import('@/pages/base/RedirectToHome')),
  'auth/Layout': lazy(() => import('@/pages/auth/Layout')),
  'auth/RedirectToLogin': lazy(() => import('@/pages/auth/RedirectToLogin')),
  'auth/Login': lazy(() => import('@/pages/auth/Login')),
  'auth/Register': lazy(() => import('@/pages/auth/Register')),
  '404': lazy(() => import('@/pages/404')),
  '500': lazy(() => import('@/pages/500'))
};

function IndexPopup() {
  const [IOC] = useState(() => {
    const IOC = createIOCFunction<IOCIdentifierMap>(
      new SimpleIOCContainer(logger)
    );
    IOCIdentifierRegister.register(IOC.implemention!, IOC);
    return IOC;
  });
  const bootstrap = useMemo(() => new BootstrapClient(IOC), [IOC]);

  useEffect(() => {
    logger.info('bootstrap');
    // bootstrap.startup(globalThis);
  }, [bootstrap]);

  return (
    <IOCContext.Provider value={IOC}>
      <I18nProvider>
        <RouterProvider componentMap={lazyComponentMap} routes={baseRoutes} />
      </I18nProvider>
    </IOCContext.Provider>
  );
}

export default IndexPopup;
