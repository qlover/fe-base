# @qlover/ui-theme

Design tokens and theme CSS generator for Tailwind CSS v4. Ships built-in multi-theme palettes, `data-theme` switching, and programmatic CSS file generation.

## Install

```bash
pnpm add @qlover/ui-theme
# or
npm install @qlover/ui-theme
```

## Features

- Built-in themes: `light`, `dark`, `pink`, `amber`, `forest`, `ocean`
- Channel colors (RGB components) plus derived semantic tokens (e.g. `color-primary-bg`)
- Generates `@layer base` variables and Tailwind v4 `@theme` utility mappings
- Custom `themes`, `tokenMapping`, and `cssSelector`
- Pre-built CSS exports or regenerate via `generateThemeFile`
- Optional PostCSS plugin to inject theme CSS into entry stylesheets

## Quick start (Web / Next / Vite)

```css
/* src/styles/tailwind.css */
@import 'tailwindcss';
@import '@qlover/ui-theme/theme.css';
```

Set theme on the document root (aligned with `ThemeService` in `@qlover/corekit-bridge`):

```html
<html data-theme="dark">
```

Use semantic Tailwind classes:

```tsx
<div className="bg-primary text-primary-text border-primary-border">
  <button className="bg-brand text-on-brand hover:bg-brand-hover">Submit</button>
</div>
```

## Pre-built CSS exports

| Import path | Description |
|-------------|-------------|
| `@qlover/ui-theme/theme.css` | Full theme (`@layer base` + `@theme`), recommended |
| `@qlover/ui-theme/theme-layer-base.css` | Per-theme `--fe-*` channel variables only |
| `@qlover/ui-theme/theme-block.css` | Tailwind `@theme` utility mapping only |

Run `pnpm build` in this package inside the monorepo before consuming `dist/`.

## Programmatic API

```typescript
import {
  generateThemeCSS,
  generateLayerBaseCSS,
  generateThemeBlockCSS,
  generateThemeFile,
  generateThemeFiles,
  builtinThemes
} from '@qlover/ui-theme';

const css = generateThemeCSS({ defaultTheme: 'light' });

await generateThemeFile({
  variant: 'full', // 'layer-base' | 'theme-block' | 'full'
  outputPath: './src/styles/theme.generated.css',
  overwrite: true
});
```

### Custom `cssSelector` (e.g. Taro class-based root)

```typescript
await generateThemeFile({
  variant: 'layer-base',
  outputPath: './src/styles/taro-weapp-theme.css',
  cssSelector: (themeName) => `.fe-theme.theme-${themeName}`,
  defaultTheme: 'light',
  overwrite: true
});
```

See `examples/taro-seed/scripts/generate-theme-css.mjs` in the monorepo.

## PostCSS plugin

```javascript
import themePlugin from '@qlover/ui-theme/plugin';

export default {
  plugins: [themePlugin({ defaultTheme: 'light' })]
};
```

## Development

```bash
cd packages/ui-theme
pnpm build
pnpm test
```

## License

ISC
