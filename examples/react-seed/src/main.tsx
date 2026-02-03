import 'reflect-metadata';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App.tsx';
import { containerImpl } from './globals';
import { BootstrapClient } from './impls/BootstrapClient';

// backend bootstrap
new BootstrapClient(containerImpl).startup(window);
// frontend bootstrap(UI)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
