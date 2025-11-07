import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';

interface TestRouterProps {
  children: ReactNode;
  /**
   * Initial URL path for the router
   * @default '/en/'
   */
  initialEntries?: string[];
  /**
   * Initial index of the entries array
   * @default 0
   */
  initialIndex?: number;
}

/**
 * TestRouter - A reusable router wrapper for tests
 *
 * Usage:
 * ```tsx
 * import { TestRouter } from '__tests__/__mocks__/components/TestRouter';
 *
 * render(
 *   <TestRouter initialEntries={['/en/dashboard']}>
 *     <YourComponent />
 *   </TestRouter>
 * );
 * ```
 */
export function TestRouter({
  children,
  initialEntries = ['/en/'],
  initialIndex = 0
}: TestRouterProps) {
  return (
    <MemoryRouter
      data-testid="TestRouter"
      initialEntries={initialEntries}
      initialIndex={initialIndex}
    >
      {children}
    </MemoryRouter>
  );
}
