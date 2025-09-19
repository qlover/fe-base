'use client';
import '@ant-design/v5-patch-for-react-19';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { NavigateBridge } from '@/base/cases/NavigateBridge';
import type { I18nServiceLocale } from '@/base/port/I18nServiceInterface';
import { BootstrapClient } from '@/core/bootstraps/BootstrapClient';
import { clientIOC } from '@/core/clientIoc/ClientIOC';
import { I } from '@config/IOCIdentifier';
import { IOCContext } from '../context/IOCContext';

export function BootstrapsProvider(props: { children: React.ReactNode }) {
  const IOC = clientIOC.create();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    IOC(I.RouterServiceInterface).setLocale(locale);
    IOC(NavigateBridge).setUIBridge(router);
  }, [locale, router, IOC]);

  useEffect(() => {
    IOC(I.I18nServiceInterface).changeLanguage(locale as I18nServiceLocale);
    IOC(I.I18nServiceInterface).setTranslator(t);
  }, [t, IOC, locale]);

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
