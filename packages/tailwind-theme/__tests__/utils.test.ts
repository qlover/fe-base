import { describe, it, expect } from 'vitest';
import { resolveTokenValue, deepMerge } from '../src/utils';

describe('resolveTokenValue', () => {
  it('replaces all ${prefix} placeholders', () => {
    expect(resolveTokenValue('rgb(var(--${prefix}-color-primary))', 'fe')).toBe(
      'rgb(var(--fe-color-primary))'
    );
  });

  it('returns value unchanged when no placeholder', () => {
    expect(resolveTokenValue('rgb(var(--fe-color-primary))', 'fe')).toBe(
      'rgb(var(--fe-color-primary))'
    );
  });

  it('replaces multiple placeholders', () => {
    expect(
      resolveTokenValue('--${prefix}-a: var(--${prefix}-b)', 'custom')
    ).toBe('--custom-a: var(--custom-b)');
  });
});

describe('deepMerge', () => {
  it('merges shallow properties', () => {
    const target = { a: 1, b: 2 };
    // @ts-expect-error
    const result = deepMerge(target, { b: 3, c: 4 });
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
    expect(target).toEqual({ a: 1, b: 2 });
  });

  it('deep merges nested objects', () => {
    const target = {
      themes: {
        light: { 'color-primary': '1 2 3' }
      }
    };
    const result = deepMerge(target, {
      themes: {
        // @ts-expect-error
        light: { 'color-brand': '4 5 6' },
        dark: { 'color-primary': '0 0 0' }
      }
    });
    expect(result).toEqual({
      themes: {
        light: { 'color-primary': '1 2 3', 'color-brand': '4 5 6' },
        dark: { 'color-primary': '0 0 0' }
      }
    });
  });

  it('overwrites primitives and arrays without merging', () => {
    const target = { items: [1, 2], name: 'old' };
    const result = deepMerge(target, { items: [3], name: 'new' });
    expect(result).toEqual({ items: [3], name: 'new' });
  });
});
