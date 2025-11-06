// !only this file use `window`, `document` ...global variables
import 'reflect-metadata';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { BootstrapClient } from './core/bootstraps/BootstrapClient.ts';
import { clientIOC } from './core/clientIoc/ClientIOC.ts';
import { BootstrapsProvider } from './uikit/components/BootstrapsProvider.tsx';

BootstrapClient.main({
  root: window,
  bootHref: window.location.href,
  IOC: clientIOC.create()
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BootstrapsProvider>
      <App />
    </BootstrapsProvider>
  </StrictMode>
);
