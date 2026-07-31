import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { StrictMode } from 'react';
import { renderHook } from '@testing-library/react';
import { useStrictEffect } from '../src/client/hooks/useStrictEffect';

describe('useStrictEffect', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('runs the effect once under React StrictMode', () => {
    const effect = vi.fn(() => vi.fn());

    const { unmount } = renderHook(() => useStrictEffect(effect, []), {
      wrapper: StrictMode
    });

    expect(effect).toHaveBeenCalledTimes(1);

    unmount();
    vi.runAllTimers();
  });

  it('re-runs when object dependency identity changes', () => {
    const effect = vi.fn(() => vi.fn());
    let dep = { id: 1 };

    const { rerender, unmount } = renderHook(
      ({ d }) => useStrictEffect(effect, [d]),
      { initialProps: { d: dep } }
    );
    expect(effect).toHaveBeenCalledTimes(1);

    dep = { id: 1 };
    rerender({ d: dep });
    expect(effect).toHaveBeenCalledTimes(2);

    unmount();
    vi.runAllTimers();
  });

  it('runs every render when deps are omitted', () => {
    const effect = vi.fn();
    const { rerender, unmount } = renderHook(() => useStrictEffect(effect));

    expect(effect).toHaveBeenCalledTimes(1);
    rerender();
    expect(effect).toHaveBeenCalledTimes(2);

    unmount();
  });
});
