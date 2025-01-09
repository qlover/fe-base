import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import * as feGlobals from '@/containers/globals.ts';

// set global feGlobals
if (typeof window !== 'undefined') {
  window.feGlobals = feGlobals;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
