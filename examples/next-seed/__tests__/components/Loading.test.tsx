import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Loading } from '@/uikit/components/Loading';

describe('Loading', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('renders three loading dots', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<Loading />);
    });

    expect(container.querySelector('[data-testid="LoadingRoot"]')).toBeTruthy();
    expect(container.querySelectorAll('[data-testid="Loading"]')).toHaveLength(
      3
    );
  });

  it('applies fullscreen layout when requested', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<Loading fullscreen />);
    });

    const rootEl = container.querySelector('[data-testid="LoadingRoot"]');
    expect(rootEl?.className).toContain('fixed');
  });
});
