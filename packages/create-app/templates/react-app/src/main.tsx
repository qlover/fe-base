import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { Bootstrap } from './core/bootstrap';
import { FeIOC } from './core/feIOC/FeIOC';

new Bootstrap(new FeIOC()).start();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
