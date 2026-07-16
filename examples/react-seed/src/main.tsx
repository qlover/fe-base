import 'reflect-metadata';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App.tsx';
import { getAllPages } from './utils/getAllPages';

const allPages = getAllPages();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App pages={allPages} />
  </StrictMode>
);

void import('./bootstrapApp').then(({ bootstrapApp }) => bootstrapApp());
