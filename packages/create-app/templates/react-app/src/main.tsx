import 'reflect-metadata';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { Bootstrap } from './core/Bootstrap';
import { FeContainer } from './core/feIOC/FeContainer';

new Bootstrap(new FeContainer()).start();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
