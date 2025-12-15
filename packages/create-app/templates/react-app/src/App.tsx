import '@/styles/css/index.css';
import { themeConfig } from '@config/theme';
import { lazy } from 'react';
import { AppRouterProvider } from './uikit/components/AppRouterProvider';
import { BootstrapsProvider } from './uikit/components/BootstrapsProvider';
import { ComboProvider } from './uikit/components/ComboProvider';
import type { ComponentValue } from './base/cases/RouterLoader';

const allPages = (function getAllPages() {
  // !!! important, map to all pages in pages directory
  const modules = import.meta.glob('./pages/**/*.tsx');
  return Object.keys(modules).reduce((acc, path) => {
    // !!! important, convert path to component name
    const componentName = path.replace(/^\.\/pages\/(.*)\.tsx$/, '$1');
    acc[componentName] = () =>
      lazy(
        modules[path] as () => Promise<{
          default: React.ComponentType<unknown>;
        }>
      );
    return acc;
  }, {} as ComponentValue);
})();

function App() {
  return (
    <BootstrapsProvider>
      <ComboProvider themeConfig={themeConfig}>
        <AppRouterProvider pages={allPages} />
      </ComboProvider>
    </BootstrapsProvider>
  );
}

export default App;
