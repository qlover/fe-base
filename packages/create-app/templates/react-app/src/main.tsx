import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import * as feGlobals from '@/core/globals';
import { IOC } from './core';
import { FeIOC } from './core/feIOC/FeIOC';

// set global feGlobals
if (typeof window !== 'undefined') {
  // implement feIOC
  IOC.implement(new FeIOC());

  // set global feGlobals
  window.feGlobals = Object.freeze(Object.assign({}, feGlobals));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
