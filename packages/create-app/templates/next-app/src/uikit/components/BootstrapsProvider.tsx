'use client';
import '@ant-design/v5-patch-for-react-19';

import { useState } from 'react';
import { BootstrapClient } from '@/core/bootstraps/BootstrapClient';
import { useIOC } from '../hook/useIOC';
import { useStrictEffect } from '../hook/useStrictEffect';

export function BootstrapsProvider(props: { children: React.ReactNode }) {
  const IOC = useIOC();

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

  // useEffect(() => {
  //   const register = new ClientIOCRegister({
  //     appConfig: appConfig
  //   });

  //   // 启动前注册所有依赖
  //   // clientIOC.register(register);

  //   BootstrapClient.main({
  //     root: window,
  //     pathname: window.location.pathname,
  //     IOC: IOC,
  //     register: register
  //   }).then(() => {
  //     setIocMounted(true);
  //   });
  // }, []);

  // if (!register) {
  //   return <div data-testid="BootstrapsProviderLoading">Loading...</div>;
  // }

  // const IOC = clientIOC.create();
  // const locale = useLocale();
  // const router = useRouter();
  // const t = useWarnTranslations();

  // useEffect(() => {
  //   IOC(I.RouterServiceInterface).setLocale(locale);
  //   IOC(NavigateBridge).setUIBridge(router);
  // }, [locale, router, IOC]);

  // useEffect(() => {
  //   IOC(I.I18nServiceInterface).changeLanguage(locale as I18nServiceLocale);
  //   IOC(I.I18nServiceInterface).setTranslator(t);
  // }, [t, IOC, locale]);

  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     BootstrapClient.main({
  //       root: window,
  //       pathname: window.location.pathname,
  //       IOC: IOC
  //     });
  //   }
  // }, [IOC]);

  return props.children;
}
