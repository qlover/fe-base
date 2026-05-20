import { describe, it, expect } from 'vitest';
import postcss from 'postcss';
import themePlugin from '../src/plugin';

async function runPlugin(
  input: string,
  from: string,
  options: Parameters<typeof themePlugin>[0] = {}
) {
  const plugin = themePlugin(options);
  const result = await postcss([plugin]).process(input, { from });
  return result.css;
}

describe('themePlugin', () => {
  it('prepends theme CSS when from matches default includePaths', async () => {
    const css = await runPlugin('body { color: red; }', '/project/styles/index.css');
    expect(css).toContain('@layer base {');
    expect(css).toContain('@theme {');
    expect(css).toContain('body { color: red; }');
    expect(css.indexOf('@layer base')).toBeLessThan(css.indexOf('body'));
  });

  it('prepends theme CSS for tailwind.css path', async () => {
    const css = await runPlugin('.foo {}', 'D:\\app\\styles\\tailwind.css');
    expect(css).toContain('@theme {');
    expect(css).toContain('.foo {}');
  });

  it('skips processing when from does not match includePaths', async () => {
    const input = 'body { margin: 0; }';
    const css = await runPlugin(input, '/project/other/styles.css');
    expect(css).toBe(input);
  });

  it('processes when from is empty (no path guard)', async () => {
    const css = await runPlugin('body {}', '');
    expect(css).toContain('@layer base {');
  });

  it('respects custom includePaths', async () => {
    const input = '.bar {}';
    const css = await runPlugin(input, '/app/custom/theme-entry.css', {
      includePaths: ['/custom/theme-entry.css']
    });
    expect(css).toContain('@theme {');
    expect(css).toContain('.bar {}');
  });

  it('passes theme options through to generated CSS', async () => {
    const css = await runPlugin('body {}', '/styles/index.css', {
      prefix: 'my',
      themes: { light: { 'color-primary': '9 9 9' } },
      defaultTheme: 'light'
    });
    expect(css).toContain('--my-color-primary: 9 9 9;');
  });
});
