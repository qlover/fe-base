// !only this file use `window`, `document` ...global variables
import 'reflect-metadata';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { BootstrapApp } from './core/bootstraps/BootstrapApp';

BootstrapApp.main();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
