// !only this file use `window`, `document` ...global variables
import 'reflect-metadata';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { BootstrapApp } from './core/bootstraps/BootstrapApp';
import { IOC } from './core/IOC.ts';

BootstrapApp.main({
  root: window,
  bootHref: window.location.href,
  IOC: IOC
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
