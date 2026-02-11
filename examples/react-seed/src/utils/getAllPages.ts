import { lazy } from 'react';
import type { ComponentMap } from '@/impls/RouterLoader';

export function getAllPages() {
  // !!! important, map to all pages in pages directory
  const modules = import.meta.glob('../pages/**/*.{tsx,jsx}');
  return Object.keys(modules).reduce((acc, path) => {
    // !!! important, convert path to component name
    const componentName = path.replace(/^\.\.\/pages\/(.*)\.(tsx|jsx)$/, '$1');
    acc[componentName] = lazy(
      modules[path] as () => Promise<{
        default: React.ComponentType<unknown>;
      }>
    );
    return acc;
  }, {} as ComponentMap);
}
