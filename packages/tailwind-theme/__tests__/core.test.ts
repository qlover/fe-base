import { describe, it, expect } from 'vitest';
import {
  generateLayerBaseCSS,
  generateThemeBlockCSS,
  generateThemeCSS
} from '../src/core';

describe('generateLayerBaseCSS', () => {
  it('emits CSS variables for each theme with default selectors', () => {
    const css = generateLayerBaseCSS({
      themes: { light: { 'color-primary': '10 20 30' } },
      defaultTheme: 'light'
    });
    expect(css).toContain(':root, html[data-theme="light"]');
    expect(css).toContain('--fe-color-primary: 10 20 30;');
    expect(css).toContain('--fe-color-text:');
    expect(css).toContain('--fe-color-bg-container:');
    expect(css).toContain('--fe-color-primary-bg:');
  });

  it('emits semantic colors and theme-specific primary-bg for builtin light theme', () => {
    const css = generateLayerBaseCSS({ defaultTheme: 'light' });
    expect(css).toContain('--fe-color-success: #1a7f37;');
    expect(css).toContain('--fe-color-primary-bg: rgb(var(--fe-color-brand) / 0.08);');
  });

  it('uses custom prefix and cssSelector', () => {
    const css = generateLayerBaseCSS({
      prefix: 'app',
      themes: { brand: { 'color-primary': '1 2 3' } },
      defaultTheme: 'brand',
      cssSelector: (name) => `.app-theme-${name}`
    });
    expect(css).toContain('.app-theme-brand {');
    expect(css).toContain('--app-color-primary: 1 2 3;');
  });

  it('emits non-default theme with theme-only selector', () => {
    const css = generateLayerBaseCSS({
      themes: {
        light: { 'color-primary': '1 1 1' },
        dark: { 'color-primary': '0 0 0' }
      },
      defaultTheme: 'light'
    });
    expect(css).toContain('html[data-theme="dark"], [data-theme="dark"]');
    expect(css).toContain('--fe-color-primary: 0 0 0;');
  });
});

describe('generateThemeBlockCSS', () => {
  it('wraps token mapping in @theme block with resolved prefix', () => {
    const css = generateThemeBlockCSS({ prefix: 'fe' });
    expect(css).toMatch(/^@theme \{/);
    expect(css).toContain('--color-primary: rgb(var(--fe-color-primary));');
    expect(css).toMatch(/\}\n$/);
  });

  it('uses custom tokenMapping', () => {
    const css = generateThemeBlockCSS({
      prefix: 'x',
      tokenMapping: { 'color-accent': 'rgb(var(--${prefix}-accent))' }
    });
    expect(css).toContain('--color-accent: rgb(var(--x-accent));');
  });
});

describe('generateThemeCSS', () => {
  it('combines @layer base and @theme', () => {
    const css = generateThemeCSS({
      themes: { light: { 'color-primary': '255 255 255' } },
      defaultTheme: 'light'
    });
    expect(css).toContain('@layer base {');
    expect(css).toContain('--fe-color-primary: 255 255 255;');
    expect(css).toContain('@theme {');
    expect(css).toContain('--color-primary: rgb(var(--fe-color-primary));');
  });
});
