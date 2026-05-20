import { describe, it, expect } from 'vitest';
import {
  builtinThemes,
  getConfig,
  getDefaultSelector,
  getDerivedTokens,
  defaultTokenMapping
} from '../src/config';

describe('getDefaultSelector', () => {
  it('returns root selectors for default theme', () => {
    expect(getDefaultSelector('light', true)).toBe(
      ':root, html[data-theme="light"], [data-theme="light"]'
    );
  });

  it('returns theme-only selectors for non-default theme', () => {
    expect(getDefaultSelector('dark', false)).toBe(
      'html[data-theme="dark"], [data-theme="dark"]'
    );
  });
});

describe('getDerivedTokens', () => {
  it('includes prefix in CSS var references', () => {
    const tokens = getDerivedTokens('fe');
    expect(tokens['color-bg-container']).toBe(
      'rgb(var(--fe-color-secondary))'
    );
    expect(tokens['color-text']).toContain('--fe-color-primary-text');
    expect(tokens['color-text-heading']).toBe(
      'rgb(var(--fe-color-primary-text))'
    );
    expect(tokens['line-height']).toBe('1.5715');
    expect(tokens['color-primary-bg']).toBe(
      'rgb(var(--fe-color-brand) / 0.1)'
    );
  });

  it('uses theme-specific primary-bg opacity', () => {
    expect(getDerivedTokens('fe', 'light')['color-primary-bg']).toBe(
      'rgb(var(--fe-color-brand) / 0.08)'
    );
    expect(getDerivedTokens('fe', 'dark')['color-primary-bg']).toBe(
      'rgb(var(--fe-color-brand) / 0.12)'
    );
    expect(getDerivedTokens('fe', 'forest')['color-primary-bg']).toBe(
      'rgb(var(--fe-color-brand) / 0.1)'
    );
  });
});

describe('getConfig', () => {
  it('uses defaults and merges builtin themes', () => {
    const config = getConfig();
    expect(config.prefix).toBe('fe');
    expect(config.themes).toEqual(builtinThemes);
    expect(config.tokenMapping).toEqual(defaultTokenMapping);
    expect(config.cssSelector).toBeTypeOf('function');
    expect(config.defaultTheme).toBe('light');
  });

  it('merges custom themes over builtin', () => {
    const config = getConfig({
      themes: {
        light: { 'color-primary': '1 1 1' },
        custom: { 'color-primary': '2 2 2' }
      }
    });
    expect(config.themes.light['color-primary']).toBe('1 1 1');
    expect(config.themes.dark).toEqual(builtinThemes.dark);
    expect(config.themes.custom).toEqual({ 'color-primary': '2 2 2' });
  });

  it('merges custom tokenMapping over default', () => {
    const config = getConfig({
      tokenMapping: { 'color-primary': 'rgb(var(--${prefix}-custom))' }
    });
    expect(config.tokenMapping['color-primary']).toBe(
      'rgb(var(--${prefix}-custom))'
    );
    expect(config.tokenMapping['color-secondary']).toBe(
      defaultTokenMapping['color-secondary']
    );
  });

  it('respects explicit defaultTheme', () => {
    const config = getConfig({ defaultTheme: 'dark' });
    expect(config.defaultTheme).toBe('dark');
  });

  it('applies custom prefix and cssSelector', () => {
    const cssSelector = (name: string) => `.theme-${name}`;
    const config = getConfig({ prefix: 'app', cssSelector });
    expect(config.prefix).toBe('app');
    expect(config.cssSelector).toBe(cssSelector);
  });
});
