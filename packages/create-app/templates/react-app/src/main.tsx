// !only this file use `window`, `document` ...global variables
import 'reflect-metadata';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BootstrapClient } from './core/bootstraps/BootstrapClient';
import { clientIOC } from './core/clientIoc/ClientIOC.ts';
import { ChatRoot } from './uikit/components/chat/ChatRoot.tsx';

BootstrapClient.main({
  root: window,
  bootHref: window.location.href,
  ioc: clientIOC
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChatRoot />
  </StrictMode>
);
