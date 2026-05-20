# @qlover/ui-theme

面向 Tailwind CSS v4 的设计令牌与主题 CSS 生成器。提供内置多主题色板、`data-theme` 切换、以及可编程生成 CSS 文件。

## 安装

```bash
pnpm add @qlover/ui-theme
# 或
npm install @qlover/ui-theme
```

## 特性

- 内置主题：`light`、`dark`、`pink`、`amber`、`forest`、`ocean`
- 通道色值（RGB 分量）+ 派生语义 token（如 `color-primary-bg`）
- 生成 `@layer base` 主题变量与 Tailwind v4 `@theme` 工具类映射
- 支持自定义 `themes`、`tokenMapping`、`cssSelector`
- 可导出预构建 CSS，或在构建脚本中调用 `generateThemeFile` 重新生成
- 可选 PostCSS 插件，在入口样式中自动注入主题 CSS

## 快速开始（Web / Next / Vite）

在 Tailwind 入口中引入完整主题：

```css
/* src/styles/tailwind.css */
@import 'tailwindcss';
@import '@qlover/ui-theme/theme.css';
```

在根节点切换主题（与 `corekit-bridge` 的 `ThemeService` 一致）：

```html
<html data-theme="dark">
```

组件中使用 Tailwind 语义类名：

```tsx
<div className="bg-primary text-primary-text border-primary-border">
  <button className="bg-brand text-on-brand hover:bg-brand-hover">Submit</button>
</div>
```

暗色模式可与 `data-theme` 配合：

```css
@custom-variant dark (&:where(html[data-theme='dark'], html[data-theme='dark'] *));
```

## 预构建 CSS 导出

| 路径 | 说明 |
|------|------|
| `@qlover/ui-theme/theme.css` | 完整主题（`@layer base` + `@theme`），推荐默认使用 |
| `@qlover/ui-theme/theme-layer-base.css` | 仅各主题的 `--fe-*` 通道变量 |
| `@qlover/ui-theme/theme-block.css` | 仅 Tailwind `@theme` 工具类映射 |

安装包后直接使用上述路径；在 monorepo 中需先在本包执行 `pnpm build` 生成 `dist/`。

## 编程式生成 CSS

从主入口导入生成函数：

```typescript
import {
  generateThemeCSS,
  generateLayerBaseCSS,
  generateThemeBlockCSS,
  generateThemeFile,
  generateThemeFiles,
  builtinThemes,
  getDefaultSelector
} from '@qlover/ui-theme';
```

### 生成字符串

```typescript
// 完整 CSS（与 theme.css 等价）
const css = generateThemeCSS({
  defaultTheme: 'light',
  themes: { ...builtinThemes, /* 覆盖或扩展 */ }
});

// 仅 base 层
const base = generateLayerBaseCSS();

// 仅 @theme 块
const block = generateThemeBlockCSS();
```

### 写入文件

```typescript
await generateThemeFile({
  variant: 'full', // 'layer-base' | 'theme-block' | 'full'
  outputPath: './src/styles/theme.generated.css',
  defaultTheme: 'light',
  overwrite: true
});

// 一次生成三种 variant 到目录
await generateThemeFiles({
  outputDir: './dist',
  overwrite: true
});
```

## 自定义配置

`UiThemeOptions` 常用字段：

| 选项 | 默认值 | 说明 |
|------|--------|------|
| `prefix` | `'fe'` | CSS 变量前缀，如 `--fe-color-brand` |
| `defaultTheme` | 第一个主题名 | 默认主题，用于 `:root` 选择器 |
| `themes` | `builtinThemes` | 与内置主题 deep merge |
| `tokenMapping` | `defaultTokenMapping` | Tailwind `@theme` 名 → CSS 值 |
| `cssSelector` | `getDefaultSelector` | `(themeName, isRoot) => string` |

自定义选择器示例（类名主题，适用于部分小程序场景）：

```typescript
await generateThemeFile({
  variant: 'layer-base',
  outputPath: './src/styles/taro-weapp-theme.css',
  cssSelector: (themeName) => `.fe-theme.theme-${themeName}`,
  defaultTheme: 'light',
  overwrite: true
});
```

自定义 token 示例：

```typescript
generateThemeCSS({
  themes: {
    light: {
      'color-brand': '37 99 235'
    }
  },
  tokenMapping: {
    'color-brand': 'rgb(var(--${prefix}-color-brand))'
  }
});
```

模板中的 `${prefix}` 会在生成时替换为实际前缀。

## PostCSS 插件

在 PostCSS 配置中注入主题（默认仅处理以 `/styles/index.css` 或 `/styles/tailwind.css` 结尾的文件）：

```javascript
import themePlugin from '@qlover/ui-theme/plugin';

export default {
  plugins: [
    themePlugin({
      defaultTheme: 'light',
      includePaths: ['/styles/tailwind.css']
    })
  ]
};
```

## 与 ThemeService 配合

`@qlover/corekit-bridge` 的 `ThemeService` 默认使用本包的 `builtinThemes` 作为 `themeTokens`。Web 项目建议：

- `domAttribute: 'data-theme'`
- 样式入口 `@import '@qlover/ui-theme/theme.css'`

## Taro / 微信小程序

H5 端与普通 Web 相同，使用 `theme.css` + `data-theme`。

小程序根节点宜使用 class（如 `fe-theme theme-dark`），可额外生成一份仅含 class 选择器的 base 层 CSS，参见 monorepo 内 `examples/taro-seed/scripts/generate-theme-css.mjs`：

```css
@import '@qlover/ui-theme/theme.css';
@import './themes/taro-weapp-theme.css'; /* pnpm generate:theme */
```

## 开发（monorepo）

```bash
cd packages/ui-theme
pnpm build      # tsup + 生成 dist/*.css
pnpm test
pnpm type-check
```

## 许可证

ISC
