'use client';
import '@ant-design/v5-patch-for-react-19';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useEffect } from 'react';
import { I } from '@config/IOCIdentifier';
import { NavigateBridge } from '@/base/cases/NavigateBridge';
import { BootstrapClient } from '@/core/bootstraps/BootstrapClient';
import { clientIOC } from '@/core/clientIoc/ClientIOC';
import { IOCContext } from '../context/IOCContext';

export function BootstrapsProvider(props: { children: React.ReactNode }) {
  const IOC = clientIOC.create();
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    IOC(I.RouterServiceInterface).setLocale(locale);
    IOC(NavigateBridge).setUIBridge(router);
  }, [locale, router, IOC]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      BootstrapClient.main({
        root: window,
        pathname: window.location.pathname,
        IOC: IOC
      });
    }
  }, [IOC]);

  return (
    <IOCContext.Provider data-testid="BootstrapsProvider" value={IOC}>
      {props.children}
    </IOCContext.Provider>
  );
}
