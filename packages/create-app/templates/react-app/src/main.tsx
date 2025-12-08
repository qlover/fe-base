// !only this file use `window`, `document` ...global variables
import 'reflect-metadata';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { BootstrapClient } from './core/bootstraps/BootstrapClient';
import { clientIOC } from './core/clientIoc/ClientIOC';

BootstrapClient.main({
  root: window,
  bootHref: window.location.href,
  ioc: clientIOC
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
