'use client';
import '@ant-design/v5-patch-for-react-19';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { BootstrapClient } from '@/impls/bootstraps/BootstrapClient';
import { I } from '@config/ioc-identifiter';
import type { I18nServiceLocale } from '@interfaces/I18nServiceInterface';
import { useIOC } from '../hook/useIOC';
import { useStrictEffect } from '../hook/useStrictEffect';
import { useWarnTranslations } from '../hook/useWarnTranslations';

export function BootstrapsProvider(props: { children: React.ReactNode }) {
  const IOC = useIOC();
  const locale = useLocale();
  const t = useWarnTranslations();

  const [, setIocMounted] = useState(false);

  const [bootstrap] = useState(() => {
    return new BootstrapClient(IOC);
  });

  useStrictEffect(() => {
    bootstrap
      .startup(window)
      .then(() => {
        setIocMounted(true);
      })
      .catch((error) => {
        console.error('BootstrapsProvider startup failed!', error);
      });
  }, []);

  useEffect(() => {
    IOC(I.I18nServiceInterface).changeLanguage(locale as I18nServiceLocale);
    IOC(I.I18nServiceInterface).setTranslator(t);
  }, [t, IOC, locale]);

  return props.children;
}
