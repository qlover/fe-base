// !only this file use `window`, `document` ...global variables
import 'reflect-metadata';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import startup from './core/bootstrap';
import { AppIOCContainer } from './core/AppIOCContainer';

startup({
  window: window,
  IOCContainer: new AppIOCContainer(),
  envSource: import.meta.env
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
