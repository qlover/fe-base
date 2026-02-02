import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App.tsx';
import { BootstrapClient } from './impls/BootstrapClient';

// backend bootstrap
new BootstrapClient().startup(window);

// frontend bootstrap(UI)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
