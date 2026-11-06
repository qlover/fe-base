import { describe, expect, it } from 'vitest';
import {
  isGuardHistoryState,
  isModifiedAnchorClick,
  withGuardHistoryState
} from '../src/client/hooks/NavigationGuardUtil';

describe('NavigationGuardUtil', () => {
  it('detects modifier clicks', () => {
    expect(
      isModifiedAnchorClick({
        button: 0,
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        altKey: false
      } as MouseEvent)
    ).toBe(true);
    expect(
      isModifiedAnchorClick({
        button: 0,
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
        altKey: false
      } as MouseEvent)
    ).toBe(false);
  });

  it('marks and detects guard history state', () => {
    const next = withGuardHistoryState({ foo: 1 });
    expect(next.foo).toBe(1);
    expect(isGuardHistoryState(next)).toBe(true);
    expect(isGuardHistoryState(null)).toBe(false);
  });
});
