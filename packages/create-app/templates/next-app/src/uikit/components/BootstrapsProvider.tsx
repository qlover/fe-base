'use client';
import '@ant-design/v5-patch-for-react-19';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { BootstrapClient } from '@/core/bootstraps/BootstrapClient';
import { useIOC } from '../hook/useIOC';
import { useStrictEffect } from '../hook/useStrictEffect';
import { useWarnTranslations } from '../hook/useWarnTranslations';
import { I } from '@config/IOCIdentifier';
import type { I18nServiceLocale } from '@/base/port/I18nServiceInterface';

export function BootstrapsProvider(props: { children: React.ReactNode }) {
  const IOC = useIOC();
  const locale = useLocale();
  const t = useWarnTranslations();

  const [, setIocMounted] = useState(false);

  useStrictEffect(() => {
    // clientIOC.register({
    //   appConfig: appConfig
    // });
    BootstrapClient.main({
      root: window,
      pathname: window.location.pathname,
      IOC: IOC
    }).then(() => {
      setIocMounted(true);
    });
  }, []);

  useEffect(() => {
    IOC(I.I18nServiceInterface).changeLanguage(locale as I18nServiceLocale);
    IOC(I.I18nServiceInterface).setTranslator(t);
  }, [t, IOC, locale]);

  return props.children;
}
