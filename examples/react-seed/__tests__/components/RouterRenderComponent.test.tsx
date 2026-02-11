import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterRenderComponent } from '@/components/RouterRenderComponent';
import type { RouterRenderProps } from '@/components/RouterRenderComponent';

vi.mock('@/components/Page', () => ({
  Page: ({
    children,
    route
  }: {
    children: React.ReactNode;
    route: unknown;
  }) => (
    <div data-testid="page" data-path={(route as { path?: string })?.path}>
      {children}
    </div>
  )
}));

vi.mock('@/components/Loading', () => ({
  Loading: () => <div data-testid="loading-fallback">Loading</div>
}));

describe('RouterRenderComponent', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const render = (route: Parameters<typeof RouterRenderComponent>[0]) => {
    const node = RouterRenderComponent(route);
    const root = createRoot(container);
    act(() => {
      root.render(node);
    });
  };

  it('should return null when element is null', () => {
    render({ path: '/', element: null });
    expect(container.firstChild).toBeNull();
  });

  it('should return null when element is undefined', () => {
    render({ path: '/', element: undefined });
    expect(container.firstChild).toBeNull();
  });

  it('should render string element inside Page and Suspense', () => {
    render({ path: '/test', element: 'Hello string' });
    expect(container.querySelector('[data-testid="page"]')).toBeTruthy();
    expect(container.textContent).toContain('Hello string');
  });

  it('should render number element inside Page and Suspense', () => {
    render({ path: '/num', element: 42 });
    expect(container.querySelector('[data-testid="page"]')).toBeTruthy();
    expect(container.textContent).toContain('42');
  });

  it('should render valid React element as content', () => {
    const element = <span data-testid="custom">Custom node</span>;
    render({ path: '/custom', element });
    expect(container.querySelector('[data-testid="page"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="custom"]')).toBeTruthy();
    expect(container.textContent).toContain('Custom node');
  });

  it('should render component with route prop when element is a component', () => {
    const MockComponent = ({ route }: RouterRenderProps) => (
      <div data-testid="mock-component" data-path={route.path}>
        Page at {route.path}
      </div>
    );
    render({
      path: '/dashboard',
      element: MockComponent as Parameters<
        typeof RouterRenderComponent
      >[0]['element']
    });
    expect(container.querySelector('[data-testid="page"]')).toBeTruthy();
    const comp = container.querySelector('[data-testid="mock-component"]');
    expect(comp).toBeTruthy();
    expect(comp?.getAttribute('data-path')).toBe('/dashboard');
    expect(container.textContent).toContain('Page at /dashboard');
  });

  it('should pass rest of route (without element) to Page and to component', () => {
    const MockComponent = ({ route }: RouterRenderProps) => (
      <div data-testid="mock" data-id={route.id}>
        {route.id}
      </div>
    );
    render({
      path: '/item',
      id: 'item-route',
      element: MockComponent as Parameters<
        typeof RouterRenderComponent
      >[0]['element']
    });
    expect(
      container.querySelector('[data-testid="page"]')?.getAttribute('data-path')
    ).toBe('/item');
    expect(
      container.querySelector('[data-testid="mock"]')?.getAttribute('data-id')
    ).toBe('item-route');
  });
});
