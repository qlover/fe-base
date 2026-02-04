import 'reflect-metadata';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App.tsx';
import { IOC } from './globals';
import { BootstrapClient } from './impls/BootstrapClient';
import { getAllPages } from './utils/getAllPages';

// backend bootstrap
new BootstrapClient(IOC).startup(window);
// frontend bootstrap(UI)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App pages={getAllPages()} />
  </StrictMode>
);
